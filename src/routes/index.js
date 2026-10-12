import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import authRoutes from "./auth.routes.js";
import templateRoutes from "./template.routes.js";
import emailRoutes from "./email.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

// Public
router.use("/auth", authRoutes);

// Owner only (needs a login token)
router.use("/templates", requireAuth, templateRoutes);
router.use("/emails", requireAuth, emailRoutes);
router.use("/settings", requireAuth, settingsRoutes);

export default router;
