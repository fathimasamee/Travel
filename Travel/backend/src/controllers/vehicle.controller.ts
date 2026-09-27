import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const getAllVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, availableOnly } = req.query;
    const where: any = {};
    if (type) where.type = type as string;
    if (availableOnly === "true") where.availability = true;

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { price: "asc" },
    });

    const parsed = vehicles.map((v) => ({
      ...v,
      features: typeof v.features === "string" ? JSON.parse(v.features || "[]") : v.features,
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      res.status(404).json({ success: false, message: "Vehicle not found." });
      return;
    }

    const parsed = {
      ...vehicle,
      features: typeof vehicle.features === "string" ? JSON.parse(vehicle.features || "[]") : vehicle.features,
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, name, capacity, price, driverIncluded, availability, image, features } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        type: type || "VAN",
        name,
        capacity: parseInt(capacity, 10),
        price: parseFloat(price),
        driverIncluded: driverIncluded !== undefined ? (driverIncluded === true || driverIncluded === "true") : true,
        availability: availability !== undefined ? (availability === true || availability === "true") : true,
        image,
        features: typeof features === "string" ? features : JSON.stringify(features || []),
      },
    });

    res.status(201).json({ success: true, message: "Vehicle added to fleet.", data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.capacity !== undefined) data.capacity = parseInt(data.capacity, 10);
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.driverIncluded !== undefined) data.driverIncluded = data.driverIncluded === true || data.driverIncluded === "true";
    if (data.availability !== undefined) data.availability = data.availability === true || data.availability === "true";
    if (data.features && typeof data.features !== "string") data.features = JSON.stringify(data.features);

    const updated = await prisma.vehicle.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: "Vehicle updated.", data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    res.json({ success: true, message: "Vehicle removed from fleet." });
  } catch (error) {
    next(error);
  }
};
