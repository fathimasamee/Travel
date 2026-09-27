import { Router } from "express";
import * as hotelController from "../controllers/hotel.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/role.middleware";

const router = Router();

router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);

router.post("/", authenticate, authorize(["ADMIN"]), hotelController.createHotel);
router.put("/:id", authenticate, authorize(["ADMIN"]), hotelController.updateHotel);
router.delete("/:id", authenticate, authorize(["ADMIN"]), hotelController.deleteHotel);

export default router;
