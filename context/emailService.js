import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, name, role) => {
  try {
    // Always use the configured FROM address
    const fromAddress = process.env.EMAIL_FROM || 'IVJourney <onboarding@resend.dev>';
    
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Welcome to IVJourney, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F22E63;">Welcome, ${name}!</h1>
          <p>You've registered as a <strong>${role}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Start exploring opportunities today!</p>
            ${process.env.NODE_ENV !== 'production' ? 
              '<p style="color: #ff0000;">[TEST MODE] This is a development notification</p>' : ''}
          </div>
          <p>Best regards,<br/>The IVJourney Team</p>
        </div>
      `,
    });
    
    console.log('Email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send welcome email');
  }
};