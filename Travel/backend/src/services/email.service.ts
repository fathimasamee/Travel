import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_USER !== "demo") {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (err) {
        console.warn("⚠️ SMTP Transporter initialization failed, running in simulation mode:", err);
      }
    }
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    console.log(`📨 [Email Service] Sending email to: ${to} | Subject: "${subject}"`);
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_FROM || "TravelSphere Concierge <concierge@travelsphere.com>",
          to,
          subject,
          html,
        });
        console.log(`✅ [Email Service] Email delivered to ${to}`);
        return true;
      } catch (error) {
        console.error(`❌ [Email Service] Error sending email via SMTP:`, error);
        return false;
      }
    } else {
      // Graceful simulated delivery
      console.log(`💌 [Email Service Simulated] Preview: "${subject}" -> Delivered to memory for ${to}`);
      return true;
    }
  }

  async sendBookingConfirmation(email: string, name: string, bookingNumber: string, packageTitle: string, travelDate: string, amount: number) {
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">TravelSphere</h1>
          <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">Curated Commercial Luxury Journeys</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Your Journey is Confirmed, ${name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thank you for choosing TravelSphere. Your booking for <strong>${packageTitle}</strong> has been secured.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Booking Reference:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0284c7;">${bookingNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Departure Date:</td>
                <td style="padding: 8px 0; font-weight: 600; text-align: right;">${travelDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Total Amount:</td>
                <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #10b981; font-size: 16px;">$${amount.toLocaleString()} USD</td>
              </tr>
            </table>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our dedicated travel concierge will reach out 48 hours prior to your travel date with final executive transfer arrangements.
          </p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 12px;">
          © ${new Date().getFullYear()} TravelSphere Global Concierge Ltd. All rights reserved.
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed #${bookingNumber} - ${packageTitle}`,
      html,
    });
  }

  async sendPasswordReset(email: string, name: string, resetToken: string) {
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7;">Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>You requested a password reset for your TravelSphere account. Click the button below to set a new password. This link expires in 1 hour.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this, please disregard this email.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset your TravelSphere Password",
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
