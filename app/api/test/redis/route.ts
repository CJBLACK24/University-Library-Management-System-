import { NextResponse } from "next/server";
import { testRedisConnection, testRedisCaching, getRedisCacheStats } from "@/lib/redis-test";

export async function GET() {
  try {
    console.log("🔍 Testing Redis configuration...");

    // Test basic connection
    const connectionTest = await testRedisConnection();
    
    // Test caching operations
    const cachingTest = await testRedisCaching();
    
    // Get cache statistics
    const cacheKeys = await getRedisCacheStats();

    const results = {
      success: connectionTest && cachingTest,
      connection: connectionTest ? "✅ Connected" : "❌ Failed",
      caching: cachingTest ? "✅ Working" : "❌ Failed",
      totalCachedKeys: cacheKeys.length,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(results, { status: results.success ? 200 : 500 });
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Redis configuration failed. Please check your UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in .env.local"
      },
      { status: 500 }
    );
  }
}
