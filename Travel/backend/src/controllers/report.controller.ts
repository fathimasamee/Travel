import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const exportBookingsCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        customer: true,
        package: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Booking Number",
      "Customer Name",
      "Customer Email",
      "Package Title",
      "Travel Date",
      "Guests",
      "Total Price (USD)",
      "Discount (USD)",
      "Final Price (USD)",
      "Status",
      "Payment Status",
      "Created At",
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingNumber}"`,
      `"${b.customer.firstName} ${b.customer.lastName}"`,
      `"${b.customer.email}"`,
      `"${b.package.title.replace(/"/g, '""')}"`,
      `"${new Date(b.travelDate).toISOString().split("T")[0]}"`,
      b.numberOfPeople,
      b.totalPrice,
      b.discountAmount,
      b.finalPrice,
      `"${b.status}"`,
      `"${b.paymentStatus}"`,
      `"${new Date(b.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=TravelSphere-Bookings-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportRevenueCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: { customer: true, package: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Transaction ID",
      "Booking Number",
      "Customer Email",
      "Tour Package",
      "Payment Method",
      "Amount (USD)",
      "Status",
      "Date",
    ];

    const rows = payments.map((p) => [
      `"${p.transactionId}"`,
      `"${p.booking.bookingNumber}"`,
      `"${p.booking.customer.email}"`,
      `"${p.booking.package.title.replace(/"/g, '""')}"`,
      `"${p.method}"`,
      p.amount,
      `"${p.status}"`,
      `"${new Date(p.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=TravelSphere-Revenue-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const exportUsersCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    });

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Phone",
      "Role",
      "Total Bookings",
      "Registered Date",
    ];

    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.firstName} ${u.lastName}"`,
      `"${u.email}"`,
      `"${u.phone || ""}"`,
      `"${u.role}"`,
      u._count.bookings,
      `"${new Date(u.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=TravelSphere-Users-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
