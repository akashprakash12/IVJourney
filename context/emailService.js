import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Public URL to your hosted image
const INDUSTRIAL_IMAGE_URL = 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || 'IVJourney <onboarding@resend.dev>';
    
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `🎉 Welcome to IVJourney - Your Industrial Visit Journey Begins!`,
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
          
          <!-- Use hosted image URL -->
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
              
              <!-- Fallback text for images -->
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
    });
    
    console.log('Email with industrial image sent to:', email);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send welcome email');
  }
};