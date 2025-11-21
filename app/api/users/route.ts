import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { cacheOrFetch, CACHE_KEYS, CACHE_TTL, deleteCache } from "@/lib/cache";
import { checkRateLimit, apiRateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

/**
 * GET /api/users - Get all users with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const role = searchParams.get("role") || "all";

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (status !== "all") {
      conditions.push(eq(users.status, status as any));
    }

    if (role !== "all") {
      conditions.push(eq(users.role, role as any));
    }

    // Cache key based on filters
    const cacheKey = `${CACHE_KEYS.USERS.ALL}:page:${page}:limit:${limit}:search:${search}:status:${status}:role:${role}`;

    const result = await cacheOrFetch(
      cacheKey,
      async () => {
        // Get total count
        const totalCount = await db
          .select({ count: db.$count(users) })
          .from(users)
          .where(conditions.length > 0 ? or(...conditions) : undefined);

        // Get users
        const usersList = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            universityId: users.universityId,
            status: users.status,
            role: users.role,
            lastActivityDate: users.lastActivityDate,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(conditions.length > 0 ? or(...conditions) : undefined)
          .orderBy(desc(users.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          users: usersList,
          pagination: {
            page,
            limit,
            total: totalCount[0]?.count || 0,
            totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
          },
        };
      },
      CACHE_TTL.MEDIUM
    );

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, headers } = await checkRateLimit(ip, apiRateLimit);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers }
      );
    }

    const body = await request.json();
    const { fullName, email, universityId, password, universityCard, role } = body;

    // Validate required fields
    if (!fullName || !email || !universityId || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.universityId, universityId)));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "User with this email or university ID already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        fullName,
        email,
        universityId,
        password: hashedPassword,
        universityCard: universityCard || "",
        role: role || "USER",
        status: "APPROVED", // Admin-created users are auto-approved
      })
      .returning();

    // Invalidate users cache
    await deleteCache(CACHE_KEYS.USERS.ALL);

    return NextResponse.json(
      { user: newUser[0], message: "User created successfully" },
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
