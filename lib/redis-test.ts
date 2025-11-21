import redis from "@/database/redis";

/**
 * Test Redis connection
 * This utility helps verify that Redis is properly configured
 */
export async function testRedisConnection() {
  try {
    // Test basic set/get
    await redis.set("test:connection", "working", { ex: 10 });
    const result = await redis.get("test:connection");
    
    if (result === "working") {
      console.log("✅ Redis connection successful!");
      return true;
    } else {
      console.error("❌ Redis connection failed - unexpected result");
      return false;
    }
  } catch (error) {
    console.error("❌ Redis connection error:", error);
    return false;
  }
}

/**
 * Test Redis caching operations
 */
export async function testRedisCaching() {
  try {
    const testData = {
      id: 1,
      name: "Test Book",
      author: "Test Author",
      timestamp: new Date().toISOString(),
    };

    // Set cache with 60 second expiry
    await redis.set("test:book:1", JSON.stringify(testData), { ex: 60 });
    
    // Get from cache
    const cached = await redis.get("test:book:1");
    
    if (cached) {
      const parsed = JSON.parse(cached as string);
      console.log("✅ Redis caching works!", parsed);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Redis caching error:", error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getRedisCacheStats() {
  try {
    const keys = await redis.keys("*");
    console.log(`📊 Total cached keys: ${keys.length}`);
    return keys;
  } catch (error) {
    console.error("❌ Error getting cache stats:", error);
    return [];
  }
}
