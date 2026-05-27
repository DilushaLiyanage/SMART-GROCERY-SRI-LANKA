const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initializes the SMTP transporter.
 */
async function getTransporter() {
  if (transporter) return transporter;

  // 1. Try to use Custom SMTP credentials from environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[SMTP] Configuring custom SMTP server:', process.env.SMTP_HOST);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return transporter;
  }

  // 2. Fall back to Ethereal Email (Auto-generated test inbox)
  try {
    console.log('[SMTP] No custom SMTP credentials found. Initializing Ethereal test mailer...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[SMTP] Ethereal Test Account created successfully!`);
    console.log(`[SMTP] Ethereal User: ${testAccount.user}`);
    console.log(`[SMTP] Ethereal Pass: ${testAccount.pass}`);
    return transporter;
  } catch (err) {
    console.error('[SMTP] Failed to initialize Ethereal transporter:', err.message);
    transporter = null;
    return null;
  }
}

/**
 * Sends a premium HTML OTP Verification Email.
 * @param {string} to Email address of the recipient
 * @param {string} otp Code to verify (4 digits)
 */
async function sendOtpEmail(to, otp) {
  const mailTransporter = await getTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Smart Grocery Sri Lanka" <noreply@smartgrocery.lk>',
    to: to,
    subject: `🔐 Your Verification Code: ${otp}`,
    text: `Your Smart Grocery verification code is ${otp}. This code is valid for 5 minutes.`,
    html: `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #FAFAF8; padding: 40px 20px; text-align: center; color: #1A1A1A;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #EBEBEA; border-radius: 24px; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02);">
          <!-- Logo / Header -->
          <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #0A0A0A; margin-bottom: 24px;">
            Smart <span style="color: #198754;">Grocery</span> Sri Lanka
          </div>
          
          <div style="border-top: 1px solid #F3F3F1; margin-bottom: 28px;"></div>
          
          <!-- Heading -->
          <h2 style="font-size: 22px; font-weight: 700; color: #0A0A0A; margin: 0 0 12px 0;">Verify your email</h2>
          <p style="font-size: 14px; color: #6E6E6B; margin: 0 0 28px 0; line-height: 1.5;">
            Use the 4-digit code below to complete your sign up or sign in process. This code is valid for 5 minutes.
          </p>
          
          <!-- OTP Box -->
          <div style="background-color: #F3F3F1; border-radius: 16px; padding: 20px; margin-bottom: 28px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 850; color: #0A0A0A;">
            ${otp}
          </div>
          
          <p style="font-size: 11px; color: #9A9A96; margin: 0; line-height: 1.4;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="font-size: 11px; color: #9A9A96; margin-top: 24px; text-align: center;">
          &copy; 2026 Smart Grocery Sri Lanka. All rights reserved.
        </div>
      </div>
    `
  };

  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail(mailOptions);
      console.log(`[SMTP] OTP Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      
      // If it's Ethereal, print the preview URL
      if (mailOptions.to.includes('ethereal.email') || !process.env.SMTP_HOST) {
        console.log(`[SMTP] Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
    } catch (err) {
      console.error(`[SMTP] Error sending email to ${to}:`, err.message);
    }
  }

  // Fallback log to console if no SMTP works
  console.log('\n=========================================');
  console.log(`[SMTP FALLBACK] OTP Email to: ${to}`);
  console.log(`[SMTP FALLBACK] Code: ${otp}`);
  console.log('=========================================\n');
  return { success: true, fallback: true };
}

module.exports = {
  sendOtpEmail
};
