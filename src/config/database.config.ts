export const databaseConfig = {
    uri: process.env.MONGODB_URI,
    options: {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    },
};