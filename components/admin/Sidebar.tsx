"use client";

import Image from "next/image";
import { adminSideBarLinks } from "@/constants";
import Link from "next/link";
import { cn, getInitials } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutDialog } from "@/components/LogoutDialog";

interface SidebarProps {
  session: Session;
  isCollapsed: boolean;
}

const Sidebar = ({ session, isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);



  return (
    <>
    <TooltipProvider delayDuration={200}>
      <motion.div 
        initial={false}
        animate={{
          width: isCollapsed ? "80px" : "256px"
        }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="admin-sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="logo">
            <div className="flex items-center gap-2 flex-1">
              <Image
                src="/icons/admin/logo.svg"
                alt="logo"
                height={37}
                width={37}
              />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-primary-admin dark:text-primary-admin overflow-hidden whitespace-nowrap"
                  >
                    BookWise
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 flex-1">
            {adminSideBarLinks.map((link) => {
              const isSelected =
                (link.route !== "/admin" &&
                  pathname.includes(link.route) &&
                  link.route.length > 1) ||
                pathname === link.route;

              return (
                <Tooltip key={link.route}>
                  <TooltipTrigger asChild>
                    <Link href={link.route}>
                      <div
                        className={cn(
                          "link",
                          isSelected && "bg-primary-admin shadow-sm",
                          isCollapsed && "justify-center"
                        )}
                      >
                        <div className="relative size-5 flex-shrink-0">
                          <Image
                            src={link.img}
                            alt="icon"
                            fill
                            className={`${isSelected ? "brightness-0 invert" : ""}  object-contain`}
                          />
                        </div>

                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.p 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                isSelected ? "text-white" : "text-dark-400 dark:text-white",
                                "overflow-hidden whitespace-nowrap"
                              )}
                            >
                              {link.text}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="font-medium bg-dark-200 dark:bg-dark-200 text-white border-dark-300">
                      <p>{link.text}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                suppressHydrationWarning
                className={cn(
                  "flex w-full flex-row items-center gap-3 rounded-xl bg-light-300 dark:bg-[#111111] py-3 cursor-pointer hover:opacity-90 transition-opacity",
                  isCollapsed 
                    ? "px-2 justify-center border-0" 
                    : "px-4 border border-light-400 dark:border-[rgba(255,255,255,0.1)] dark:shadow-none"
                )}
              >
                <Avatar className={cn(
                  "h-10 w-10 flex-shrink-0",
                  isCollapsed && "ring-0 border-0"
                )}>
                  <AvatarFallback className={cn(
                    "bg-amber-100 dark:bg-amber-100 text-dark-400 dark:text-dark-400",
                    isCollapsed && "font-bold"
                  )}>
                    {getInitials(session?.user?.name || "IN")}
                  </AvatarFallback>
                </Avatar>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex flex-col flex-1 min-w-0 text-left">
                        <p className="font-semibold text-sm text-dark-400 dark:text-white truncate">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-light-500 dark:text-muted-foreground truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-light-500 dark:text-muted-foreground flex-shrink-0 ml-auto"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#111111] border dark:border-[rgba(255,255,255,0.1)] rounded-lg"
            >
              <Link href="/admin/settings">
                <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-[#1a1a1a]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  User settings
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-[#1a1a1a] justify-between">
                <div className="flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                  </svg>
                  Theme
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200 dark:bg-[rgba(255,255,255,0.1)]" />
              
              <DropdownMenuItem
                onClick={() => setIsLogoutDialogOpen(true)}
                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-[#1a1a1a] text-red-400 dark:text-red-400 focus:text-red-500 dark:focus:text-red-500"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      </TooltipProvider>


      <LogoutDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen} />
    </>
  );
};

export default Sidebar;