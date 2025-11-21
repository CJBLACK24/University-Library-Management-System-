"use server";

import { sendEmail } from "@/lib/workflow";
import {
  WelcomeEmailTemplate,
  BookBorrowedEmailTemplate,
  BookDueReminderEmailTemplate,
  BookReceiptEmailTemplate,
  BookReturnEmailTemplate,
  AccountApprovalEmailTemplate,
  AccountRejectionEmailTemplate,
  RoleUpdateEmailTemplate,
  InactivityReminderEmailTemplate,
  CheckInCongratsEmailTemplate,
} from "@/lib/email-templates";

export async function sendWelcomeEmail(email: string, fullName: string) {
  try {
    const html = WelcomeEmailTemplate({ studentName: fullName });
    await sendEmail({
      email,
      subject: "Welcome to BookWise!",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "Failed to send welcome email" };
  }
}

export async function sendBookBorrowedEmail(
  email: string,
  fullName: string,
  bookTitle: string,
  borrowDate: string,
  dueDate: string
) {
  try {
    const html = BookBorrowedEmailTemplate({
      studentName: fullName,
      bookTitle,
      borrowDate,
      dueDate,
    });
    await sendEmail({
      email,
      subject: `You've Borrowed ${bookTitle}!`,
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending book borrowed email:", error);
    return { success: false, error: "Failed to send book borrowed email" };
  }
}

export async function sendBookDueReminderEmail(
  email: string,
  fullName: string,
  bookTitle: string,
  dueDate: string
) {
  try {
    const html = BookDueReminderEmailTemplate({
      studentName: fullName,
      bookTitle,
      dueDate,
    });
    await sendEmail({
      email,
      subject: `Reminder: ${bookTitle} is Due Soon!`,
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending due reminder email:", error);
    return { success: false, error: "Failed to send due reminder email" };
  }
}

export async function sendBookReceiptEmail(
  email: string,
  fullName: string,
  bookTitle: string,
  borrowDate: string,
  dueDate: string,
  receiptUrl: string
) {
  try {
    const html = BookReceiptEmailTemplate({
      studentName: fullName,
      bookTitle,
      borrowDate,
      dueDate,
      receiptUrl,
    });
    await sendEmail({
      email,
      subject: `Your Receipt for ${bookTitle} is Ready!`,
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return { success: false, error: "Failed to send receipt email" };
  }
}

export async function sendBookReturnEmail(
  email: string,
  fullName: string,
  bookTitle: string
) {
  try {
    const html = BookReturnEmailTemplate({
      studentName: fullName,
      bookTitle,
    });
    await sendEmail({
      email,
      subject: `Thank You for Returning ${bookTitle}!`,
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending return email:", error);
    return { success: false, error: "Failed to send return email" };
  }
}

export async function sendAccountApprovalEmail(
  email: string,
  fullName: string
) {
  try {
    const html = AccountApprovalEmailTemplate({ studentName: fullName });
    await sendEmail({
      email,
      subject: "Your BookWise Account Has Been Approved!",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending approval email:", error);
    return { success: false, error: "Failed to send approval email" };
  }
}

export async function sendAccountRejectionEmail(
  email: string,
  fullName: string
) {
  try {
    const html = AccountRejectionEmailTemplate({ studentName: fullName });
    await sendEmail({
      email,
      subject: "BookWise Account Request Update",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending rejection email:", error);
    return { success: false, error: "Failed to send rejection email" };
  }
}

export async function sendRoleUpdateEmail(
  email: string,
  fullName: string,
  newRole: string
) {
  try {
    const html = RoleUpdateEmailTemplate({
      studentName: fullName,
      newRole,
    });
    await sendEmail({
      email,
      subject: "Your BookWise Role Has Been Updated!",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending role update email:", error);
    return { success: false, error: "Failed to send role update email" };
  }
}

export async function sendInactivityReminderEmail(
  email: string,
  fullName: string
) {
  try {
    const html = InactivityReminderEmailTemplate({ studentName: fullName });
    await sendEmail({
      email,
      subject: "We Miss You at BookWise!",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending inactivity reminder:", error);
    return { success: false, error: "Failed to send inactivity reminder" };
  }
}

export async function sendCheckInCongratsEmail(
  email: string,
  fullName: string
) {
  try {
    const html = CheckInCongratsEmailTemplate({ studentName: fullName });
    await sendEmail({
      email,
      subject: "Congratulations on Reaching a New Milestone!",
      message: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending check-in congrats email:", error);
    return { success: false, error: "Failed to send check-in congrats email" };
  }
}

