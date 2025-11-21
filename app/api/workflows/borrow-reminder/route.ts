import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/database/drizzle";
import { borrowRecords, books, users } from "@/database/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendBookDueReminderEmail } from "@/lib/email-service";
import dayjs from "dayjs";

type InitialData = {
  borrowRecordId: string;
  userId: string;
  bookId: string;
  dueDate: string;
};

export const { POST } = serve<InitialData>(async (context) => {
  const { borrowRecordId, userId, bookId, dueDate } = context.requestPayload;

  // Get user and book details
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [book] = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1);

  if (!user || !book) {
    return;
  }

  const dueDateObj = dayjs(dueDate);
  const now = dayjs();

  // Send reminder 3 days before due date
  const daysUntilDue = dueDateObj.diff(now, "day");
  if (daysUntilDue > 3) {
    await context.sleep("wait-until-3-days-before", (daysUntilDue - 3) * 24 * 60 * 60);
  }

  // Check if book is still borrowed
  const [record] = await db
    .select()
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.id, borrowRecordId),
        eq(borrowRecords.status, "BORROWED")
      )!
    )
    .limit(1);

  if (!record) {
    return; // Book already returned
  }

  // Send reminder 3 days before
  await context.run("send-3-days-before", async () => {
    await sendBookDueReminderEmail(
      user.email,
      user.fullName,
      book.title,
      dueDateObj.format("MMMM D, YYYY")
    );
  });

  // Wait until due date
  const daysUntilDueNow = dueDateObj.diff(dayjs(), "day");
  if (daysUntilDueNow > 0) {
    await context.sleep("wait-until-due-date", daysUntilDueNow * 24 * 60 * 60);
  }

  // Check again if still borrowed
  const [recordOnDue] = await db
    .select()
    .from(borrowRecords)
    .where(
      and(
        eq(borrowRecords.id, borrowRecordId),
        eq(borrowRecords.status, "BORROWED")
      )!
    )
    .limit(1);

  if (recordOnDue) {
    // Send reminder on due date
    await context.run("send-on-due-date", async () => {
      await sendBookDueReminderEmail(
        user.email,
        user.fullName,
        book.title,
        dueDateObj.format("MMMM D, YYYY")
      );
    });

    // Wait 1 day after due date
    await context.sleep("wait-1-day-after", 24 * 60 * 60);

    // Check one more time
    const [recordAfterDue] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.id, borrowRecordId),
          eq(borrowRecords.status, "BORROWED")
        )!
      )
      .limit(1);

    if (recordAfterDue) {
      // Send reminder after due date
      await context.run("send-after-due-date", async () => {
        await sendBookDueReminderEmail(
          user.email,
          user.fullName,
          book.title,
          dueDateObj.format("MMMM D, YYYY")
        );
      });
    }
  }
});

