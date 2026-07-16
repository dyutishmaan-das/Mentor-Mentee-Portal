import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { crudController } from "../controllers/crudController.js";

export function resourceRouter(Model, writeRoles, addSubmittedBy = false) {
  const router = Router();
  const controller = crudController(Model, addSubmittedBy);
  router.use(authenticate);
  router.get("/", asyncHandler(controller.list));
  router.post("/", authorize(...writeRoles), asyncHandler(controller.create));
  router.patch("/:id", authorize(...writeRoles), asyncHandler(controller.update));
  router.delete("/:id", authorize("admin", "hod", "mentor"), asyncHandler(controller.remove));
  return router;
}
