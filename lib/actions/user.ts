"use server";

import { db } from "@/database/drizzle";
import { users, borrowRecords } from "@/database/schema";
import { eq, sql, desc, asc, or, like, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendRoleUpdateEmail } from "@/lib/email-service";

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await db.update(users).set({ role }).where(eq(users.id, userId));
    revalidatePath("/admin/users");

    // Send role update email (fire and forget)
    sendRoleUpdateEmail(user.email, user.fullName, role).catch((err) =>
      console.error("Failed to send role update email:", err)
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    // First, delete all borrow records associated with this user
    await db.delete(borrowRecords).where(eq(borrowRecords.userId, userId));

    // Then delete the user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function getUsersWithBorrowCounts(
  search?: string,
  sortBy: "name" | "date" = "name",
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let query: any = db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        universityId: users.universityId,
        universityCard: users.universityCard,
        role: users.role,
        createdAt: users.createdAt,
        booksBorrowed: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${borrowRecords}
          WHERE ${borrowRecords.userId} = ${users.id}
        )`.as("booksBorrowed"),
      })
      .from(users);

    if (search) {
      query = query.where(
        or(
          ilike(users.fullName, `%${search}%`),
          ilike(users.email, `%${search}%`),
          sql`CAST(${users.universityId} AS TEXT) LIKE ${`%${search}%`}`
        )!
      );
    }

    if (sortBy === "name") {
      query =
        sortOrder === "asc"
          ? query.orderBy(asc(users.fullName))
          : query.orderBy(desc(users.fullName));
    } else if (sortBy === "date") {
      query =
        sortOrder === "asc"
          ? query.orderBy(asc(users.createdAt))
          : query.orderBy(desc(users.createdAt));
    }

    const result = await query;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users", data: [] };
  }
}

export async function updateUserImage(userId: string, imageUrl: string) {
  try {
    await db.update(users).set({ image: imageUrl }).where(eq(users.id, userId));
    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating user image:", error);
    return { success: false, error: "Failed to update user image" };
  }
}
