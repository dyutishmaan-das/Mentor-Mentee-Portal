import app from '../app.js';
import { connectDB } from '../config/db.js';

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error('Failed to connect to DB in serverless handler:', err);
    }
    return app(req, res);
}
