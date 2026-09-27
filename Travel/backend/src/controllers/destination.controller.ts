import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const getAllDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, search, featured } = req.query;

    const where: any = {};
    if (category && category !== "All") {
      where.category = category as string;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (search) {
      const q = search as string;
      where.OR = [
        { name: { contains: q } },
        { country: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const destinations = await prisma.destination.findMany({
      where,
      include: {
        packages: {
          select: { price: true, discount: true },
        },
        _count: {
          select: { packages: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    const enriched = destinations.map((d) => {
      const prices = d.packages.map((p) => p.price * (1 - p.discount / 100));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        ...d,
        startingPrice: minPrice,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getPopularDestinations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isFeatured: true },
      take: 6,
      include: {
        packages: {
          select: { price: true, discount: true },
        },
        _count: {
          select: { packages: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    const enriched = destinations.map((d) => {
      const prices = d.packages.map((p) => p.price * (1 - p.discount / 100));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        ...d,
        startingPrice: minPrice,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: {
        packages: {
          where: { status: "ACTIVE" },
        },
        hotels: true,
      },
    });

    if (!destination) {
      res.status(404).json({ success: false, message: "Destination not found." });
      return;
    }

    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

export const createDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, country, description, image, location, category, rating, isFeatured } = req.body;

    const destination = await prisma.destination.create({
      data: {
        name,
        country,
        description,
        image,
        location,
        category,
        rating: rating ? parseFloat(rating) : 4.8,
        isFeatured: isFeatured === true || isFeatured === "true",
      },
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully.",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, country, description, image, location, category, rating, isFeatured } = req.body;

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(country && { country }),
        ...(description && { description }),
        ...(image && { image }),
        ...(location && { location }),
        ...(category && { category }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(isFeatured !== undefined && { isFeatured: isFeatured === true || isFeatured === "true" }),
      },
    });

    res.json({
      success: true,
      message: "Destination updated successfully.",
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.destination.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Destination deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
