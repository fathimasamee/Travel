import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, authorize(["ADMIN"]));

router.get("/export/bookings", reportController.exportBookingsCSV);
router.get("/export/revenue", reportController.exportRevenueCSV);
router.get("/export/users", reportController.exportUsersCSV);

export default router;
