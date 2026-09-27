import PDFDocument from "pdfkit";

interface InvoiceData {
  bookingNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageTitle: string;
  destination: string;
  travelDate: string;
  numberOfPeople: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
}

export const generateInvoicePDF = (data: InvoiceData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Colors
    const primaryColor = "#0284c7";
    const darkColor = "#0f172a";
    const mutedColor = "#64748b";

    // Header
    doc.rect(40, 40, 515, 60).fill("#f8fafc");

    doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold").text("TRAVELSPHERE", 55, 52);
    doc.fillColor(mutedColor).fontSize(9).font("Helvetica").text("LUXURY EXPEDITIONS & BESPOKE TRAVEL", 55, 78);

    doc.fillColor(darkColor).fontSize(16).font("Helvetica-Bold").text("INVOICE / RECEIPT", 400, 52, { align: "right" });
    doc.fillColor(mutedColor).fontSize(9).font("Helvetica").text(`Ref: #${data.bookingNumber}`, 400, 74, { align: "right" });
    doc.text(`Date: ${data.date}`, 400, 87, { align: "right" });

    doc.moveDown(3);

    // Bill To & Booking Info
    const startY = 120;
    doc.fillColor(darkColor).fontSize(11).font("Helvetica-Bold").text("BILLED TO:", 40, startY);
    doc.font("Helvetica").fontSize(10).fillColor(darkColor).text(data.customerName, 40, startY + 16);
    doc.fillColor(mutedColor).text(data.customerEmail, 40, startY + 30);
    if (data.customerPhone) {
      doc.text(data.customerPhone, 40, startY + 44);
    }

    doc.fillColor(darkColor).fontSize(11).font("Helvetica-Bold").text("JOURNEY DETAILS:", 300, startY);
    doc.font("Helvetica").fontSize(10).fillColor(darkColor).text(`Destination: ${data.destination}`, 300, startY + 16);
    doc.fillColor(mutedColor).text(`Departure Date: ${data.travelDate}`, 300, startY + 30);
    doc.text(`Party Size: ${data.numberOfPeople} Traveller(s)`, 300, startY + 44);

    // Table Header
    const tableTop = 200;
    doc.rect(40, tableTop, 515, 24).fill(primaryColor);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10);
    doc.text("Description", 50, tableTop + 7);
    doc.text("Qty", 320, tableTop + 7);
    doc.text("Unit Price", 380, tableTop + 7);
    doc.text("Total", 470, tableTop + 7, { align: "right" });

    // Table Row
    const rowTop = tableTop + 24;
    doc.rect(40, rowTop, 515, 45).fill("#fcfcfc");
    doc.fillColor(darkColor).font("Helvetica-Bold").fontSize(10).text(data.packageTitle, 50, rowTop + 8, { width: 250 });
    doc.font("Helvetica").fontSize(9).fillColor(mutedColor).text(`Includes premium accommodation & guided tours`, 50, rowTop + 24);

    doc.fillColor(darkColor).font("Helvetica").fontSize(10);
    doc.text(`${data.numberOfPeople}`, 320, rowTop + 14);
    doc.text(`$${data.unitPrice.toLocaleString()}`, 380, rowTop + 14);
    doc.text(`$${data.totalPrice.toLocaleString()}`, 470, rowTop + 14, { align: "right" });

    // Summary Box
    const summaryTop = rowTop + 65;
    const summaryX = 320;
    doc.fillColor(darkColor).font("Helvetica").fontSize(10);
    doc.text("Subtotal:", summaryX, summaryTop);
    doc.text(`$${data.totalPrice.toLocaleString()}`, 470, summaryTop, { align: "right" });

    if (data.discountAmount > 0) {
      doc.fillColor("#10b981");
      doc.text("Promotional Discount:", summaryX, summaryTop + 18);
      doc.text(`-$${data.discountAmount.toLocaleString()}`, 470, summaryTop + 18, { align: "right" });
    }

    const totalY = summaryTop + (data.discountAmount > 0 ? 36 : 18);
    doc.rect(summaryX - 10, totalY - 4, 205, 28).fill("#f0f9ff");
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(12);
    doc.text("Final Total:", summaryX, totalY + 4);
    doc.text(`$${data.finalPrice.toLocaleString()} USD`, 470, totalY + 4, { align: "right" });

    // Payment Status Badge
    const payStatusY = totalY + 45;
    doc.fillColor(darkColor).font("Helvetica-Bold").fontSize(10).text("Payment Method:", 40, payStatusY);
    doc.font("Helvetica").text(`${data.paymentMethod} (${data.paymentStatus})`, 140, payStatusY);

    if (data.transactionId) {
      doc.font("Helvetica-Bold").text("Transaction ID:", 40, payStatusY + 16);
      doc.font("Helvetica").text(data.transactionId, 140, payStatusY + 16);
    }

    // Terms & Footer
    doc.rect(40, 680, 515, 1).fill("#e2e8f0");
    doc.fillColor(mutedColor).fontSize(8).font("Helvetica").text(
      "Thank you for traveling with TravelSphere. Cancellations made 30 days prior to departure qualify for full refund. For concierge assistance, email concierge@travelsphere.com or call +1 (800) 555-SPHERE.",
      40,
      695,
      { align: "center", width: 515 }
    );

    doc.end();
  });
};
