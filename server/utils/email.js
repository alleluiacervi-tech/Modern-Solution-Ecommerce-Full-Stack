const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Kapee Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address - Kapee',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Kapee!</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for signing up with Kapee! To complete your registration, please verify your email address using your verification code:
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 30px; margin: 30px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #333; margin-bottom: 20px; text-align: center;">Your Verification Code</h3>
            <div style="text-align: center; margin: 20px 0;">
              <span style="background: #f3f4f6; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 6px; display: inline-block; color: #333;">
                ${token}
              </span>
            </div>
            <p style="color: #666; text-align: center; margin-top: 20px;">
              This code will expire in 5 minutes.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            If you didn't create an account with Kapee, please ignore this email.
          </p>
          
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              © 2024 Kapee. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email (with link)
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const mailOptions = {
    from: `"Kapee Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Kapee',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #111827; color: #F59E0B; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #2563EB; font-size: 14px; word-break: break-all;">
            ${resetUrl}
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you didn't request a password reset, please ignore this email.
          </p>
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              © 2024 Kapee. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, name, order) => {
  const mailOptions = {
    from: `"Kapee Team" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - #${order.id}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your order! We've received your order and will process it soon.
          </p>
          
          <div style="background: white; border-radius: 8px; padding: 30px; margin: 30px 0; border: 1px solid #e5e7eb;">
            <h3 style="color: #333; margin-bottom: 20px;">Order Details</h3>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Total:</strong> $${order.total}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            You can track your order status by logging into your Kapee account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/orders" 
               style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Order Details
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              © 2024 Kapee. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail
};