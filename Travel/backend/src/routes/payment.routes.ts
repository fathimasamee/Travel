import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.post("/create-intent", authenticate, paymentController.createPaymentIntent);
router.post("/confirm", authenticate, paymentController.confirmPayment);
router.get("/invoice/:bookingId", authenticate, paymentController.getInvoiceData);
router.get("/invoice/:bookingId/pdf", authenticate, paymentController.downloadInvoicePDF);

// Admin routes
router.get("/", authenticate, authorize(["ADMIN"]), paymentController.getAllPayments);

export default router;
