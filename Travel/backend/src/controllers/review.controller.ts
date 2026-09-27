import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

const updatePackageRatingStats = async (packageId: string) => {
  const reviews = await prisma.review.findMany({
    where: { packageId, isApproved: true },
    select: { rating: true },
  });

  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;

  await prisma.package.update({
    where: { id: packageId },
    data: {
      reviewCount: count,
      rating: parseFloat(avg.toFixed(2)),
    },
  });
};

export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { packageId, rating, comment } = req.body;

    const parsedRating = parseInt(rating, 10);
    if (parsedRating < 1 || parsedRating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        packageId,
        rating: parsedRating,
        comment,
        isApproved: true,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatar: true },
        },
      },
    });

    await updatePackageRatingStats(packageId);

    res.status(201).json({
      success: true,
      message: "Thank you for sharing your experience! Review posted.",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getPackageReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { packageId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { packageId, isApproved: true },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const editReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { rating, comment } = req.body;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    if (role === "CUSTOMER" && existing.userId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating, 10) }),
        ...(comment && { comment }),
      },
    });

    await updatePackageRatingStats(updated.packageId);

    res.json({ success: true, message: "Review updated successfully.", data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    if (role === "CUSTOMER" && existing.userId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    await prisma.review.delete({ where: { id } });
    await updatePackageRatingStats(existing.packageId);

    res.json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          package: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.review.count(),
    ]);

    res.json({
      success: true,
      data: reviews,
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

export const toggleReviewApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found." });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: !review.isApproved },
    });

    await updatePackageRatingStats(updated.packageId);

    res.json({
      success: true,
      message: `Review ${updated.isApproved ? "approved" : "hidden"}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
