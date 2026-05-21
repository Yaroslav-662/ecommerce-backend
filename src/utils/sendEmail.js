import dotenv from "dotenv";
dotenv.config();

export async function sendEmail({ to, subject, text, html }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "E-commerce Shop", email: "paroslav662@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API error:", data);
      throw new Error(data.message || "Brevo API error");
    }

    console.log("📤 Email sent via Brevo API:", data.messageId);
    return data;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
}
