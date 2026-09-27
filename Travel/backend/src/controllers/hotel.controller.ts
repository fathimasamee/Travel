import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const getAllHotels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { destinationId } = req.query;
    const where: any = {};
    if (destinationId) where.destinationId = destinationId as string;

    const hotels = await prisma.hotel.findMany({
      where,
      include: { destination: true },
      orderBy: { rating: "desc" },
    });

    const parsed = hotels.map((h) => ({
      ...h,
      images: typeof h.images === "string" ? JSON.parse(h.images || "[]") : h.images,
      amenities: typeof h.amenities === "string" ? JSON.parse(h.amenities || "[]") : h.amenities,
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: { destination: true },
    });

    if (!hotel) {
      res.status(404).json({ success: false, message: "Hotel not found." });
      return;
    }

    const parsed = {
      ...hotel,
      images: typeof hotel.images === "string" ? JSON.parse(hotel.images || "[]") : hotel.images,
      amenities: typeof hotel.amenities === "string" ? JSON.parse(hotel.amenities || "[]") : hotel.amenities,
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, destinationId, location, description, pricePerNight, rooms, rating, images, amenities, availability } = req.body;

    const hotel = await prisma.hotel.create({
      data: {
        name,
        destinationId: destinationId || null,
        location,
        description,
        pricePerNight: parseFloat(pricePerNight),
        rooms: rooms ? parseInt(rooms, 10) : 10,
        rating: rating ? parseFloat(rating) : 4.8,
        images: typeof images === "string" ? images : JSON.stringify(images || []),
        amenities: typeof amenities === "string" ? amenities : JSON.stringify(amenities || []),
        availability: availability !== undefined ? (availability === true || availability === "true") : true,
      },
    });

    res.status(201).json({ success: true, message: "Hotel created successfully.", data: hotel });
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.pricePerNight !== undefined) data.pricePerNight = parseFloat(data.pricePerNight);
    if (data.rooms !== undefined) data.rooms = parseInt(data.rooms, 10);
    if (data.rating !== undefined) data.rating = parseFloat(data.rating);
    if (data.images && typeof data.images !== "string") data.images = JSON.stringify(data.images);
    if (data.amenities && typeof data.amenities !== "string") data.amenities = JSON.stringify(data.amenities);
    if (data.availability !== undefined) data.availability = data.availability === true || data.availability === "true";

    const updated = await prisma.hotel.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: "Hotel updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.hotel.delete({ where: { id } });
    res.json({ success: true, message: "Hotel deleted successfully." });
  } catch (error) {
    next(error);
  }
};
