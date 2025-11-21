"use server";

import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq, desc, asc, or, ilike, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendAccountApprovalEmail, sendAccountRejectionEmail } from "@/lib/email-service";

export async function approveAccountRequest(userId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db
      .update(users)
      .set({ status: "APPROVED" })
      .where(eq(users.id, userId));
    
    revalidatePath("/admin/account-requests");
    
    // Send approval email (fire and forget)
    sendAccountApprovalEmail(user.email, user.fullName).catch((err) =>
      console.error("Failed to send approval email:", err)
    );
    
    return { success: true };
  } catch (error) {
    console.error("Error approving account request:", error);
    return { success: false, error: "Failed to approve account request" };
  }
}

export async function rejectAccountRequest(userId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, userId));
    
    revalidatePath("/admin/account-requests");
    
    // Send rejection email (fire and forget)
    sendAccountRejectionEmail(user.email, user.fullName).catch((err) =>
      console.error("Failed to send rejection email:", err)
    );
    
    return { success: true };
  } catch (error) {
    console.error("Error rejecting account request:", error);
    return { success: false, error: "Failed to reject account request" };
  }
}

export async function getAccountRequests(
  search?: string,
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let query = db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
        createdAt: users.createdAt,
      })
      .from(users);

    const statusCondition = eq(users.status, "PENDING");
    
    if (search) {
      const searchCondition = or(
        ilike(users.fullName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        sql`CAST(${users.universityId} AS TEXT) LIKE ${`%${search}%`}`
      )!;
      query = query.where(and(statusCondition, searchCondition)!);
    } else {
      query = query.where(statusCondition);
    }

    query = sortOrder === "asc"
      ? query.orderBy(asc(users.createdAt))
      : query.orderBy(desc(users.createdAt));

    const result = await query;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching account requests:", error);
    return { success: false, error: "Failed to fetch account requests", data: [] };
  }
}

