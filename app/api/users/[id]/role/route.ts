import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { deleteCache, CACHE_KEYS } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/workflow";

/**
 * PATCH /api/users/[id]/role - Change user role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 }
      );
    }

    // Get current user data
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!currentUser[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    const updatedUser = await db
      .update(users)
      .set({ role: role as "USER" | "ADMIN" })
      .where(eq(users.id, id))
      .returning();

    // Send email notification about role change
    try {
      await sendEmail({
        email: updatedUser[0].email,
        subject: "Your Role Has Been Updated",
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Role Update Notification</h2>
            <p>Hello ${updatedUser[0].fullName},</p>
            <p>Your account role has been updated to: <strong>${role}</strong></p>
            ${role === "ADMIN" 
              ? "<p>You now have administrative privileges to manage the library system.</p>" 
              : "<p>Your account has been set to regular user privileges.</p>"}
            <p>If you have any questions, please contact the library administrator.</p>
            <p>Best regards,<br/>University Library Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send role update email:", emailError);
      // Don't fail the request if email fails
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.USERS.DETAIL(id));
    await deleteCache(CACHE_KEYS.USERS.ALL);

    return NextResponse.json(
      { 
        user: updatedUser[0], 
        message: `User role updated to ${role} successfully` 
      },
      { headers }
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
