import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  //Redirect admin to admin panel
  if (user.publicMetadata?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      {children}
    </div>
  );
}
