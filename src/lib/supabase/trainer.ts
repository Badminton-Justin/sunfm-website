import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Trainer } from "./types";

// Loads the signed-in trainer's profile row. Middleware already guarantees
// a Supabase Auth session exists on /portal/* routes, but the trainers row
// itself needs to be seeded by the owner before someone can use the portal.
export async function requireTrainer(): Promise<Trainer> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !trainer) {
    redirect("/portal/login?error=no-trainer-profile");
  }

  return trainer;
}
