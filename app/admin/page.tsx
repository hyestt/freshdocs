import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAuthedValue } from "@/lib/auth";
import AdminDashboard from "./dashboard";

export const dynamic = "force-dynamic";

/** /admin — server-side auth gate, then the dashboard client component. */
export default async function AdminPage() {
  const store = await cookies();
  if (!(await isAuthedValue(store.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}
