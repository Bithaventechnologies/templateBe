import { Router } from "express";
import { getSettings, updateSettings, updateSettingsSchema } from "../controllers/settings.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", getSettings);
router.put("/", validate(updateSettingsSchema), updateSettings);

export default router;
