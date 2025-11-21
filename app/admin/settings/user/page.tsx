"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";

const AccountSettingsPage = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-6 text-foreground min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-8">Account settings</h1>

      {/* User Settings Card */}
      <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.08)] bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">User settings</h2>
            <p className="text-sm text-muted-foreground">
              Change your email, password, and more inside user settings.
            </p>
          </div>
          <Link href="/admin/settings">
            <Button className="bg-[#EAB308] text-white hover:bg-[#CA8A04] rounded-lg px-5 h-10 flex items-center gap-2">
              User Settings <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
             <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            <h2 className="text-2xl font-semibold">Account information</h2>
          </div>
          <p className="text-lg text-muted-foreground mt-2">
            Basic information about your account.
          </p>
        </div>

        <div className="space-y-5">
          {/* Avatar Row */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-lg">Avatar</span>
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-amber-100 text-dark-400 font-bold text-lg">
                  {getInitials(user?.name || "AD")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-0.5 -right-0.5 bg-[#1a1a1a] p-1 rounded-full border border-[rgba(255,255,255,0.1)] shadow-sm hover:bg-[#252525] transition-colors">
                <Pencil size={10} />
              </button>
            </div>
          </div>

          {/* Role Row */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-lg">Role</span>
            <div className="px-4 py-2 bg-[rgba(255,255,255,0.05)] rounded-lg text-base font-medium flex items-center gap-2 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer">
              Admin
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          {/* Name Row */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-lg">Name <span className="text-muted-foreground font-normal text-base">(full name)</span></span>
            <span className="text-foreground font-semibold text-lg">{user?.name || "Admin User"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
