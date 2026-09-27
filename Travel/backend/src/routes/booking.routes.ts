import { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

// Customer routes
router.post("/", authenticate, bookingController.createBooking);
router.get("/my-bookings", authenticate, bookingController.getMyBookings);
router.put("/:id/cancel", authenticate, bookingController.cancelBooking);

// Staff routes
router.get("/staff/assigned", authenticate, authorize(["STAFF", "ADMIN"]), bookingController.getStaffAssignedBookings);
router.put("/:id/status", authenticate, authorize(["STAFF", "ADMIN"]), bookingController.updateBookingStatus);
router.put("/:id/operations", authenticate, authorize(["STAFF", "ADMIN"]), bookingController.updateOperationsNotes);

// Admin routes
router.get("/", authenticate, authorize(["ADMIN"]), bookingController.getAllBookings);

// Booking detail route (Role-checked internally)
router.get("/:id", authenticate, bookingController.getBookingById);

export default router;
