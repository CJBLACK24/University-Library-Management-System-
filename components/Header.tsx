"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Session } from "next-auth";
import AdminLink from "@/components/AdminLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutDialog } from "@/components/LogoutDialog";

const Header = ({ session }: { session: Session }) => {
  const userName = session?.user?.name || "User";
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  return (
    <>
      <header className="my-10 flex w-full items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3 -ml-2">
          <Image src="/icons/logo.svg" alt="logo" width={37} height={37} />
          <h1 className="text-2xl font-semibold text-white">BookWise</h1>
        </Link>

        <div className="flex items-center gap-6 -mr-2">
          <nav className="flex items-center gap-8">
            <AdminLink />
            <Link href="/" className="text-white hover:text-light-100 dark:text-white dark:hover:text-light-100">
              Home
            </Link>
            <Link href="/library" className="text-white hover:text-light-100 dark:text-white dark:hover:text-light-100">
              Library
            </Link>
            <Link href="/search" className="text-white hover:text-light-100 dark:text-white dark:hover:text-light-100">
              Search
            </Link>
          </nav>

          <ThemeToggle className="text-white hover:text-light-100 dark:text-white dark:hover:text-light-100 hover:bg-white/10 dark:hover:bg-white/10" />

          <Link href="/my-profile" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-dark-300 text-white dark:bg-dark-300 dark:text-white">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-white dark:text-white">{userName}</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsLogoutDialogOpen(true)}
            aria-label="Logout"
            className="p-1"
          >
            <span className="relative inline-block h-5 w-5">
              <Image src="/icons/logout.svg" alt="logout" fill className="object-contain" />
            </span>
          </button>
        </div>
      </header>

      <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
    </>
  );
};

export default Header;
