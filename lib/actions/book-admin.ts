"use server";

import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq, desc, asc, or, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteBook(bookId: string) {
  try {
    await db.delete(books).where(eq(books.id, bookId));
    revalidatePath("/admin/books");
    return { success: true };
  } catch (error) {
    console.error("Error deleting book:", error);
    return { success: false, error: "Failed to delete book" };
  }
}

export async function getBooksWithSearch(
  search?: string,
  sortBy: "title" | "date" = "title",
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    let query = db.select().from(books);

    if (search) {
      query = query.where(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`),
          ilike(books.genre, `%${search}%`)
        )!
      );
    }

    if (sortBy === "title") {
      query = sortOrder === "asc"
        ? query.orderBy(asc(books.title))
        : query.orderBy(desc(books.title));
    } else if (sortBy === "date") {
      query = sortOrder === "asc"
        ? query.orderBy(asc(books.createdAt))
        : query.orderBy(desc(books.createdAt));
    }

    const result = await query;
    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { success: false, error: "Failed to fetch books", data: [] };
  }
}

