import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const updateSettingsSchema = z.object({
  businessName: z.string().max(100).optional(),
  senderName: z.string().max(100).optional(),
  replyTo: z.union([z.string().email("Enter a valid reply-to email"), z.literal("")]).optional(),
});

// GET /api/settings
export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  res.json({ settings });
});

// PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const { replyTo, ...rest } = req.body;
  const data = { ...rest, ...(replyTo !== undefined ? { replyTo: replyTo || null } : {}) };
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  res.json({ settings });
});
