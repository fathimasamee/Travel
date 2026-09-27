import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const validateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: "Coupon code is required." });
      return;
    }

    const subtotal = parseFloat(amount) || 0;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      res.status(404).json({ success: false, message: "Invalid or inactive promotional coupon code." });
      return;
    }

    if (new Date() > coupon.validUntil) {
      res.status(400).json({ success: false, message: "This coupon code has expired." });
      return;
    }

    if (coupon.timesUsed >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: "This coupon has reached its maximum redemption limit." });
      return;
    }

    if (subtotal < coupon.minPurchase) {
      res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking purchase of $${coupon.minPurchase.toLocaleString()} USD.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: discount,
        newTotal: Math.max(0, subtotal - discount),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, discountType, discountValue, minPurchase, maxDiscount, validUntil, usageLimit, isActive } = req.body;

    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (existing) {
      res.status(400).json({ success: false, message: "A coupon with this code already exists." });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || "PERCENTAGE",
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : 100,
        isActive: isActive !== undefined ? (isActive === true || isActive === "true") : true,
      },
    });

    res.status(201).json({ success: true, message: "Coupon created.", data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.code) data.code = data.code.toUpperCase().trim();
    if (data.discountValue !== undefined) data.discountValue = parseFloat(data.discountValue);
    if (data.minPurchase !== undefined) data.minPurchase = parseFloat(data.minPurchase);
    if (data.maxDiscount !== undefined) data.maxDiscount = data.maxDiscount ? parseFloat(data.maxDiscount) : null;
    if (data.validUntil) data.validUntil = new Date(data.validUntil);
    if (data.usageLimit !== undefined) data.usageLimit = parseInt(data.usageLimit, 10);
    if (data.isActive !== undefined) data.isActive = data.isActive === true || data.isActive === "true";

    const updated = await prisma.coupon.update({
      where: { id },
      data,
    });

    res.json({ success: true, message: "Coupon updated.", data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, message: "Coupon deleted." });
  } catch (error) {
    next(error);
  }
};
