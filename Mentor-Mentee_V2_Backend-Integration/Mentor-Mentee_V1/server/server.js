import app from './app.js';
import { connectDB } from './config/db.js';
import { validateEnvironment } from './config/env.js';
const port = process.env.PORT || 5000;
validateEnvironment();
connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on ${port}`)))
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
