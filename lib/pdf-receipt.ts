"use server";

// This will be used when jspdf is installed
// For now, we'll create a server action that generates the receipt

export interface ReceiptData {
  receiptId: string;
  studentName: string;
  studentEmail: string;
  bookTitle: string;
  bookAuthor: string;
  bookGenre: string;
  borrowDate: string;
  dueDate: string;
  duration: number; // in days
  dateIssued: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer | null> {
  try {
    // Dynamic import to avoid issues if jspdf is not installed
    const { jsPDF } = await import("jspdf");
    
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Colors
    const darkBg = "#1A1A2E";
    const cardBg = "#202036";
    const textWhite = "#FFFFFF";
    const textLight = "#E0E0E0";
    const accent = "#F0D9B5";

    // Set background
    doc.setFillColor(26, 26, 46); // darkBg
    doc.rect(0, 0, 210, 297, "F");

    // Card background
    doc.setFillColor(32, 32, 54); // cardBg
    doc.roundedRect(20, 20, 170, 257, 5, 5, "F");

    // Logo and Header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("BookWise", 30, 40);
    
    doc.setFontSize(20);
    doc.text("Borrow Receipt", 30, 55);

    // Receipt ID and Date
    doc.setFontSize(10);
    doc.setTextColor(224, 224, 224); // textLight
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt ID: #${data.receiptId}`, 30, 70);
    doc.text(`Date Issued: ${data.dateIssued}`, 30, 78);

    // Book Details Section
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Book Details:", 30, 95);

    // Grid layout for book details
    const startY = 105;
    const fieldHeight = 12;
    const leftColX = 30;
    const rightColX = 115;
    const fieldWidth = 75;

    // Helper function to draw field
    const drawField = (x: number, y: number, label: string, value: string) => {
      doc.setFillColor(40, 40, 60);
      doc.roundedRect(x, y, fieldWidth, fieldHeight, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(224, 224, 224);
      doc.setFont("helvetica", "normal");
      doc.text(label, x + 3, y + 5);
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + 3, y + 10);
    };

    // Row 1: Title and Author
    drawField(leftColX, startY, "Title", data.bookTitle);
    drawField(rightColX, startY, "Author", data.bookAuthor);

    // Row 2: Genre and Borrowed On
    drawField(leftColX, startY + fieldHeight + 2, "Genre", data.bookGenre);
    drawField(rightColX, startY + fieldHeight + 2, "Borrowed on", data.borrowDate);

    // Row 3: Due Date and Duration
    drawField(leftColX, startY + (fieldHeight + 2) * 2, "Due Date", data.dueDate);
    drawField(rightColX, startY + (fieldHeight + 2) * 2, "Duration", `${data.duration} Days`);

    // Terms Section
    const termsY = startY + (fieldHeight + 2) * 3 + 15;
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Terms", 30, termsY);

    doc.setFontSize(10);
    doc.setTextColor(224, 224, 224);
    doc.setFont("helvetica", "normal");
    doc.text("• Please return the book by the due date.", 30, termsY + 8);
    doc.text("• Lost or damaged books may incur replacement costs.", 30, termsY + 16);

    // Footer
    const footerY = 250;
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Thank you for using BookWise!", 30, footerY);

    doc.setFontSize(9);
    doc.setTextColor(224, 224, 224);
    doc.setFont("helvetica", "normal");
    const website = process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "").replace("http://", "") || "bookwise.example.com";
    doc.text(`Website: ${website}`, 30, footerY + 10);
    doc.text("Email: support@bookwise.example.com", 30, footerY + 18);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF receipt:", error);
    // If jspdf is not installed, return null
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      console.warn("jspdf is not installed. Please run: npm install jspdf @types/jspdf");
      return null;
    }
    throw error;
  }
}

