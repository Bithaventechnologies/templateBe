import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const defaultsSchema = z
  .object({
    subject: z.string().max(200).optional(),
    headline: z.string().max(200).optional(),
    message: z.string().max(5000).optional(),
    btnText: z.string().max(80).optional(),
    btnLink: z.string().max(500).optional(),
    code: z.string().max(60).optional(),
    detail: z.string().max(200).optional(),
  })
  .strict();

export const createTemplateSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  name: z.string().min(1, "Name is required").max(60),
  description: z.string().max(120).optional(),
  icon: z.string().max(8).optional(),
  category: z.string().min(1, "Category is required").max(40),
  fields: z.array(z.enum(["code", "detail", "btn"])).default([]),
  defaults: defaultsSchema.default({}),
  isActive: z.boolean().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// GET /api/templates?category=promotional&active=true
export const listTemplates = asyncHandler(async (req, res) => {
  const { category, active } = req.query;
  const templates = await prisma.template.findMany({
    where: {
      ...(category ? { category: String(category) } : {}),
      ...(active === "true" ? { isActive: true } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  res.json({ templates });
});

// GET /api/templates/:idOrSlug
export const getTemplate = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const template = await prisma.template.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });
  if (!template) throw new HttpError(404, "Template not found.");
  res.json({ template });
});

// POST /api/templates
export const createTemplate = asyncHandler(async (req, res) => {
  const template = await prisma.template.create({ data: req.body });
  res.status(201).json({ template });
});

// PUT /api/templates/:id
export const updateTemplate = asyncHandler(async (req, res) => {
  const template = await prisma.template.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ template });
});

// DELETE /api/templates/:id
export const deleteTemplate = asyncHandler(async (req, res) => {
  await prisma.template.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
