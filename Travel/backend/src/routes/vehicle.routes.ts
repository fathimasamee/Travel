import { Router } from "express";
import * as vehicleController from "../controllers/vehicle.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get("/", vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);

router.post("/", authenticate, authorize(["ADMIN"]), vehicleController.createVehicle);
router.put("/:id", authenticate, authorize(["ADMIN"]), vehicleController.updateVehicle);
router.delete("/:id", authenticate, authorize(["ADMIN"]), vehicleController.deleteVehicle);

export default router;
