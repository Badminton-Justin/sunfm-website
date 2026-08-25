import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // RLS enforces that a non-owner trainer can only delete their own
  // availability. It does that by filtering the row out rather than raising,
  // so a blocked delete looks identical to a successful one — select the
  // deleted rows back and treat "nothing gone" as the refusal it is, instead
  // of telling the page hours were removed that are still in the table.
  const { data, error } = await supabase
    .from("trainer_availability")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data?.length) {
    return NextResponse.json(
      { error: "Those hours are not yours to remove, or are already gone" },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
