"use client";

import React, { ReactNode, useState } from "react";
import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

interface AdminLayoutClientProps {
  children: ReactNode;
  session: Session;
}

const AdminLayoutClient = ({ children, session }: AdminLayoutClientProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isSettingsPage = pathname === "/admin/settings" || pathname === "/admin/settings/user";

  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar session={session} isCollapsed={isSidebarCollapsed} />

      <div className="admin-container">
        {!isSettingsPage && (
          <Header 
            session={session} 
            onToggleSidebar={toggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        )}
        {children}
      </div>
    </main>
  );
};

export default AdminLayoutClient;
