import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  try {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // ✅ Gmail з App Password
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // 🧪 Ethereal для тестування
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"E-commerce Shop" <${process.env.EMAIL_USER || "no-reply@example.com"}>`,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = process.env.EMAIL_USER
      ? info.response
      : nodemailer.getTestMessageUrl(info);

    console.log("📤 Email sent:", previewUrl);
    return previewUrl;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
}
