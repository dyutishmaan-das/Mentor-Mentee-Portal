import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import importRoutes from './routes/importRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

// Import middleware
import { authenticate } from './middleware/auth.js';
import { authorize } from './middleware/authorize.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
    process.env.CLIENT_URL,
    'https://dyutishmaan-das.github.io',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:8080'
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith('.github.io') ||
                origin.endsWith('.vercel.app') ||
                origin.includes('localhost') ||
                origin.includes('127.0.0.1')
            ) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true,
    })
);

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Ensure MongoDB connection is established on all requests (for serverless environments)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection middleware error:', err.message);
        next(err);
    }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('dev'));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/import', importRoutes);
app.use('/api/registration', registrationRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Mentor-Mentee API is running',
        timestamp: new Date().toISOString(),
    });
});

app.get(
    '/api/test/admin',
    authenticate,
    authorize('ADMIN'),
    (req, res) => {
        res.json({
            success: true,
            message: 'ADMIN access granted',
        });
    }
);

// Serve uploaded files statically if folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath));
}

// Serve the frontend client as static files when running locally
const clientPath = path.join(__dirname, '..', 'client');
if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));
}

// Fallback root endpoint (for headless / Vercel cloud serverless deployments)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Mentor-Mentee API Server is running',
        health: '/api/health',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler - must be after all routes
app.use(notFound);

// Centralized error handler - must be last
app.use(errorHandler);

export default app;