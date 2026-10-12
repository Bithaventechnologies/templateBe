import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  deleteEmail,
  emailStats,
  getEmail,
  listEmails,
  listEmailTemplatesEndpoint,
  previewEmail,
  previewEmailSchema,
  sendTemplateEmail,
  sendTemplateEmailSchema,
} from "../controllers/email.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Protects your mail account from accidental floods
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You are sending too fast. Wait a minute and try again." },
});

router.get("/templates", listEmailTemplatesEndpoint);
router.post("/preview", validate(previewEmailSchema), previewEmail);
router.post("/send", sendLimiter, validate(sendTemplateEmailSchema), sendTemplateEmail);
router.get("/stats", emailStats); // keep above "/:id"
router.get("/", listEmails);
router.get("/:id", getEmail);
router.delete("/:id", deleteEmail);

export default router;
