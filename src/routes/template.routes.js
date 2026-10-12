import { Router } from "express";
import {
  createTemplate,
  createTemplateSchema,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  updateTemplateSchema,
} from "../controllers/template.controller.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", listTemplates);
router.get("/:idOrSlug", getTemplate);
router.post("/", validate(createTemplateSchema), createTemplate);
router.put("/:id", validate(updateTemplateSchema), updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;
