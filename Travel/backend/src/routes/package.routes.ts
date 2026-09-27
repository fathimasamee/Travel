import { Router } from "express";
import * as packageController from "../controllers/package.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.get("/", packageController.getAllPackages);
router.get("/featured", packageController.getFeaturedPackages);
router.get("/:id", packageController.getPackageById);

// Admin routes
router.post("/", authenticate, authorize(["ADMIN"]), packageController.createPackage);
router.put("/:id", authenticate, authorize(["ADMIN"]), packageController.updatePackage);
router.delete("/:id", authenticate, authorize(["ADMIN"]), packageController.deletePackage);

export default router;
