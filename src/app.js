
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import {
  errorHandler,
  notFound,
} from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (env.clientUrls || [])
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header, such as Postman.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("[CORS] Blocked origin:", origin);
    console.error("[CORS] Allowed origins:", allowedOrigins);

    return callback(
      new Error(`Origin not allowed by CORS: ${origin}`)
    );
  },

  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

// CORS must run before routes and error handlers.
app.use(cors(corsOptions));

// Explicitly handle preflight requests.
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
