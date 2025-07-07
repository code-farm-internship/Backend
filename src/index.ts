import app from './app';
import connectDB from './config/database.config';
import config from './config/env.config';
// import { connectRedis, disconnectRedis } from './config/redis.config';

const PORT = config.port;
const HOSTNAME = config.hostname;

let server: any;
connectDB().then(async () => {
    server = app.listen(PORT, `${HOSTNAME}`, () => {
        console.log(`Listening to port ${PORT}`);
    });
});

// connectRedis();

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
    disconnectRedis();
};
const unexpectedErrorHandler = (error: string) => {
    console.log(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    // disconnectRedis();
    if (server) {
        server.close();
    }
});

// process.on('SIGINT', async () => {
//     console.log('SIGINT received');
//     disconnectRedis();
//     if (server) {
//         server.close();
//     }
// });
