import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { deleteCache, CACHE_KEYS } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/workflow";

/**
 * POST /api/users/approve - Approve or reject user account requests
 */
export async function POST(request: NextRequest) {
  try {
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
    const { userId, action } = body; // action: "approve" or "reject"

    // Validate input
    if (!userId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Provide userId and action (approve/reject)" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user status
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";
    const updatedUser = await db
      .update(users)
      .set({ status: newStatus })
      .where(eq(users.id, userId))
      .returning();

    // Send email notification
    try {
      const emailSubject = action === "approve" 
        ? "Your Account Has Been Approved" 
        : "Account Request Update";

      const emailMessage = action === "approve"
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Account Approved! 🎉</h2>
            <p>Hello ${updatedUser[0].fullName},</p>
            <p>Great news! Your university library account has been approved.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse and search our extensive book collection</li>
              <li>Borrow books online</li>
              <li>Track your borrowed books</li>
              <li>Download borrow receipts</li>
            </ul>
            <p>Visit the library portal to get started!</p>
            <p>Best regards,<br/>University Library Team</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Account Request Status</h2>
            <p>Hello ${updatedUser[0].fullName},</p>
            <p>Thank you for your interest in the university library system.</p>
            <p>Unfortunately, we are unable to approve your account request at this time.</p>
            <p>If you believe this is an error or have questions, please contact the library administration.</p>
            <p>Best regards,<br/>University Library Team</p>
          </div>
        `;

      await sendEmail({
        email: updatedUser[0].email,
        subject: emailSubject,
        message: emailMessage,
      });
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the request if email fails
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.USERS.DETAIL(userId));
    await deleteCache(CACHE_KEYS.USERS.ALL);
    await deleteCache(CACHE_KEYS.ANALYTICS.DASHBOARD);

    return NextResponse.json(
      { 
        user: updatedUser[0], 
        message: `User ${action === "approve" ? "approved" : "rejected"} successfully` 
      },
      { headers }
    );
  } catch (error) {
    console.error("Approve user error:", error);
    return NextResponse.json(
      { error: "Failed to process user approval" },
      { status: 500 }
    );
  }
}
