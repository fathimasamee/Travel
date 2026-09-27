import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import emailService from "../services/email.service";

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const {
      packageId,
      travelDate,
      numberOfPeople,
      travellers,
      couponCode,
      specialRequests,
    } = req.body;

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { destination: true },
    });

    if (!pkg) {
      res.status(404).json({ success: false, message: "Tour package not found." });
      return;
    }

    const guests = parseInt(numberOfPeople, 10) || 1;

    if (pkg.availableSeats < guests) {
      res.status(400).json({
        success: false,
        message: `Only ${pkg.availableSeats} seat(s) remaining for this tour package.`,
      });
      return;
    }

    // Pricing calculation
    const basePrice = pkg.price;
    const packageDiscountAmount = (basePrice * (pkg.discount / 100)) * guests;
    let subtotal = (basePrice * guests) - packageDiscountAmount;
    let couponDiscount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive && new Date() <= coupon.validUntil && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === "PERCENTAGE") {
          couponDiscount = subtotal * (coupon.discountValue / 100);
          if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
            couponDiscount = coupon.maxDiscount;
          }
        } else {
          couponDiscount = coupon.discountValue;
        }

        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { timesUsed: { increment: 1 } },
        });
      }
    }

    const totalDiscount = packageDiscountAmount + couponDiscount;
    const finalPrice = Math.max(0, subtotal - couponDiscount);
    const bookingNumber = `TS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await prisma.user.findUnique({ where: { id: customerId } });

    // Execute in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Decrement seats
      await tx.package.update({
        where: { id: pkg.id },
        data: { availableSeats: { decrement: guests } },
      });

      // Create Booking
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId,
          packageId,
          travelDate: new Date(travelDate),
          returnDate: new Date(new Date(travelDate).getTime() + pkg.durationDays * 24 * 60 * 60 * 1000),
          numberOfPeople: guests,
          totalPrice: basePrice * guests,
          discountAmount: totalDiscount,
          finalPrice,
          couponCode: couponCode ? couponCode.toUpperCase().trim() : null,
          status: "PENDING",
          paymentStatus: "UNPAID",
          specialRequests: specialRequests || null,
        },
      });

      // Create travellers
      if (Array.isArray(travellers) && travellers.length > 0) {
        for (let i = 0; i < travellers.length; i++) {
          const t = travellers[i];
          await tx.traveller.create({
            data: {
              bookingId: newBooking.id,
              fullName: t.fullName || `${user?.firstName} ${user?.lastName}`,
              email: t.email || user?.email,
              phone: t.phone || user?.phone,
              passportNumber: t.passportNumber || null,
              age: t.age ? parseInt(t.age, 10) : null,
              gender: t.gender || null,
              isLead: i === 0,
            },
          });
        }
      } else {
        // Fallback: create lead traveller with customer info
        await tx.traveller.create({
          data: {
            bookingId: newBooking.id,
            fullName: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
            phone: user?.phone,
            isLead: true,
          },
        });
      }

      // Customer notification
      await tx.notification.create({
        data: {
          userId: customerId,
          title: `Booking Created #${bookingNumber}`,
          message: `Your booking for ${pkg.title} has been received. Please proceed to payment to confirm.`,
          type: "BOOKING",
          link: `/dashboard?booking=${newBooking.id}`,
        },
      });

      return newBooking;
    });

    // Send confirmation email asynchronously
    if (user?.email) {
      emailService.sendBookingConfirmation(
        user.email,
        `${user.firstName} ${user.lastName}`,
        bookingNumber,
        pkg.title,
        new Date(travelDate).toLocaleDateString(),
        finalPrice
      );
    }

    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        package: { include: { destination: true } },
        travellers: true,
        payments: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: fullBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const bookings = await prisma.booking.findMany({
      where: { customerId },
      include: {
        package: {
          include: { destination: true },
        },
        travellers: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        package: {
          include: {
            destination: true,
            hotel: true,
            vehicle: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        travellers: true,
        payments: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    // Role check: customers can only view their own bookings
    if (role === "CUSTOMER" && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { package: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    if (role === "CUSTOMER" && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    if (booking.status === "CANCELLED") {
      res.status(400).json({ success: false, message: "Booking is already cancelled." });
      return;
    }

    // Restore package seats and set status
    const updated = await prisma.$transaction(async (tx) => {
      await tx.package.update({
        where: { id: booking.packageId },
        data: { availableSeats: { increment: booking.numberOfPeople } },
      });

      return tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: cancellationReason || "Cancelled by user",
        },
        include: { package: true },
      });
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        title: `Booking Cancelled #${booking.bookingNumber}`,
        message: `Your booking for ${booking.package.title} has been cancelled.`,
        type: "BOOKING",
      },
    });

    res.json({
      success: true,
      message: "Booking cancelled successfully. Seats have been restored.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffAssignedBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const staffId = req.user!.userId;

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { staffId },
          { staffId: null }, // unassigned bookings also visible for staff ops
        ],
      },
      include: {
        package: { include: { destination: true } },
        customer: true,
        travellers: true,
        payments: true,
      },
      orderBy: { travelDate: "asc" },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, staffId, paymentStatus } = req.body;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(staffId !== undefined && { staffId }),
      },
      include: {
        package: true,
        customer: true,
      },
    });

    // Notify customer on status update
    await prisma.notification.create({
      data: {
        userId: updated.customerId,
        title: `Booking Update #${updated.bookingNumber}`,
        message: `Your booking status has changed to: ${updated.status}.`,
        type: "BOOKING",
        link: `/dashboard?booking=${updated.id}`,
      },
    });

    res.json({
      success: true,
      message: `Booking #${updated.bookingNumber} updated to ${updated.status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOperationsNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { operationsNotes } = req.body;

    const updated = await prisma.booking.update({
      where: { id },
      data: { operationsNotes },
    });

    res.json({
      success: true,
      message: "Operations notes saved.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, paymentStatus, search, page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== "ALL") where.status = status as string;
    if (paymentStatus && paymentStatus !== "ALL") where.paymentStatus = paymentStatus as string;
    if (search) {
      const q = search as string;
      where.OR = [
        { bookingNumber: { contains: q } },
        { customer: { firstName: { contains: q } } },
        { customer: { lastName: { contains: q } } },
        { customer: { email: { contains: q } } },
        { package: { title: { contains: q } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          package: { include: { destination: true } },
          customer: true,
          staff: true,
          travellers: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
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
