import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const getAllPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      destinationId,
      minPrice,
      maxPrice,
      category,
      durationDays,
      status,
      sortBy = "featured",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // By default, public sees only ACTIVE packages unless status explicitly queried (e.g. admin)
    if (status) {
      where.status = status as string;
    } else {
      where.status = "ACTIVE";
    }

    if (destinationId && destinationId !== "all") {
      where.destinationId = destinationId as string;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (durationDays) {
      where.durationDays = { lte: parseInt(durationDays as string, 10) };
    }

    if (category && category !== "all") {
      where.destination = { category: category as string };
    }

    if (search) {
      const q = search as string;
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { destination: { name: { contains: q } } },
        { destination: { country: { contains: q } } },
      ];
    }

    // Sorting
    let orderBy: any = { featured: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "rating_desc") orderBy = { rating: "desc" };
    if (sortBy === "newest") orderBy = { createdAt: "desc" };

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        include: {
          destination: true,
          hotel: true,
          vehicle: true,
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.package.count({ where }),
    ]);

    // Parse JSON fields
    const parsedPackages = packages.map((pkg) => ({
      ...pkg,
      gallery: typeof pkg.gallery === "string" ? JSON.parse(pkg.gallery || "[]") : pkg.gallery,
      includedServices: typeof pkg.includedServices === "string" ? JSON.parse(pkg.includedServices || "[]") : pkg.includedServices,
      excludedServices: typeof pkg.excludedServices === "string" ? JSON.parse(pkg.excludedServices || "[]") : pkg.excludedServices,
      itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      effectivePrice: pkg.price * (1 - pkg.discount / 100),
    }));

    res.json({
      success: true,
      data: parsedPackages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const packages = await prisma.package.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      include: {
        destination: true,
        _count: {
          select: { reviews: true },
        },
      },
      take: 6,
      orderBy: { rating: "desc" },
    });

    const parsed = packages.map((pkg) => ({
      ...pkg,
      gallery: typeof pkg.gallery === "string" ? JSON.parse(pkg.gallery || "[]") : pkg.gallery,
      effectivePrice: pkg.price * (1 - pkg.discount / 100),
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        destination: true,
        hotel: true,
        vehicle: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: "Tour package not found." });
      return;
    }

    const parsedPackage = {
      ...pkg,
      gallery: typeof pkg.gallery === "string" ? JSON.parse(pkg.gallery || "[]") : pkg.gallery,
      includedServices: typeof pkg.includedServices === "string" ? JSON.parse(pkg.includedServices || "[]") : pkg.includedServices,
      excludedServices: typeof pkg.excludedServices === "string" ? JSON.parse(pkg.excludedServices || "[]") : pkg.excludedServices,
      itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      effectivePrice: pkg.price * (1 - pkg.discount / 100),
    };

    res.json({ success: true, data: parsedPackage });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      destinationId,
      description,
      duration,
      durationDays,
      price,
      discount,
      maxPeople,
      availableSeats,
      image,
      gallery,
      includedServices,
      excludedServices,
      itinerary,
      status,
      featured,
      hotelId,
      vehicleId,
    } = req.body;

    const newPackage = await prisma.package.create({
      data: {
        title,
        destinationId,
        description,
        duration: duration || `${durationDays || 7} Days`,
        durationDays: durationDays ? parseInt(durationDays, 10) : 7,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        maxPeople: maxPeople ? parseInt(maxPeople, 10) : 15,
        availableSeats: availableSeats ? parseInt(availableSeats, 10) : (maxPeople ? parseInt(maxPeople, 10) : 15),
        image,
        gallery: typeof gallery === "string" ? gallery : JSON.stringify(gallery || []),
        includedServices: typeof includedServices === "string" ? includedServices : JSON.stringify(includedServices || []),
        excludedServices: typeof excludedServices === "string" ? excludedServices : JSON.stringify(excludedServices || []),
        itinerary: typeof itinerary === "string" ? itinerary : JSON.stringify(itinerary || []),
        status: status || "ACTIVE",
        featured: featured === true || featured === "true",
        hotelId: hotelId || null,
        vehicleId: vehicleId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tour package created successfully.",
      data: newPackage,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discount !== undefined) data.discount = parseFloat(data.discount);
    if (data.maxPeople !== undefined) data.maxPeople = parseInt(data.maxPeople, 10);
    if (data.availableSeats !== undefined) data.availableSeats = parseInt(data.availableSeats, 10);
    if (data.durationDays !== undefined) data.durationDays = parseInt(data.durationDays, 10);
    if (data.featured !== undefined) data.featured = data.featured === true || data.featured === "true";
    if (data.gallery && typeof data.gallery !== "string") data.gallery = JSON.stringify(data.gallery);
    if (data.includedServices && typeof data.includedServices !== "string") data.includedServices = JSON.stringify(data.includedServices);
    if (data.excludedServices && typeof data.excludedServices !== "string") data.excludedServices = JSON.stringify(data.excludedServices);
    if (data.itinerary && typeof data.itinerary !== "string") data.itinerary = JSON.stringify(data.itinerary);

    const updated = await prisma.package.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Tour package updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.package.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Tour package deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
