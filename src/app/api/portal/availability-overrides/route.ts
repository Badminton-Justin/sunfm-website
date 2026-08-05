import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseDateKey, toDateKey } from "@/lib/portal/availability";

// Sibling of /api/portal/availability rather than a child: that route already
// has an [id] segment, and "overrides" sitting next to it would read as an id.
const MAX_RANGE_DAYS = 366;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { trainer_id, from, to, start_time, end_time, note } = body;

  if (!trainer_id || !from) {
    return NextResponse.json(
      { error: "trainer_id and from are required" },
      { status: 400 }
    );
  }

  const startDate = parseDateKey(from);
  const endDate = parseDateKey(to || from);

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Dates must be YYYY-MM-DD" },
      { status: 400 }
    );
  }

  if (endDate < startDate) {
    return NextResponse.json(
      { error: "The end date can't be before the start date" },
      { status: 400 }
    );
  }

  const hasHours = !!start_time && !!end_time;
  if (hasHours && end_time <= start_time) {
    return NextResponse.json(
      { error: "end_time must be after start_time" },
      { status: 400 }
    );
  }

  // A vacation is one row per date, so an unbounded range would be an
  // unbounded insert.
  const days =
    Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
  if (days > MAX_RANGE_DAYS) {
    return NextResponse.json(
      { error: "That range is longer than a year" },
      { status: 400 }
    );
  }

  const rows = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return {
      trainer_id,
      date: toDateKey(d),
      start_time: hasHours ? start_time : null,
      end_time: hasHours ? end_time : null,
      note: note || null,
    };
  });

  // Replacing the date outright is the table's whole rule, so clear anything
  // already covering these dates instead of layering another row on top.
  // RLS enforces own-or-owner on both statements.
  const { error: clearError } = await supabase
    .from("availability_overrides")
    .delete()
    .eq("trainer_id", trainer_id)
    .gte("date", rows[0].date)
    .lte("date", rows[rows.length - 1].date);

  if (clearError) {
    return NextResponse.json({ error: clearError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("availability_overrides")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ overrides: data ?? [] });
}

// Clears overrides across a date range — the "back to normal hours" action.
// Ranges, not single dates, so removing a booked vacation is one request
// rather than one per day.
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(request.url);
  const trainerId = url.searchParams.get("trainer_id");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to") ?? from;

  if (!trainerId || !from || !to) {
    return NextResponse.json(
      { error: "trainer_id and from are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("availability_overrides")
    .delete()
    .eq("trainer_id", trainerId)
    .gte("date", from)
    .lte("date", to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
