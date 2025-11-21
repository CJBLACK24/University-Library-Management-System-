import jsPDF from "jspdf";
import dayjs from "dayjs";

/**
 * PDF Receipt Generator for Book Borrowing
 */

export interface BorrowReceiptData {
  borrowId: string;
  userName: string;
  userEmail: string;
  universityId: number;
  bookTitle: string;
  bookAuthor: string;
  borrowDate: Date;
  dueDate: string;
  status: string;
}

export async function generateBorrowReceipt(
  data: BorrowReceiptData
): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("UNIVERSITY LIBRARY", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Book Borrow Receipt", 105, 30, { align: "center" });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Receipt details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  let y = 50;
  const lineHeight = 8;
  
  // Receipt ID
  doc.setFont("helvetica", "bold");
  doc.text("Receipt ID:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.borrowId.substring(0, 13).toUpperCase(), 70, y);
  
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Date Issued:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(dayjs(data.borrowDate).format("MMMM D, YYYY"), 70, y);
  
  y += lineHeight * 2;
  
  // Student Information Section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", 20, y);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 190, y + 2);
  
  y += lineHeight + 3;
  doc.setFontSize(11);
  
  doc.text("Name:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.userName, 70, y);
  
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Email:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.userEmail, 70, y);
  
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("University ID:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.universityId.toString(), 70, y);
  
  y += lineHeight * 2;
  
  // Book Information Section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Book Information", 20, y);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 190, y + 2);
  
  y += lineHeight + 3;
  doc.setFontSize(11);
  
  doc.text("Title:", 20, y);
  doc.setFont("helvetica", "normal");
  const titleLines = doc.splitTextToSize(data.bookTitle, 110);
  doc.text(titleLines, 70, y);
  
  y += (titleLines.length * lineHeight);
  doc.setFont("helvetica", "bold");
  doc.text("Author:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(data.bookAuthor, 70, y);
  
  y += lineHeight * 2;
  
  // Borrow Details Section
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Borrow Details", 20, y);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 190, y + 2);
  
  y += lineHeight + 3;
  doc.setFontSize(11);
  
  doc.text("Borrow Date:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.text(dayjs(data.borrowDate).format("MMMM D, YYYY"), 70, y);
  
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Due Date:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 38, 38); // Red color for due date
  doc.text(dayjs(data.dueDate).format("MMMM D, YYYY"), 70, y);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 20, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(16, 185, 129); // Green color for status
  doc.text(data.status, 70, y);
  doc.setTextColor(0, 0, 0);
  
  y += lineHeight * 3;
  
  // Important Notes
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Important Notes:", 20, y);
  
  y += lineHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const notes = [
    "• Please return the book on or before the due date to avoid late fees.",
    "• Keep this receipt for your records.",
    "• Contact the library if you need to extend your borrowing period.",
    "• Lost or damaged books must be reported immediately.",
  ];
  
  notes.forEach((note) => {
    doc.text(note, 20, y);
    y += lineHeight - 2;
  });
  
  // Footer
  y = 270;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This is a computer-generated receipt and does not require a signature.",
    105,
    y,
    { align: "center" }
  );
  
  doc.text(
    `Generated on ${dayjs().format("MMMM D, YYYY [at] h:mm A")}`,
    105,
    y + 5,
    { align: "center" }
  );
  
  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
