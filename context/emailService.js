const nodemailer = require('nodemailer');

// Public URL to your hosted image
const INDUSTRIAL_IMAGE_URL = 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

// Ensure environment variables are set
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS || !process.env.EMAIL_FROM) {
  throw new Error('Missing required environment variables for email service.');
}

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, name, role) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 Welcome to IVJourney - Your Industrial Visit Journey Begins!',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #F22E63; padding: 20px; text-align: center; color: white; }
              .content { padding: 20px; background-color: #f8f9fa; }
              .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
              .button { background-color: #F22E63; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
              .industry-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 20px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Welcome to IVJourney!</h1>
          </div>
          
          <img src="${INDUSTRIAL_IMAGE_URL}" alt="Industrial Visit" class="industry-img">
          
          <div class="content">
              <h2>Hello ${name},</h2>
              <p>Your registration as a <strong>${role}</strong> is now complete!</p>
              
              <h3>🚀 Get Ready for Your Industrial Journey</h3>
              <p>With IVJourney, you'll gain access to:</p>
              <ul>
                  <li>Exclusive industrial visit opportunities</li>
                  <li>Networking with industry professionals</li>
                  <li>Practical learning experiences</li>
                  <li>Career-enhancing insights</li>
              </ul>
              
              <div style="display: none; max-height: 0px; overflow: hidden;">
                  Industrial Visit Image: ${INDUSTRIAL_IMAGE_URL}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-ivjourney-app.com/dashboard" class="button">Access Your Dashboard</a>
              </div>
          </div>
          
          <div class="footer">
              <p>Best regards,</p>
              <p><strong>The IVJourney Team</strong></p>
          </div>
      </body>
      </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email, 'Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  try {
    console.log(`Attempting to send password reset email to: ${email}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔒 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #F22E63;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to proceed:</p>
          <a href="${resetLink}" 
             style="background-color: #F22E63; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block; 
                    margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email, 'Message ID:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
