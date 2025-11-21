import React, { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import "@/styles/admin.css";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { checkAdminPasscode } from "@/lib/actions/admin";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const userRole = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((res) => res[0]?.role);

  const isAdmin = userRole === "ADMIN";
  const hasPasscodeAccess = await checkAdminPasscode();

  if (!isAdmin && !hasPasscodeAccess) redirect("/");

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  );
};
export default Layout;
