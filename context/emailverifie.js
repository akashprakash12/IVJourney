const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", // Explicit SMTP server
  port: 587, // TLS port
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // Your App Password
  },
});

exports.sendVerificationEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: `"IVJourney" <${process.env.GMAIL_USER}>`, // Must match auth email
      to: email,
      subject: "Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F22E63;">Email Verification</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code expires in 15 minutes.</p>
          <p>If you didn’t request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log("✅ Email sent to:", email);
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw new Error("Failed to send email. Please try again.");
  }
};