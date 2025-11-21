import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

const makeAdmin = async (email: string) => {
  try {
    await db
      .update(users)
      .set({ role: "ADMIN" })
      .where(eq(users.email, email));

    console.log(`✅ Successfully updated ${email} to ADMIN role`);
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: npx tsx scripts/make-admin.ts your-email@example.com");
  process.exit(1);
}

makeAdmin(email);

