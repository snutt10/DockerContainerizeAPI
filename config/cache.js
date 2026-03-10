const { getRedisClient } = require('./redis');

// Cache key naming convention - prevents key collisions
const CACHE_KEYS = {
    ALL_GAMES: 'games:all',
    GAME: (id) => `games:${id}`,
    ALL_USERS: 'users:all',
    USER: (id) => `users:${id}`,
    USER_GAMES: (id) => `users:${id}:games`,
    ALL_EXCHANGES: 'exchanges:all',
    EXCHANGE: (id) => `exchanges:${id}`,
};

// Default TTLs (Time-To-Live in seconds)
const DEFAULT_TTL = {
    ALL_GAMES: 300,        // 5 minutes
    SINGLE_GAME: 600,      // 10 minutes
    ALL_USERS: 300,        // 5 minutes
    SINGLE_USER: 600,      // 10 minutes
    USER_GAMES: 300,       // 5 minutes
    ALL_EXCHANGES: 120,    // 2 minutes
    SINGLE_EXCHANGE: 300,  // 5 minutes
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if not found
 */
const getCachedData = async (key) => {
    try {
        const client = getRedisClient();
        const data = await client.get(key);
        
        if (data) {
            console.log(`[CACHE HIT] ${key}`);
            return JSON.parse(data);
        }
        
        console.log(`[CACHE MISS] ${key}`);
        return null;
    } catch (error) {
        console.error(`Error getting cache for ${key}:`, error);
        return null; // Fail gracefully - continue without cache
    }
};

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} Success status
 */
const setCacheData = async (key, data, ttl = DEFAULT_TTL.SINGLE_GAME) => {
    try {
        const client = getRedisClient();
        const serialized = JSON.stringify(data);
        await client.setEx(key, ttl, serialized);
        console.log(`[CACHE SET] ${key} (TTL: ${ttl}s)`);
        return true;
    } catch (error) {
        console.error(`Error setting cache for ${key}:`, error);
        return false; // Fail gracefully
    }
};

/**
 * Delete specific cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteCacheKey = async (key) => {
    try {
        const client = getRedisClient();
        await client.del(key);
        console.log(`[CACHE DELETE] ${key}`);
        return true;
    } catch (error) {
        console.error(`Error deleting cache for ${key}:`, error);
        return false;
    }
};

/**
 * Delete multiple cache keys matching a pattern
 * Useful for invalidating related caches
 * @param {string} pattern - Redis glob pattern (e.g., 'games:*')
 * @returns {Promise<number>} Number of keys deleted
 */
const deletePatternCache = async (pattern) => {
    try {
        const client = getRedisClient();
        const keys = await client.keys(pattern);
        
        if (keys.length === 0) return 0;
        
        await client.del(keys);
        console.log(`[CACHE DELETE PATTERN] ${pattern} (${keys.length} keys deleted)`);
        return keys.length;
    } catch (error) {
        console.error(`Error deleting pattern cache for ${pattern}:`, error);
        return 0;
    }
};

/**
 * Clear all cache (nuclear option - use sparingly)
 * @returns {Promise<boolean>} Success status
 */
const clearAllCache = async () => {
    try {
        const client = getRedisClient();
        await client.flushDb();
        console.log('[CACHE] All cache cleared');
        return true;
    } catch (error) {
        console.error('Error clearing all cache:', error);
        return false;
    }
};

module.exports = {
    CACHE_KEYS,
    DEFAULT_TTL,
    getCachedData,
    setCacheData,
    deleteCacheKey,
    deletePatternCache,
    clearAllCache,
};