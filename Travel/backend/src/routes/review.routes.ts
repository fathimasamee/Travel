import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get("/package/:packageId", reviewController.getPackageReviews);
router.post("/", authenticate, reviewController.addReview);
router.put("/:id", authenticate, reviewController.editReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

// Admin routes
router.get("/admin/all", authenticate, authorize(["ADMIN"]), reviewController.getAllReviewsAdmin);
router.put("/admin/:id/approve", authenticate, authorize(["ADMIN"]), reviewController.toggleReviewApproval);

export default router;
