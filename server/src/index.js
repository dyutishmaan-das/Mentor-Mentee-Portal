import "dotenv/config";
import { connectDatabase } from "./config/database.js";
import { createApp } from "./app.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be configured");

await connectDatabase();
const port = Number(process.env.PORT) || 5000;
createApp().listen(port, () => console.log(`MentorConnect running on port ${port}`));
