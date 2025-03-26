const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendVerificationEmail = async (email, code) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F22E63;">Email Verification</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};