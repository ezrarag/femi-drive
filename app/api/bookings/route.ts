import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendSMS } from "@/lib/twilio";

// Helper: parse JSON body
async function parseBody(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  console.log("Booking API called")
  
  // Get the user from the session
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error("User auth error:", userError)
    return NextResponse.json({ error: "Authentication error" }, { status: 401 });
  }
  
  if (!user) {
    console.log("No user found in session")
    return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });
  }

  console.log("User authenticated:", user.email)

  const body = await parseBody(request);
  if (!body) {
    console.log("Invalid JSON body")
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  
  console.log("Request body:", body)
  
  const { vehicle_id, start_date, end_date, total_price } = body;
  if (!vehicle_id || !start_date || !end_date || !total_price) {
    console.log("Missing required fields:", { vehicle_id, start_date, end_date, total_price })
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  
  console.log("Creating booking for user:", user.id, "vehicle:", vehicle_id)
  
  // Insert booking with the authenticated user's ID
  const { data, error } = await supabase.from("bookings").insert([
    {
      user_id: user.id,
      vehicle_id,
      start_date,
      end_date,
      total_price,
      status: "confirmed", // Set to confirmed since payment is processed
    },
  ]).select().single();
  
  if (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  console.log("Booking created successfully:", data)
  
  // Send SMS notification to 404-973-9860
  try {
    const smsMessage = `🚗 New Booking Confirmed!
    
Vehicle ID: ${vehicle_id}
Start Date: ${start_date}
End Date: ${end_date}
Total Price: $${total_price}
Customer: ${user.email}

Booking ID: ${data.id}
Status: Confirmed

Thank you for choosing Femi Leasing!`;

    const smsResult = await sendSMS("+14049739860", smsMessage);
    
    if (smsResult.success) {
      console.log("SMS notification sent successfully:", smsResult.sid);
    } else {
      console.warn("SMS notification failed:", smsResult.error);
    }
  } catch (smsError) {
    console.warn("SMS notification error:", smsError);
    // Don't fail the booking if SMS fails
  }
  
  return NextResponse.json({ booking: data }, { status: 201 });
}

// GET /api/bookings - List bookings (optionally filter by user_id or vehicle_id)
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const vehicle_id = searchParams.get("vehicle_id");
  let query = supabase.from("bookings").select("*", { count: "exact" });
  if (user_id) query = query.eq("user_id", user_id);
  if (vehicle_id) query = query.eq("vehicle_id", vehicle_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

// PUT /api/bookings - Update a booking (for cancellations, status changes, etc.)
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  
  const { booking_id, status, action } = body;
  if (!booking_id || !status || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  
  // Update the booking
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", booking_id)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Send SMS notification for status changes
  try {
    let smsMessage = "";
    
    if (action === "cancelled") {
      smsMessage = `❌ Booking Cancelled!
      
Booking ID: ${booking_id}
Status: Cancelled
Customer: ${user.email}
Action: ${action}

Please review and update inventory accordingly.`;
    } else if (action === "updated") {
      smsMessage = `📝 Booking Updated!
      
Booking ID: ${booking_id}
New Status: ${status}
Customer: ${user.email}
Action: ${action}

Please review the changes.`;
    }
    
    if (smsMessage) {
      const smsResult = await sendSMS("+14049739860", smsMessage);
      
      if (smsResult.success) {
        console.log("SMS notification sent successfully:", smsResult.sid);
      } else {
        console.warn("SMS notification failed:", smsResult.error);
      }
    }
  } catch (smsError) {
    console.warn("SMS notification error:", smsError);
    // Don't fail the update if SMS fails
  }
  
  return NextResponse.json({ booking: data });
}