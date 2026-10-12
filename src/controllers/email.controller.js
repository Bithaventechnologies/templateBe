import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { sendMail } from "../lib/mailer.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { listEmailTemplates, renderEmailTemplate, validateTemplateValues } from "../lib/emailTemplates.js";

const templateEmailSchema = z.object({
  templateId: z.string().min(1).max(40),
  subject: z.string().trim().min(1).max(200).optional(),
  values: z.record(z.string().max(5000)).default({}),
}).strict();

export const previewEmailSchema = templateEmailSchema;
export const sendTemplateEmailSchema = templateEmailSchema.extend({
  to: z.string().trim().email("Enter a valid recipient email").max(254),
});

export const listEmailTemplatesEndpoint = (_req, res) => {
  res.json({ success: true, data: listEmailTemplates() });
};

export const previewEmail = asyncHandler(async (req, res) => {
  const issue = validateTemplateValues(req.body.templateId, req.body.values);
  if (issue) throw new HttpError(400, issue.error);
  const rendered = renderEmailTemplate(req.body.templateId, req.body.subject, req.body.values);
  res.json({ success: true, data: rendered });
});

export const sendTemplateEmail = asyncHandler(async (req, res) => {
  const { to, templateId, subject, values } = req.body;
  const issue = validateTemplateValues(templateId, values);
  if (issue) throw new HttpError(400, issue.error);
  const rendered = renderEmailTemplate(templateId, subject, values);
  const [settings, template] = await Promise.all([
    prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    prisma.template.findUnique({ where: { slug: templateId }, select: { id: true } }),
  ]);

  let result;
  try {
    result = await sendMail({
      fromName: settings.senderName || settings.businessName,
      to,
      subject: rendered.subject,
      html: rendered.html,
    });
  } catch {
    await prisma.email.create({
      data: { to, subject: rendered.subject, html: rendered.html, status: "FAILED", error: "Email provider rejected the request", templateId: template?.id },
    });
    throw new HttpError(502, "The email could not be sent. Check the Resend configuration and try again.");
  }

  await prisma.email.create({
    data: { to, subject: rendered.subject, html: rendered.html, status: "SENT", messageId: result.id, templateId: template?.id },
  });
  res.status(201).json({ success: true, message: "Email accepted by Resend", data: { id: result.id } });
});

// GET /api/emails?page=1&limit=20&status=SENT&search=amaka
export const listEmails = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = ["SENT", "FAILED"].includes(req.query.status) ? req.query.status : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { to: { contains: search, mode: "insensitive" } },
            { subject: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, emails] = await Promise.all([
    prisma.email.count({ where }),
    prisma.email.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        to: true,
        subject: true,
        status: true,
        error: true,
        createdAt: true,
        template: { select: { slug: true, name: true, icon: true } },
      },
    }),
  ]);

  res.json({ emails, page, limit, total, totalPages: Math.ceil(total / limit) });
});

// GET /api/emails/:id  (includes the full HTML)
export const getEmail = asyncHandler(async (req, res) => {
  const email = await prisma.email.findUnique({
    where: { id: req.params.id },
    include: { template: { select: { slug: true, name: true, icon: true } } },
  });
  if (!email) throw new HttpError(404, "Email not found.");
  res.json({ email });
});

// DELETE /api/emails/:id
export const deleteEmail = asyncHandler(async (req, res) => {
  await prisma.email.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// GET /api/emails/stats
export const emailStats = asyncHandler(async (_req, res) => {
  const [total, sent, failed] = await Promise.all([
    prisma.email.count(),
    prisma.email.count({ where: { status: "SENT" } }),
    prisma.email.count({ where: { status: "FAILED" } }),
  ]);
  res.json({ total, sent, failed });
});

