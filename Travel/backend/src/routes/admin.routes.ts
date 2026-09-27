import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.use(authenticate, authorize(["ADMIN"]));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalyticsCharts);

export default router;
