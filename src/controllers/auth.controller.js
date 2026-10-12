import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const loginSchema = z.object({ password: z.string().min(1, "Password is required") });

/** Constant-time string comparison */
function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  if (!safeEqual(req.body.password, env.adminPassword)) {
    throw new HttpError(401, "Wrong password.");
  }
  const token = jwt.sign({ role: "owner" }, env.jwtSecret, { expiresIn: "7d" });
  res.json({ token, expiresIn: "7d" });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ role: req.user.role });
});
