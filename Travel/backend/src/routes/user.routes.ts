import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Customer endpoints
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);
router.put("/change-password", authenticate, userController.changePassword);
router.get("/favourites", authenticate, userController.getFavourites);
router.post("/favourites/:packageId", authenticate, userController.toggleFavourite);
router.get("/notifications", authenticate, userController.getNotifications);
router.put("/notifications/:id/read", authenticate, userController.markNotificationRead);

// Admin endpoints
router.get("/", authenticate, authorize(["ADMIN"]), userController.getAllUsers);
router.put("/:id/role", authenticate, authorize(["ADMIN"]), userController.updateUserRole);
router.delete("/:id", authenticate, authorize(["ADMIN"]), userController.deleteUser);

export default router;
