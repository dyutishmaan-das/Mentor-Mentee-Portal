import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
    if (isConnected && mongoose.connection.readyState >= 1) {
        return;
    }

    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(uri, {
        bufferCommands: false,
    });

    isConnected = true;
    console.log('MongoDB connected');
}