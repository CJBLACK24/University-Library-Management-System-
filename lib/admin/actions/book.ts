"use server";

import { books } from "@/database/schema";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const createBook = async (params: BookParams) => {
  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
      })
      .returning();

    revalidatePath("/admin/books");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while creating the book",
    };
  }
};

export const updateBook = async (bookId: string, params: BookParams) => {
  try {
    const [existingBook] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!existingBook) {
      return {
        success: false,
        message: "Book not found",
      };
    }

    // Calculate new available copies based on the difference in total copies
    const totalCopiesDiff = params.totalCopies - existingBook.totalCopies;
    const newAvailableCopies = Math.max(
      existingBook.availableCopies + totalCopiesDiff,
      0
    );

    const updatedBook = await db
      .update(books)
      .set({
        ...params,
        availableCopies: newAvailableCopies,
      })
      .where(eq(books.id, bookId))
      .returning();

    revalidatePath("/admin/books");
    revalidatePath(`/admin/books/${bookId}/edit`);
    revalidatePath(`/books/${bookId}`);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBook[0])),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "An error occurred while updating the book",
    };
  }
};
