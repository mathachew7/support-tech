import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

// Post-login router: sends each signed-in user to their role's home.
export default async function DashboardRouter() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role) redirect("/login");
  if (role === "admin") redirect("/admin");
  if (role === "provider") redirect("/providers/dashboard");
  redirect("/seekers/dashboard");
}
