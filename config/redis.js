const redis = require('redis');

let client;

const connectRedis = async () => {
    try {
        client = redis.createClient({
            host: process.env.REDIS_HOST || 'redis',
            port: process.env.REDIS_PORT || 6379,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.log('Max Redis retries reached');
                        return new Error('Max retries reached');
                    }
                    return retries * 50;
                }
            }
        });

        client.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        client.on('connect', () => {
            console.log('✓ Connected to Redis');
        });

        await client.connect();
        return client;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
    }
};

const getRedisClient = () => {
    if (!client) {
        throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return client;
};

const disconnectRedis = async () => {
    if (client) {
        await client.quit();
        console.log('Disconnected from Redis');
    }
};

module.exports = { connectRedis, getRedisClient, disconnectRedis };