import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Update current user to ADMIN
    await db
      .update(users)
      .set({ role: "ADMIN" })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ 
      success: true, 
      message: "Your role has been updated to ADMIN. Please refresh the page." 
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

