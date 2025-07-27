import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { user_id, vehicle_id, start_date, end_date, total_price } = body;
  if (!user_id || !vehicle_id || !start_date || !end_date || !total_price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Insert booking
  const { data, error } = await supabase.from("bookings").insert([
    {
      user_id,
      vehicle_id,
      start_date,
      end_date,
      total_price,
      status: "pending",
    },
  ]).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ booking: data }, { status: 201 });
}

// GET /api/bookings - List bookings (optionally filter by user_id or vehicle_id)
export async function GET(request: NextRequest) {
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