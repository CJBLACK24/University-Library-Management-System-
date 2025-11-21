import React from "react";

interface EmailTemplateProps {
  studentName: string;
  bookTitle?: string;
  borrowDate?: string;
  dueDate?: string;
  receiptId?: string;
  receiptUrl?: string;
}

// Welcome Email Template
export const WelcomeEmailTemplate = ({ studentName }: { studentName: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Welcome to BookWise, Your Reading Companion!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Welcome to BookWise! We're excited to have you join our community of book enthusiasts. 
      Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Get started by logging in to your account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Login to BookWise
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Happy reading,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Book Borrowed Confirmation Email
export const BookBorrowedEmailTemplate = ({ studentName, bookTitle, borrowDate, dueDate }: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">You've Borrowed a Book!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      You've successfully borrowed ${bookTitle}. Here are the details:
    </p>
    
    <ul style="color: white; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
      <li>Borrowed On: <strong>${borrowDate}</strong></li>
      <li>Due Date: <strong>${dueDate}</strong></li>
    </ul>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Enjoy your reading, and don't forget to return the book on time!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-profile" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        View Borrowed Books
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Happy reading,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Book Due Reminder Email
export const BookDueReminderEmailTemplate = ({ studentName, bookTitle, dueDate }: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Reminder: ${bookTitle} is Due Soon!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Just a reminder that <span style="color: #F0D9B5; font-weight: bold;">${bookTitle}</span> is due for return on 
      <span style="color: #F0D9B5; font-weight: bold;">${dueDate}</span>. 
      Kindly return it on time to avoid late fees.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      If you're still reading, you can renew the book in your account.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-profile" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Renew Book Now
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Keep reading,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Book Receipt Generated Email
export const BookReceiptEmailTemplate = ({ studentName, bookTitle, borrowDate, dueDate, receiptUrl }: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Your Receipt for ${bookTitle} is Ready!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Your receipt for borrowing ${bookTitle} has been generated. Here are the details:
    </p>
    
    <ul style="color: white; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
      <li>Borrowed On: <strong>${borrowDate}</strong></li>
      <li>Due Date: <strong>${dueDate}</strong></li>
    </ul>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">You can download the receipt here:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${receiptUrl}" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Download Receipt
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Keep the pages turning,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Book Return Confirmation Email
export const BookReturnEmailTemplate = ({ studentName, bookTitle }: EmailTemplateProps) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Thank You for Returning ${bookTitle}!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We've successfully received your return of ${bookTitle}. Thank you for returning it on time.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Looking for your next read? Browse our collection and borrow your next favorite book!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Explore New Books
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Happy exploring,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Account Approval Email
export const AccountApprovalEmailTemplate = ({ studentName }: { studentName: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Your BookWise Account Has Been Approved!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Congratulations! Your BookWise account has been approved. You can now browse our library, 
      borrow books, and enjoy all the features of your new account.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Log in to get started:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Log in to BookWise
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Welcome aboard,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Account Rejection Email
export const AccountRejectionEmailTemplate = ({ studentName }: { studentName: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Account Request Update</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We regret to inform you that your BookWise account request has been denied. 
      If you believe this is an error, please contact our support team for assistance.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Best regards,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Role Update Email
export const RoleUpdateEmailTemplate = ({ studentName, newRole }: { studentName: string; newRole: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Your Role Has Been Updated!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Your account role has been updated to <strong>${newRole}</strong>. 
      ${newRole === "ADMIN" ? "You now have access to administrative features and can manage the library system." : "Your account permissions have been updated accordingly."}
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Access Dashboard
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Best regards,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Inactivity Reminder Email
export const InactivityReminderEmailTemplate = ({ studentName }: { studentName: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">We Miss You at BookWise!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      It's been a while since we last saw you—over three days, to be exact! New books are waiting for you, 
      and your next great read might just be a click away.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Come back and explore now:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Explore Books on BookWise
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">See you soon,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

// Check-In Reminder Email (Congrats)
export const CheckInCongratsEmailTemplate = ({ studentName }: { studentName: string }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1A1A2E; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #202036; border-radius: 12px; padding: 40px;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 30px;">
      <div style="width: 32px; height: 32px; background-color: white; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #1A1A2E; font-size: 20px;">📚</span>
      </div>
      <span style="color: white; font-size: 24px; font-weight: bold;">BookWise</span>
    </div>
    
    <h1 style="color: white; font-size: 28px; margin: 0 0 20px 0;">Congratulations on Reaching a New Milestone!</h1>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${studentName},</p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Great news! You've reached a new milestone in your reading journey with BookWise. 
      Whether it's finishing a challenging book, staying consistent with your reading goals, 
      or exploring new genres, your dedication inspires us.
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Keep the momentum going—there are more exciting books and features waiting for you!
    </p>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Log in now to discover your next adventure:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/search" 
         style="display: inline-block; background-color: #F0D9B5; color: #1A1A2E; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Discover New Reads
      </a>
    </div>
    
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 40px 0 10px 0;">Keep the pages turning,</p>
    <p style="color: white; font-size: 16px; line-height: 1.6; margin: 0;">The BookWise Team</p>
  </div>
</body>
</html>
  `;
};

