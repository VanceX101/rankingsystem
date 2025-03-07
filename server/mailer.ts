import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendDailyEvaluationEmail(to: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@evaluation.com",
      to,
      subject: "Daily Evaluation Reminder",
      html: `
        <h2>Daily Evaluation Reminder</h2>
        <p>Please complete your daily evaluation for today.</p>
        <a href="${process.env.APP_URL}/evaluation-form" style="padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
          Complete Evaluation
        </a>
      `,
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
