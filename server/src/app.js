import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errors.js";

export function createApp() {
  const app = express();
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use("/api", apiRoutes);
  if (process.env.NODE_ENV === "production") {
    const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
    app.use(express.static(dist));
    app.get("*", (req, res, next) => req.path.startsWith("/api") ? next() : res.sendFile(path.join(dist, "index.html")));
  }
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
