"use client";

import { Session } from "next-auth";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, PanelLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

interface HeaderProps {
  session: Session;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Header = ({ session, onToggleSidebar, isSidebarCollapsed }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <header className="admin-header">
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-2.5 rounded-lg hover:bg-light-300 dark:hover:bg-[#111111] transition-colors border border-transparent dark:border-[rgba(255,255,255,0.1)]"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="w-5 h-5 text-dark-400 dark:text-white" />
        </motion.button>

        <div>
          <h2 className="text-2xl font-semibold text-dark-400 dark:text-white">
            Welcome, {session?.user?.name}
          </h2>
          <p className="text-base text-slate-500 dark:text-muted-foreground">
            Monitor all of your projects and tasks here.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
      <div className="admin-search">
        <Search className="w-5 h-5 text-slate-500 dark:text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search users, books by title, author, or genre"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="admin-search_input"
        />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
export default Header;
