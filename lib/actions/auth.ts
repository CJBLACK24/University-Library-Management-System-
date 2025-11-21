"use server";

import { eq } from "drizzle-orm";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { headers } from "next/headers";
import ratelimit from "@/lib/ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "@/lib/workflow";
import config from "@/lib/config";

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">,
) => {
  const email = params.email.trim().toLowerCase();
  const { password } = params;

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.log(error, "Signin error");
    return { success: false, error: "Signin error" };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, universityId, password, universityCard } = params;
  const email = params.email.trim().toLowerCase();

  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) return redirect("/too-fast");

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  // Check duplicate universityId explicitly to give precise feedback
  const existingUniversityId = await db
    .select()
    .from(users)
    .where(eq(users.universityId, universityId))
    .limit(1);

  if (existingUniversityId.length > 0) {
    return { success: false, error: "University ID already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    console.log("Attempting signup with:", {
      email,
      universityId,
      hasUniversityCard: Boolean(universityCard),
    });

    await db.insert(users).values({
      fullName,
      email,
      universityId,
      password: hashedPassword,
      universityCard,
    });

    // Fire-and-forget onboarding workflow; don't block signup on this
    try {
      await workflowClient.trigger({
        url: `/api/workflows/onboarding`,
        body: {
          email,
          fullName,
        },
      });
    } catch (e) {
      console.log("Workflow trigger failed (non-fatal):", e);
    }

    await signInWithCredentials({ email, password });

    return { success: true };
  } catch (error: any) {
    // Provide clearer messages for unique constraint violations
    const message =
      typeof error?.message === "string" ? error.message : "Unknown error";
    const code = (error as any)?.code;
    const constraint = (error as any)?.constraint;

    console.error("Signup error:", { code, constraint, message, error });

    if (code === "23505") {
      if (
        typeof constraint === "string" &&
        constraint.toLowerCase().includes("email")
      ) {
        return { success: false, error: "User already exists" };
      }
      if (
        typeof constraint === "string" &&
        constraint.toLowerCase().includes("university_id")
      ) {
        return { success: false, error: "University ID already exists" };
      }
      return { success: false, error: "Duplicate value violates unique rule" };
    }

    return { success: false, error: "Signup error" };
  }
};

export const logout = async () => {
  await signOut();
};
