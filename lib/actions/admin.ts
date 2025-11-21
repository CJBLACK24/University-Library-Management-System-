"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSCODE = "112425";
const ADMIN_COOKIE_NAME = "admin_passcode_verified";
const ADMIN_COOKIE_VALUE = "verified";

export async function verifyAdminPasscode(passcode: string) {
  if (passcode === ADMIN_PASSCODE) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Incorrect passcode" };
}

export async function checkAdminPasscode() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  return adminCookie?.value === ADMIN_COOKIE_VALUE;
}

