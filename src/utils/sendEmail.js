import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"E-commerce Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("📤 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
}
