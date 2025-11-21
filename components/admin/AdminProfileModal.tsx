"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import config from "@/lib/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AdminProfileModalProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminProfileModal = ({ session, open, onOpenChange }: AdminProfileModalProps) => {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const uploadRef = useRef<any>(null);
  const storageKey = useMemo(() => `avatarUrl:${session?.user?.id}`, [session?.user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem(storageKey);
      if (existing) setAvatarUrl(existing);
    }
  }, [storageKey]);

  useEffect(() => {
    if (open && session?.user?.id) {
      // Fetch user data
      fetch(`/api/user/${session.user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            setUser(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          // Set basic user info from session if fetch fails
          if (session?.user) {
            setUser({
              fullName: session.user.name || "",
              email: session.user.email || "",
              university: "Western Institute of Technology",
            });
          }
        });
    }
  }, [open, session?.user?.id, session?.user?.name, session?.user?.email]);

  const onSuccess = (res: any) => {
    const url = res.filePath;
    setAvatarUrl(url);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, url);
    }
  };

  const userName = session?.user?.name || "Admin";
  const userEmail = session?.user?.email || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] h-[90vh] overflow-hidden bg-light-300 dark:bg-black text-card-foreground dark:text-white border-0 p-0">
        <DialogTitle className="sr-only">
          Admin Profile
        </DialogTitle>
        <DialogDescription className="sr-only">
          Admin profile information
        </DialogDescription>
        
        <div className="relative w-full h-full flex flex-col bg-light-300 dark:bg-black p-6 m-0">
          {/* Dark mode background pattern matching dashboard */}
          <div className="dark:absolute dark:inset-0 dark:pointer-events-none">
            <div 
              className="dark:w-full dark:h-full"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%)',
                backgroundSize: '20px 20px, 100% 100%',
                backgroundPosition: '0 0, 0 0'
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Theme Toggle - Top Right */}
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>

            {/* identity row */}
            <div className="flex items-center gap-4 mb-6">
              <div className="group relative inline-flex items-center">
                <Avatar className="h-16 w-16 overflow-hidden ring-2 ring-gray-300 dark:ring-gray-700">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt="avatar"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="rounded-full bg-amber-100 text-dark-400 dark:bg-amber-100 dark:text-dark-400">
                      {getInitials(userName)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <ImageKitProvider
                  publicKey={config.env.imagekit.publicKey}
                  urlEndpoint={config.env.imagekit.urlEndpoint}
                  authenticator={async () => {
                    const res = await fetch("/api/imagekit");
                    const data = await res.json();
                    return data;
                  }}
                >
                  <IKUpload
                    ref={uploadRef}
                    onSuccess={onSuccess}
                    onError={(e) => console.error(e)}
                    folder="avatars"
                    className="hidden"
                    validateFile={(file: File) => file.size < 10 * 1024 * 1024}
                    useUniqueFileName
                  />
                </ImageKitProvider>

                <button
                  type="button"
                  aria-label="Upload avatar"
                  onClick={() => uploadRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 shadow hover:brightness-110 dark:bg-primary"
                >
                  <span className="block size-3 rounded-full bg-white" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-dark-400 dark:text-gray-300">
                    <span className="inline-block size-1.5 rounded-full bg-blue-500" />
                    Verified Admin
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-dark-400 dark:text-white">
                  {user?.fullName || userName}
                </h2>
                <p className="text-sm text-light-500 dark:text-muted-foreground">
                  {user?.email || userEmail}
                </p>
              </div>
            </div>

            {/* meta */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-light-500 dark:text-muted-foreground mb-1">University</p>
                <p className="text-base font-semibold text-dark-400 dark:text-white">
                  Western Institute of Technology
                </p>
              </div>
              {user?.universityId && (
                <div>
                  <p className="text-sm text-light-500 dark:text-muted-foreground mb-1">Student ID</p>
                  <p className="text-base font-semibold text-dark-400 dark:text-white">
                    {user.universityId}
                  </p>
                </div>
              )}
            </div>

            {/* university card */}
            {user?.universityCard && (
              <div className="flex-1 overflow-hidden rounded-md border border-gray-200 dark:border-[rgba(255,255,255,0.1)]">
                <div className="relative w-full h-full overflow-auto">
                  <Image
                    src={
                      user.universityCard.startsWith("http")
                        ? user.universityCard
                        : `${config.env.imagekit.urlEndpoint}/${user.universityCard.replace(
                            /^\/+/,
                            "",
                          )}`
                    }
                    alt="University Card"
                    width={600}
                    height={400}
                    className="h-auto w-full object-contain"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProfileModal;

