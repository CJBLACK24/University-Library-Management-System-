"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Pencil, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const UserSettingsPage = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full max-w-8xl mx-auto space-y-11 text-foreground pb-10 pt-6 px-6">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold mb-6">User settings</h1>

        {/* Account Settings Banner */}
        <div className="p-5 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
             <div className="space-y-1">
                <h2 className="text-xl font-semibold">Account settings</h2>
                <p className="text-lg text-muted-foreground">
                  Configure credentials, secrets, and more in account settings.
                </p>
              </div>
              <Link href="/admin/settings/user">
                <Button className="bg-[#EAB308] text-white hover:bg-[#CA8A04] rounded-full px-5 h-9 flex items-center gap-2 text-base">
                  Account Settings 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
        </div>

        {/* About You Section */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] space-y-6">
            {/* Section Title */}
            <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h2 className="text-2xl font-semibold">About you</h2>
            </div>

            {/* Avatar and Gravatar Info */}
            <div className="flex items-start gap-4">
                <div className="relative">
                    <Avatar className="h-14 w-14">
                        <AvatarImage src={user?.image || ""} />
                        <AvatarFallback className="bg-amber-100 text-dark-400 text-lg font-bold">
                        {getInitials(user?.name || "CJ")}
                        </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-0.5 -right-0.5 bg-[#1a1a1a] p-1 rounded-full border border-[rgba(255,255,255,0.1)] shadow-sm hover:bg-[#252525] transition-colors">
                        <Pencil size={10} className="text-muted-foreground" />
                    </button>
                </div>
                <p className="text-lg text-muted-foreground flex-1 pt-1 leading-relaxed">
                    If you have <a href="#" className="text-blue-500 hover:underline">Gravatar</a> set for {user?.email || "duquechristianjohncalderon@gmail.com"} it will be displayed in the absence of an uploaded avatar.
                </p>
            </div>

            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-lg font-medium text-foreground block">First name</label>
                    <Input 
                      defaultValue="CJBLACK" 
                      placeholder="Enter first name"
                      className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] text-foreground text-lg h-11 rounded-lg placeholder:text-[rgba(255,255,255,0.15)] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-lg font-medium text-foreground block">Last name</label>
                    <Input 
                      defaultValue="DEV24" 
                      placeholder="Enter last name"
                      className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] text-foreground text-lg h-11 rounded-lg placeholder:text-[rgba(255,255,255,0.15)] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                    />
                </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end -mx-6 -mb-6 px-6 pb-5 pt-4 bg-[rgba(255,255,255,0.02)] rounded-b-xl mt-6">
                <Button className="bg-[#EAB308] text-white hover:bg-[#CA8A04] px-8 h-9 rounded-lg text-base font-medium">Save</Button>
            </div>
        </div>

        {/* Email Section */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] space-y-4">
             <div className="flex items-center gap-2.5">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                   <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                   <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                 </svg>
                <h2 className="text-2xl font-semibold">Email</h2>
            </div>
             <p className="text-lg text-muted-foreground">Keep your email address up-to-date in case you need to recover your account.</p>
            
            <div className="space-y-4">
                <Input 
                  defaultValue={user?.email || "duquechristianjohncalderon@gmail.com"}
                  className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] text-foreground text-lg h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                />
                
                {/* Email Verification Status */}
                <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 size={20} />
                    <span className="text-lg font-medium">Your email is verified</span>
                </div>

                <div className="flex justify-end">
                    <Button className="bg-[#EAB308] text-white hover:bg-[#CA8A04] px-6 h-9 rounded-lg text-base font-medium">Save Email</Button>
                </div>
            </div>
        </div>

        {/* Change Password Section */}
        <div className="p-6 rounded-xl bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] space-y-5">
             <div className="flex items-center gap-2.5">
                 <div className="p-1.5 rounded-md bg-transparent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                 </div>
                <h2 className="text-2xl font-semibold">Change password</h2>
            </div>
            
            <div className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                    <label className="text-lg font-medium text-foreground block">New password</label>
                    <div className="relative">
                        <Input 
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] text-foreground text-lg h-11 rounded-lg pr-10 placeholder:text-[rgba(255,255,255,0.15)] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Password Strength */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-base font-medium">Password strength</span>
                        <div className="flex gap-1">
                            <div className="h-1 w-6 bg-muted rounded-full"></div>
                            <div className="h-1 w-6 bg-muted rounded-full"></div>
                            <div className="h-1 w-6 bg-muted rounded-full"></div>
                            <div className="h-1 w-6 bg-muted rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-lg font-medium text-foreground block">Confirm password</label>
                    <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.15)] text-foreground text-lg h-11 rounded-lg pr-10 placeholder:text-[rgba(255,255,255,0.15)] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <Button className="bg-[#EAB308] text-white hover:bg-[#CA8A04] px-6 h-9 rounded-lg text-base font-medium">Change</Button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default UserSettingsPage;
