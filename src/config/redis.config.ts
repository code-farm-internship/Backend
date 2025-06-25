import { createClient } from 'redis';
import config from './env.config';

const redisClient = createClient({
    username: config.redis.redisUsername,
    password: config.redis.redisPassword,
    socket: {
        host: config.redis.redisHost,
        port: config.redis.redisPort,
    },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.log('Có lỗi trong quá trình kết nối', error);
    }
};

export const disconnectRedis = () => {
    try {
        redisClient.destroy();
    } catch (error) {
        console.log('Có lỗi trong quá trình ngắt kết nối', error);
    }
};
export default redisClient;
