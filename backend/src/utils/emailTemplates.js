const getVerificationEmail = (name, token) => {
  const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
  const verificationLink = `${WEB_URL}/verify-email/${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #007bff; margin-bottom: 20px; text-align: center;">Welcome to Mercor Time Tracker!</h2>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationLink}</p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <p>If you didn't create an account, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from Mercor Time Tracker.</p>
      </div>
    </body>
    </html>
  `;
};

const getPasswordResetEmail = (name, token) => {
  const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
  const resetLink = `${WEB_URL}/reset-password/${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h2 style="color: #dc3545; margin-bottom: 20px; text-align: center;">Password Reset Request</h2>
        
        <p>Hi ${name},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace;">${resetLink}</p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">This is an automated message from Mercor Time Tracker.</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getVerificationEmail,
  getPasswordResetEmail
}; 