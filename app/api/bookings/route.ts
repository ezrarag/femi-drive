// COMMENTED OUT: All booking API functionality has been replaced with direct Wheelbase redirects
// import { NextRequest, NextResponse } from "next/server"
// import { cookies } from "next/headers"
// TODO: Implement authentication when backend is ready
// import { sendSMS } from "@/lib/twilio"

// async function parseBody(request: NextRequest) {
//   try {
//     return await request.json()
//   } catch {
//     return null
//   }
// }

// // POST /api/bookings - Create a new booking
// export async function POST(request: NextRequest) {
//   console.log("Booking API called")
  
//   // Get the user from the session
//   const cookieStore = await cookies()
  
//   // TODO: Implement Supabase client when backend is ready
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll()
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//           )
//           } catch {
//             // The `setAll` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//       },
//     }
//   )

//   // TODO: Implement user authentication when backend is ready
  
//   if (userError) {
//     console.error("User auth error:", userError)
//     return NextResponse.json({ error: "Authentication error" }, { status: 401 });
//   }
  
//   if (!user) {
//     console.log("No user found in session")
//     return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });
//   }

//   console.log("User authenticated:", user.email)

//   const body = await parseBody(request);
//   if (!body) {
//     console.log("Invalid JSON body")
//     return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//   }
  
//   console.log("Request body:", body)
  
//   const { vehicle_id, start_date, end_date, total_price } = body;
//   if (!vehicle_id || !start_date || !end_date || !total_price) {
//     console.log("Missing required fields:", { vehicle_id, start_date, end_date, total_price })
//     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//   }
  
//   console.log("Creating booking for user:", user.id, "vehicle:", vehicle_id)
  
//   // Insert booking with the authenticated user's ID
//   // TODO: Implement database operations when backend is ready.from("bookings").insert([
//     {
//       user_id: user.id,
//       vehicle_id,
//       start_date,
//       end_date,
//       total_price,
//       status: "confirmed", // Set to confirmed since payment is processed
//     },
//   ]);
  
//   if (error) {
//     console.error("Database error:", error)
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
  
//   console.log("Booking created successfully:", data)
  
//   // Send SMS notification to 404-973-9860
//   try {
//     const smsMessage = `🚗 New Booking Confirmed!
    
// Vehicle ID: ${vehicle_id}
// Start Date: ${start_date}
// End Date: ${end_date}
// Total Price: $${total_price}
// Customer: ${user.email}

// Booking ID: ${data.id}
// Status: Confirmed

// Thank you for choosing Femi Leasing!`;

//     const smsResult = await sendSMS("+14049739860", smsMessage);
    
//     if (smsResult.success) {
//       console.log("SMS notification sent successfully:", smsResult.sid);
//     } else {
//       console.warn("SMS notification failed:", smsResult.error);
//     }
//   } catch (smsError) {
//     console.warn("SMS notification error:", smsError);
//     // Don't fail the booking if SMS fails
//   }
  
//   return NextResponse.json({ booking: data }, { status: 201 });
// }

// // GET /api/bookings - Get all bookings for the authenticated user
// export async function GET(request: NextRequest) {
//   const cookieStore = await cookies()
  
//   // TODO: Implement Supabase client when backend is ready
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll()
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//           )
//           } catch {
//             // The `setAll` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//       },
//     }
//   )

//   // TODO: Implement user authentication when backend is ready
  
//   if (userError || !user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   // TODO: Implement database operations when backend is ready
//     .from("bookings")
//     .select(`
//       *,
//       vehicles (
//         make,
//         model,
//         year,
//         image_url
//       )
//     `)
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false });

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json({ bookings: data });
// }

// // PUT /api/bookings - Update a booking (for cancellations, status changes, etc.)
// export async function PUT(request: NextRequest) {
//   const cookieStore = await cookies()
  
//   // TODO: Implement Supabase client when backend is ready
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll()
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//           )
//           } catch {
//             // The `setAll` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//       },
//     }
//   )

//   // TODO: Implement user authentication when backend is ready
  
//   if (userError || !user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await parseBody(request);
//   if (!body) {
//     return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//   }
  
//   const { booking_id, status, action } = body;
//   if (!booking_id || !status || !action) {
//     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//   }
  
//   // Update the booking
//   // TODO: Implement database operations when backend is ready
//     .from("bookings")
//     .update({ status, updated_at: new Date().toISOString() })
//     .eq("id", booking_id)
//     .select()
//     .single();
  
//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
  
//   // Send SMS notification for status changes
//   try {
//     const smsMessage = `🚗 Booking Status Updated!
    
// Booking ID: ${booking_id}
// New Status: ${status}
// Action: ${action}
// Updated At: ${new Date().toLocaleString()}

// Thank you for choosing Femi Leasing!`;

//     const smsResult = await sendSMS("+14049739860", smsMessage);
    
//     if (smsResult.success) {
//       console.log("SMS notification sent successfully:", smsResult.sid);
//     } else {
//       console.warn("SMS notification failed:", smsResult.error);
//     }
//   } catch (smsError) {
//     console.warn("SMS notification error:", smsError);
//     // Don't fail the update if SMS fails
//   }
  
//   return NextResponse.json({ booking: data });
// }

// COMMENTED OUT: All booking API functionality has been replaced with direct Wheelbase redirects
// The system now redirects users directly to Wheelbase checkout URLs instead of processing bookings internally