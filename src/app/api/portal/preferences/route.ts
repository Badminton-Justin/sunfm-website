import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { CALENDAR_VIEWS, type CalendarView } from "@/lib/supabase/types";

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { default_calendar_view } = await request.json();

  if (!CALENDAR_VIEWS.includes(default_calendar_view as CalendarView)) {
    return NextResponse.json(
      { error: "default_calendar_view must be day, week, or month" },
      { status: 400 }
    );
  }

  // Service client, and deliberately not the caller's session: RLS on trainers
  // allows updates only from an owner, and loosening that to "your own row"
  // would also let a trainer set their own role, since RLS gates rows and not
  // columns. This route is the narrow opening — one column, and only ever on
  // the row belonging to the authenticated user.
  const { data, error } = await createServiceClient()
    .from("trainers")
    .update({ default_calendar_view })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ trainer: data });
}
