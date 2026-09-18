import mongoose from 'mongoose';

let cachedPromise = null;

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI is not defined');
    }

    if (!cachedPromise) {
        cachedPromise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        }).then((mongooseInstance) => {
            console.log('MongoDB connected');
            return mongooseInstance;
        });
    }

    try {
        await cachedPromise;
    } catch (err) {
        cachedPromise = null;
        throw err;
    }

    return mongoose.connection;
}