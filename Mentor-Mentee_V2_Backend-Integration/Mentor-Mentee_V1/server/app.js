import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  errorHandler,
  notFound,
} from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '../client');

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const devOrigins = [
  process.env.CLIENT_URL,

  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',

  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Allow requests such as Postman/server-to-server
       * where Origin may not exist.
       */
      if (!origin) {
        return callback(null, true);
      }

      const allowed =
        devOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (allowed) {
        return callback(null, true);
      }

      return callback(
        new Error('Not allowed by CORS'),
      );
    },

    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // External JavaScript
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net"
        ],

        // External CSS
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],

        // Google font files
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],

        // External images
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com"
        ],

        // API / fetch / XHR connections
        connectSrc: [
          "'self'"
        ],

        // Prevent embedded plugins
        objectSrc: ["'none'"],

        // Restrict <base>
        baseUri: ["'self'"],

        // Prevent other sites from framing the portal
        frameAncestors: ["'self'"]
      }
    }
  })
);

/*
|--------------------------------------------------------------------------
| RATE LIMIT
|--------------------------------------------------------------------------
*/

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 300,

    standardHeaders: true,

    legacyHeaders: false,
  }),
);

/*
|--------------------------------------------------------------------------
| BODY PARSERS
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '1mb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

/*
|--------------------------------------------------------------------------
| COOKIES
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| LOGGER
|--------------------------------------------------------------------------
*/

app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev',
  ),
);


/*
|--------------------------------------------------------------------------
| STATIC FRONTEND
|--------------------------------------------------------------------------
| Mentor-Mentee frontend is served by this same Express application.
*/
app.use(express.static(clientDir));

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  '/api/health',
  (_req, res) =>
    res.json({
      success: true,

      message:
        'Student Mentoring API is healthy',

      data: {
        status: 'ok',
      },
    }),
);

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

/*
 * Authentication
 *
 * /api/auth/...
 */

app.use(
  '/api/auth',
  authRoutes,
);

/*
 * Students
 *
 * /api/students/...
 *
 * IMPORTANT:
 * Excel import will also be added inside
 * studentRoutes.js.
 */

app.use(
  '/api/students',
  studentRoutes,
);

/*
 * Mentors
 *
 * /api/mentors/...
 */

app.use(
  '/api/mentors',
  mentorRoutes,
);

/*
 * Academic
 *
 * /api/...
 */

app.use(
  '/api',
  academicRoutes,
);

/*
 * Attendance
 *
 * /api/attendance/...
 */

app.use(
  '/api/attendance',
  attendanceRoutes,
);

/*
 * Resources
 *
 * /api/...
 */

app.use(
  '/api',
  resourceRoutes,
);

/*
 * System
 *
 * /api/...
 */

app.use(
  '/api',
  systemRoutes,
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(clientDir, 'index.html'));
});

app.use(notFound);

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default app;
