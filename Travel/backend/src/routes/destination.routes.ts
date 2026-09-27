import { Router } from "express";
import * as destinationController from "../controllers/destination.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/popular", destinationController.getPopularDestinations);
router.get("/:id", destinationController.getDestinationById);

// Admin routes
router.post("/", authenticate, authorize(["ADMIN"]), destinationController.createDestination);
router.put("/:id", authenticate, authorize(["ADMIN"]), destinationController.updateDestination);
router.delete("/:id", authenticate, authorize(["ADMIN"]), destinationController.deleteDestination);

export default router;
