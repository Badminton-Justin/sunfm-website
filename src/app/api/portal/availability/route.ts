import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { trainer_id, day_of_week, start_time, end_time } = body;

  if (
    !trainer_id ||
    day_of_week === undefined ||
    day_of_week === null ||
    !start_time ||
    !end_time
  ) {
    return NextResponse.json(
      { error: "trainer_id, day_of_week, start_time, and end_time are required" },
      { status: 400 }
    );
  }

  if (day_of_week < 0 || day_of_week > 6) {
    return NextResponse.json(
      { error: "day_of_week must be between 0 and 6" },
      { status: 400 }
    );
  }

  if (end_time <= start_time) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  // RLS enforces that a non-owner trainer can only add their own availability.
  const { data, error } = await supabase
    .from("trainer_availability")
    .insert({ trainer_id, day_of_week, start_time, end_time })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ availability: data });
}
