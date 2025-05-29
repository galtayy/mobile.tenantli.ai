const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const verificationService = require('../services/verification.service');
const mailService = require('../services/mail.service');
const db = require('../config/database');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'This email address is already in use' });
    }

    // Create new user
    const userId = await User.create({ name, email, password });
    console.log(`User registered with ID: ${userId}`);

    // Generate verification code
    const verificationCode = verificationService.generateVerificationCode();
    console.log(`Generated verification code ${verificationCode} for new user ID ${userId}`);
    
    // Save verification code for user
    await verificationService.saveVerificationCode(userId, verificationCode);
    
    // Get user information
    const user = await User.findById(userId);

    // Send verification email
    const emailResult = await verificationService.sendVerificationEmail(user, verificationCode);

    // Create temporary JWT token with short expiry
    const tempToken = jwt.sign(
      { user: { id: user.id, name: user.name, email: user.email, needsVerification: true } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Short expiry for verification
    );

    res.status(201).json({
      message: 'User registered. Please check your email for verification code.',
      tempToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        needsVerification: true
      },
      userId: user.id, // Add userId to make it easily available for frontend
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('Verify Email Request:', {
      body: req.body,
      userId: req.body.userId || req.body.id, // Check both variants
      code: req.body.code
    });
    
    // Support both userId and id param names for backward compatibility
    const userId = req.body.userId || req.body.id;
    const { code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and verification code are required' });
    }

    // Check user exists before attempting verification
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.error(`User ID ${userId} not found in database`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Verifying code ${code} for user ID ${userId}`);

    // Verify the user with the provided code
    const result = await verificationService.verifyUser(userId, code);
    console.log('Verification result:', result);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Get user information
    const user = await User.findById(userId);

    // Create JWT token
    const token = jwt.sign(
      { user: { id: user.id, name: user.name, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Email verified successfully',
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new verification code
    const verificationCode = verificationService.generateVerificationCode();
    
    console.log(`Generating new verification code ${verificationCode} for user ID ${userId}`);
    
    // Save verification code for user with expiration
    await verificationService.saveVerificationCode(userId, verificationCode);
    
    // Send verification email
    const emailResult = await verificationService.sendVerificationEmail(user, verificationCode);

    // Log success for debugging
    console.log(`Verification code sent to ${user.email}, email success: ${emailResult.success}`);

    res.json({
      success: true,
      message: 'A new verification code has been sent to your email',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Resend verification code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    const isVerified = await verificationService.isUserVerified(user.id);
    
    if (!isVerified) {
      // Generate a new verification code
      const verificationCode = verificationService.generateVerificationCode();
      console.log(`Login: Generating new verification code ${verificationCode} for user ID ${user.id}`);
      
      await verificationService.saveVerificationCode(user.id, verificationCode);
      
      // Send verification email
      const emailResult = await verificationService.sendVerificationEmail(user, verificationCode);
      console.log(`Verification code sent to ${user.email}, email success: ${emailResult.success}`);

      // Create temporary JWT token
      const tempToken = jwt.sign(
        { user: { id: user.id, name: user.name, email: user.email, needsVerification: true } },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short expiry for verification
      );

      return res.json({
        message: 'Please verify your email. A new verification code has been sent.',
        tempToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          needsVerification: true
        },
        userId: user.id // Add userId to make it easily available for frontend
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { user: { id: user.id, name: user.name, email: user.email } },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    // Get user information (Added to req.user by middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is verified
    const isVerified = await verificationService.isUserVerified(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      is_verified: isVerified
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if email exists
exports.checkEmail = async (req, res) => {
  try {
    console.log('Check email request body:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.log('Email is missing in request');
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('Checking if email exists:', email);
    const user = await User.findByEmail(email);
    console.log('User found:', !!user);
    
    // Return status without exposing user information
    res.json({ exists: !!user });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request password reset - generate and send code
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Security: Return a specific indicator for frontend
      // but with a generic message for security
      return res.json({ 
        success: false,
        userExists: false,
        message: 'If this email is registered, a verification code will be sent.' 
      });
    }
    
    // Generate verification code
    const resetCode = verificationService.generateVerificationCode();
    
    // Store reset code in database with expiry time (1 hour from now)
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);
    
    // Format date to MySQL DATETIME format manually to preserve the local timezone
    const year = resetExpiry.getFullYear();
    const month = String(resetExpiry.getMonth() + 1).padStart(2, '0');
    const day = String(resetExpiry.getDate()).padStart(2, '0');
    const hours = String(resetExpiry.getHours()).padStart(2, '0');
    const minutes = String(resetExpiry.getMinutes()).padStart(2, '0');
    const seconds = String(resetExpiry.getSeconds()).padStart(2, '0');
    
    // Format to MySQL DATETIME format
    const mySqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    console.log('Setting reset expiry time:', mySqlDatetime, 'for user email:', email);
    
    // Save reset code and expiry to user record
    await db.execute(
      'UPDATE users SET reset_code = ?, reset_expires = ? WHERE id = ?',
      [resetCode, mySqlDatetime, user.id]
    );
    
    // Create email content for password reset
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4F46E5;">Reset Your tenantli Password</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Please use the following verification code to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f3f4f6; padding: 15px; border-radius: 5px;">${resetCode}</div>
        </div>
        <p>If you did not request to reset your password, please ignore this email or contact support.</p>
        <p>This code will expire in 1 hour.</p>
        <p>Thank you for using tenantli!</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `;
    
    // Send password reset email
    const emailResult = await mailService.sendEmail({
      to: user.email,
      subject: 'Reset Your tenantli Password',
      html: html,
      text: `Hello ${user.name}, We received a request to reset your password. Please use the following verification code to reset your password: ${resetCode}. This code will expire in 1 hour.`
    });
    
    res.json({
      success: true,
      message: 'Password reset code has been sent to your email',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify reset code and issue reset token
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    
    if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Security: Don't reveal if user exists or not
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Get reset code from database
    const [rows] = await db.execute(
      'SELECT reset_code, reset_expires FROM users WHERE id = ?',
      [user.id]
    );
    
    if (rows.length === 0 || !rows[0].reset_code) {
      return res.status(400).json({ message: 'No password reset was requested for this account' });
    }
    
    const { reset_code, reset_expires } = rows[0];
    
    // Check if reset code has expired
    const now = new Date();
    console.log('Current time:', now);
    console.log('Expiry time from DB:', reset_expires);
    
    if (reset_expires) {
      // Parse MySQL datetime string properly considering timezone
      // Split the MySQL datetime string into its components
      let parts = reset_expires.split(/[- :]/);
      // Format: YYYY-MM-DD HH:MM:SS
      // parts[0] = year, parts[1] = month (0-based), parts[2] = day, 
      // parts[3] = hour, parts[4] = minute, parts[5] = second
      
      // Create date using local timezone (month is 0-indexed in JavaScript)
      const expiryDate = new Date(
        parts[0], parts[1]-1, parts[2], 
        parts[3], parts[4], parts[5]
      );
      
      console.log('Parsed expiry time (local):', expiryDate);
      console.log('Is expired?', now > expiryDate);
      
      if (now > expiryDate) {
        return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
      }
    }
    
    // Verify that codes match
    if (verificationCode !== reset_code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store reset token in database with expiry time (15 minutes from now)
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + 15);
    
    // Format date to MySQL DATETIME format manually to preserve the local timezone
    const year = tokenExpiry.getFullYear();
    const month = String(tokenExpiry.getMonth() + 1).padStart(2, '0');
    const day = String(tokenExpiry.getDate()).padStart(2, '0');
    const hours = String(tokenExpiry.getHours()).padStart(2, '0');
    const minutes = String(tokenExpiry.getMinutes()).padStart(2, '0');
    const seconds = String(tokenExpiry.getSeconds()).padStart(2, '0');
    
    // Format to MySQL DATETIME format
    const mySqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    console.log('Setting token expiry time:', mySqlDatetime, 'for user email:', email);
    
    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ?, reset_code = NULL, reset_expires = NULL WHERE id = ?',
      [hashedToken, mySqlDatetime, user.id]
    );
    
    res.json({
      success: true,
      message: 'Verification successful',
      token: resetToken
    });
  } catch (error) {
    console.error('Reset code verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Security: Don't reveal if user exists or not
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Hash the provided token to match stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Get reset token from database
    const [rows] = await db.execute(
      'SELECT reset_token, reset_token_expires FROM users WHERE id = ?',
      [user.id]
    );
    
    if (rows.length === 0 || !rows[0].reset_token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    const { reset_token, reset_token_expires } = rows[0];
    
    // Check if token has expired
    const now = new Date();
    console.log('Current time:', now);
    console.log('Token expiry time from DB:', reset_token_expires);
    
    if (reset_token_expires) {
      // Parse MySQL datetime string properly considering timezone
      // Split the MySQL datetime string into its components
      let parts = reset_token_expires.split(/[- :]/);
      // Format: YYYY-MM-DD HH:MM:SS
      // parts[0] = year, parts[1] = month (0-based), parts[2] = day, 
      // parts[3] = hour, parts[4] = minute, parts[5] = second
      
      // Create date using local timezone (month is 0-indexed in JavaScript)
      const expiryDate = new Date(
        parts[0], parts[1]-1, parts[2], 
        parts[3], parts[4], parts[5]
      );
      
      console.log('Parsed token expiry time (local):', expiryDate);
      console.log('Is token expired?', now > expiryDate);
      
      if (now > expiryDate) {
        return res.status(400).json({ message: 'Reset token has expired. Please request a new password reset.' });
      }
    }
    
    // Verify that tokens match
    if (hashedToken !== reset_token) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    // Update user's password
    await User.updatePassword(user.id, newPassword);
    
    // Clear reset token fields
    await db.execute(
      'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [user.id]
    );
    
    res.json({
      success: true,
      message: 'Password has been successfully reset'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request email change verification - send verification code to current email for identity confirmation
exports.requestEmailChangeVerification = async (req, res) => {
  try {
    const { currentEmail } = req.body;
    const userId = req.user.id;
    
    if (!currentEmail) {
      return res.status(400).json({ message: 'Current email address is required' });
    }
    
    // Get user and verify the email matches
    const user = await User.findById(userId);
    if (!user || user.email !== currentEmail) {
      return res.status(400).json({ message: 'Email address does not match your account' });
    }
    
    // Generate verification code
    const verificationCode = verificationService.generateVerificationCode();
    console.log(`Generated email change identity verification code ${verificationCode} for user ID ${userId}`);
    
    // Store verification code (reuse existing verification_code field)
    await verificationService.saveVerificationCode(userId, verificationCode);
    
    // Create email content for identity verification
    const html = `
      <div style="background-color: #FBF5DA; padding: 40px 20px; min-height: 100vh;">
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 390px; margin: 0 auto;">
          <div style="background-color: white; border-radius: 16px; border: 1px solid #F6FEF7; padding: 32px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="color: #0B1420; font-size: 24px; font-weight: 600; margin: 0; line-height: 32px;">Verify Your Identity</h2>
            </div>
            
            <p style="color: #515964; font-size: 16px; margin-bottom: 8px;">Hi ${user.name},</p>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin-bottom: 32px;">You've requested to change your email address. To confirm it's you, please enter this verification code:</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background-color: #E8F5EB; color: #1C2C40; padding: 20px 24px; border-radius: 16px; display: inline-block; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #515964; font-size: 14px; text-align: center; margin: 24px 0;">This code expires in 1 hour</p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #F6FEF7;">
              <p style="color: #515964; font-size: 13px; line-height: 20px; margin-bottom: 0;">
                If you didn't request this email change, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <p style="color: #515964; font-size: 12px; margin: 0;">
              © 2024 tenantli. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Send verification email to current email address
    const emailResult = await mailService.sendEmail({
      to: currentEmail,
      subject: 'Verify Your Identity - tenantli',
      html: html,
      text: `Hello ${user.name}, You've requested to change your email address. Please use the following verification code to verify your identity: ${verificationCode}. This code will expire in 1 hour.`
    });
    
    res.json({
      success: true,
      message: 'Verification code sent to your current email address',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Request email change verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request email change - send verification code to new email
exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;
    
    if (!newEmail) {
      return res.status(400).json({ message: 'New email address is required' });
    }
    
    // Check if new email is already in use
    const existingUser = await User.findByEmail(newEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'This email address is already in use' });
    }
    
    // Generate verification code
    const verificationCode = verificationService.generateVerificationCode();
    console.log(`Generated email change verification code ${verificationCode} for user ID ${userId}`);
    
    // Store email change request with expiration (1 hour from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    
    // Format date to MySQL DATETIME format
    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const day = String(expiryDate.getDate()).padStart(2, '0');
    const hours = String(expiryDate.getHours()).padStart(2, '0');
    const minutes = String(expiryDate.getMinutes()).padStart(2, '0');
    const seconds = String(expiryDate.getSeconds()).padStart(2, '0');
    const mySqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    // Store the email change request
    await db.execute(
      'UPDATE users SET email_change_code = ?, email_change_expires = ?, new_email = ? WHERE id = ?',
      [verificationCode, mySqlDatetime, newEmail, userId]
    );
    
    // Get user information for email
    const user = await User.findById(userId);
    
    // Create email content
    const html = `
      <div style="background-color: #FBF5DA; padding: 40px 20px; min-height: 100vh;">
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 390px; margin: 0 auto;">
          <div style="background-color: white; border-radius: 16px; border: 1px solid #F6FEF7; padding: 32px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="color: #0B1420; font-size: 24px; font-weight: 600; margin: 0; line-height: 32px;">Verify Your New Email</h2>
            </div>
            
            <p style="color: #515964; font-size: 16px; margin-bottom: 8px;">Hi ${user.name},</p>
            
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin-bottom: 16px;">You've requested to change your email address to:</p>
            <p style="color: #0B1420; font-size: 16px; font-weight: 600; margin-bottom: 16px;">${newEmail}</p>
            <p style="color: #515964; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Please enter this verification code to confirm the change:</p>
            
            <div style="text-align: center; margin: 32px 0;">
              <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background-color: #E8F5EB; color: #1C2C40; padding: 20px 24px; border-radius: 16px; display: inline-block; font-family: monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #515964; font-size: 14px; text-align: center; margin: 24px 0;">This code expires in 1 hour</p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #F6FEF7;">
              <p style="color: #515964; font-size: 13px; line-height: 20px; margin-bottom: 0;">
                If you didn't request this email change, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <p style="color: #515964; font-size: 12px; margin: 0;">
              © 2024 tenantli. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Send verification email to NEW email address
    const emailResult = await mailService.sendEmail({
      to: newEmail,
      subject: 'Verify Your New Email Address - tenantli',
      html: html,
      text: `Hello ${user.name}, You've requested to change your email address. Please use the following verification code: ${verificationCode}. This code will expire in 1 hour.`
    });
    
    res.json({
      success: true,
      message: 'Verification code sent to your new email address',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Request email change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email change code and update user's email
exports.verifyEmailChange = async (req, res) => {
  try {
    const { userId, code, newEmail } = req.body;
    
    if (!userId || !code || !newEmail) {
      return res.status(400).json({ message: 'User ID, verification code, and new email are required' });
    }
    
    // Get email change data from database
    const [rows] = await db.execute(
      'SELECT email_change_code, email_change_expires, new_email FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0 || !rows[0].email_change_code) {
      return res.status(400).json({ message: 'No email change request found for this account' });
    }
    
    const { email_change_code, email_change_expires, new_email } = rows[0];
    
    // Verify that the new email matches
    if (new_email !== newEmail) {
      return res.status(400).json({ message: 'Email change request mismatch' });
    }
    
    // Check if code has expired
    const now = new Date();
    if (email_change_expires) {
      let parts = email_change_expires.split(/[- :]/);
      const expiryDate = new Date(
        parts[0], parts[1]-1, parts[2], 
        parts[3], parts[4], parts[5]
      );
      
      if (now > expiryDate) {
        return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
      }
    }
    
    // Verify that codes match
    if (code !== email_change_code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Check again if new email is available (race condition protection)
    const existingUser = await User.findByEmail(newEmail);
    if (existingUser && existingUser.id !== parseInt(userId)) {
      return res.status(400).json({ message: 'This email address is already in use' });
    }
    
    // Update user's email and clear email change fields
    await db.execute(
      'UPDATE users SET email = ?, email_change_code = NULL, email_change_expires = NULL, new_email = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newEmail, userId]
    );
    
    console.log(`Email successfully changed for user ID ${userId} to ${newEmail}`);
    
    res.json({
      success: true,
      message: 'Email address successfully updated'
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};