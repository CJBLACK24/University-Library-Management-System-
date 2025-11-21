import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    
    // Sanitize receiptId to prevent path traversal
    const sanitizedId = receiptId.replace(/[^a-zA-Z0-9-]/g, "");
    
    const receiptPath = join(process.cwd(), "public", "receipts", `${sanitizedId}.pdf`);
    
    if (!existsSync(receiptPath)) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(receiptPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${sanitizedId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error serving receipt:", error);
    return NextResponse.json(
      { error: "Failed to serve receipt" },
      { status: 500 }
    );
  }
}

