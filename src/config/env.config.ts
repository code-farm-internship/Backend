import Joi from 'joi';
import dotenv from 'dotenv';
import 'dotenv/config';

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: '.env.local' });
}

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'development').required(),
        PORT: Joi.number().default(8000),
        HOSTNAME: Joi.string().default('127.0.0.1'),
        HOST: Joi.string(),
        MONGODB_URL_DEV: Joi.string().description('Local Mongo DB'),
        MONGODB_URL_CLOUD: Joi.string().description('Cloud Mongo DB'),

        // JWT
        JWT_ACCESS_TOKEN_KEY: Joi.string().required().description('JWT Access Token Key'),
        JWT_REFRESH_TOKEN_KEY: Joi.string().required().description('JWT Refresh Token Key'),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m').description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('30d').description('days after which refresh tokens expire'),

        // CLOUDINARY
        CLOUDINARY_CLOUD_NAME: Joi.string().required().description('Cloudinay Cloud Name'),
        CLOUDINARY_API_KEY: Joi.string().required().description('JCloudinay Cloud Api Key'),
        CLOUDINARY_API_SECRET: Joi.string().required().description('JCloudinay Cloud Api Secret Key'),

        // SHIPPING
        SHIPPING_API_TOKEN: Joi.string().description('Shipping Api Token'),
        SHIPPING_API_ENDPOINT: Joi.string().description('Shipping Api Endpoint'),
        SHOP_ID: Joi.string().description('Shop Id'),
        FROM_DISTRICT_ID: Joi.number().description('From District'),
        FROM_WARD_CODE: Joi.string().description('From Ward'),

        // REDIS
        REDIS_USERNAME: Joi.string().description('Redis Username'),
        REDIS_PASSWORD: Joi.string().description('Redis Password'),
        REDIS_HOST: Joi.string().description('Redis Host'),
        REDIS_PORT: Joi.number().description('Redis Port'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    hostname: envVars.HOSTNAME,
    host: envVars.HOST,
    mongoose: {
        url: envVars.MONGODB_URL_CLOUD,
        options: {
            dbName: 'e-commerce',
        },
    },
    jwt: {
        jwtAccessTokenKey: envVars.JWT_ACCESS_TOKEN_KEY,
        jwtRefreshTokenKey: envVars.JWT_REFRESH_TOKEN_KEY,
        jwtAccessExpiration: envVars.JWT_ACCESS_EXPIRATION,
        jwtRefreshExpiration: envVars.JWT_REFRESH_EXPIRATION,
        jwtVerificationTokenKey: envVars.JWT_VERIFICATION_TOKEN_KEY,
    },
    cookie: {
        maxAge: envVars.COOKIE_MAX_AGE,
    },
    cloudinary: {
        cloudinaryCloudName: envVars.CLOUDINARY_CLOUD_NAME,
        cloudinaryApiKey: envVars.CLOUDINARY_API_KEY,
        cloudinaryApiSecret: envVars.CLOUDINARY_API_SECRET,
    },
    clientUrl: envVars.CLIENT_URL,
    shipping: {
        apiToken: envVars.SHIPPING_API_TOKEN,
        apiEndpoint: envVars.SHIPPING_API_ENDPOINT,
        shopId: envVars.SHOP_ID,
        fromDistrictId: envVars.FROM_DISTRICT_ID,
        fromWardCode: envVars.FROM_WARD_CODE,
    },
    redis: {
        redisUsername: envVars.REDIS_USERNAME,
        redisPassword: envVars.REDIS_PASSWORD,
        redisHost: envVars.REDIS_HOST,
        redisPort: envVars.REDIS_PORT,
    },
};

export default config;
