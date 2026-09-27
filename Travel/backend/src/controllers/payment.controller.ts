import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import prisma from "../config/prisma";
import { generateInvoicePDF } from "../services/invoice.service";

export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    if (booking.customerId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    if (booking.paymentStatus === "PAID") {
      res.status(400).json({ success: false, message: "Booking is already paid in full." });
      return;
    }

    // In a live Stripe integration, stripe.paymentIntents.create would be called here.
    const clientSecret = `pi_${crypto.randomBytes(16).toString("hex")}_secret_${crypto.randomBytes(8).toString("hex")}`;

    res.json({
      success: true,
      data: {
        clientSecret,
        amount: booking.finalPrice,
        currency: "USD",
        bookingNumber: booking.bookingNumber,
        packageTitle: booking.package.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, method, transactionId, notes } = req.body;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true, customer: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    if (booking.customerId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const txnId = transactionId || `TXN_${method}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await prisma.$transaction(async (tx) => {
      // Create payment
      const p = await tx.payment.create({
        data: {
          bookingId,
          amount: booking.finalPrice,
          method: method || "CARD", // CARD | BANK_TRANSFER | CASH
          transactionId: txnId,
          status: "SUCCESS",
          notes: notes || `Payment recorded via ${method}`,
        },
      });

      // Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      // Notify customer
      await tx.notification.create({
        data: {
          userId: booking.customerId,
          title: `Payment Received - #${booking.bookingNumber}`,
          message: `Payment of $${booking.finalPrice.toLocaleString()} USD confirmed via ${method}.`,
          type: "PAYMENT",
          link: `/dashboard?booking=${booking.id}`,
        },
      });

      return p;
    });

    res.json({
      success: true,
      message: "Payment confirmed successfully. Your booking is now secured.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: { include: { destination: true } },
        customer: true,
        travellers: true,
        payments: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    if (role === "CUSTOMER" && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const latestPayment = booking.payments[0];

    const invoice = {
      invoiceNumber: `INV-${booking.bookingNumber}`,
      bookingNumber: booking.bookingNumber,
      date: new Date(booking.createdAt).toLocaleDateString(),
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone || undefined,
      packageTitle: booking.package.title,
      destination: `${booking.package.destination.name}, ${booking.package.destination.country}`,
      travelDate: new Date(booking.travelDate).toLocaleDateString(),
      numberOfPeople: booking.numberOfPeople,
      unitPrice: booking.package.price,
      totalPrice: booking.totalPrice,
      discountAmount: booking.discountAmount,
      finalPrice: booking.finalPrice,
      paymentMethod: latestPayment ? latestPayment.method : "PENDING",
      paymentStatus: booking.paymentStatus,
      transactionId: latestPayment ? latestPayment.transactionId : undefined,
    };

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: { include: { destination: true } },
        customer: true,
        payments: true,
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found." });
      return;
    }

    if (role === "CUSTOMER" && booking.customerId !== userId) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const latestPayment = booking.payments[0];

    const pdfBuffer = await generateInvoicePDF({
      bookingNumber: booking.bookingNumber,
      date: new Date(booking.createdAt).toLocaleDateString(),
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      customerPhone: booking.customer.phone || undefined,
      packageTitle: booking.package.title,
      destination: `${booking.package.destination.name}, ${booking.package.destination.country}`,
      travelDate: new Date(booking.travelDate).toLocaleDateString(),
      numberOfPeople: booking.numberOfPeople,
      unitPrice: booking.package.price,
      totalPrice: booking.totalPrice,
      discountAmount: booking.discountAmount,
      finalPrice: booking.finalPrice,
      paymentMethod: latestPayment ? latestPayment.method : "PENDING",
      paymentStatus: booking.paymentStatus,
      transactionId: latestPayment ? latestPayment.transactionId : undefined,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${booking.bookingNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        include: {
          booking: {
            include: {
              customer: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
              package: {
                select: { id: true, title: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.payment.count(),
    ]);

    res.json({
      success: true,
      data: payments,
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
