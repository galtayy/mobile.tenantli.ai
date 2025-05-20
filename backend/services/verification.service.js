const mailService = require('./mail.service');
const db = require('../config/database');

// Generate random verification code (4 digits)
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Save verification code for a user with expiration (1 hour from now)
const saveVerificationCode = async (userId, code) => {
  try {
    // Set expiration time to 1 hour from now
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    
    // Get local time components for consistent timezone handling
    const year = expiryTime.getFullYear();
    const month = String(expiryTime.getMonth() + 1).padStart(2, '0');
    const day = String(expiryTime.getDate()).padStart(2, '0');
    const hours = String(expiryTime.getHours()).padStart(2, '0');
    const minutes = String(expiryTime.getMinutes()).padStart(2, '0');
    const seconds = String(expiryTime.getSeconds()).padStart(2, '0');
    
    // Format to MySQL DATETIME format manually to preserve the local timezone
    const mySqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    console.log('Setting expiry time:', mySqlDatetime, 'for user ID:', userId);
    console.log('Original JS Date:', expiryTime);
    
    // First check if verification_expires column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'depositshield_db' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'verification_expires'
    `);
    
    // If column doesn't exist, add it first
    if (columns.length === 0) {
      console.log('verification_expires column does not exist, adding it now');
      await db.execute(`
        ALTER TABLE depositshield_db.users 
        ADD COLUMN verification_expires DATETIME NULL
      `);
    }
    
    const query = 'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?';
    await db.execute(query, [code, mySqlDatetime, userId]);
    return code;
  } catch (error) {
    console.error('Error saving verification code:', error);
    throw new Error('Failed to save verification code: ' + error.message);
  }
};

// Send verification email with code
const sendVerificationEmail = async (user, code) => {
  const html = `
    <div style="background-color: #FBF5DA; padding: 40px 20px; min-height: 100vh;">
      <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 390px; margin: 0 auto;">
        <div style="background-color: white; border-radius: 16px; border: 1px solid #F6FEF7; padding: 32px 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #0B1420; font-size: 24px; font-weight: 600; margin: 0; line-height: 32px;">Verify Your Account</h2>
          </div>
          
          <p style="color: #515964; font-size: 16px; margin-bottom: 8px;">Hi ${user.name || 'there'},</p>
          
          <p style="color: #515964; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Welcome to tenantli! Please enter this verification code to complete your registration:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background-color: #E8F5EB; color: #1C2C40; padding: 20px 24px; border-radius: 16px; display: inline-block; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="color: #515964; font-size: 14px; text-align: center; margin: 24px 0;">This code expires in 1 hour</p>
          
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #F6FEF7;">
            <p style="color: #515964; font-size: 13px; line-height: 20px; margin-bottom: 0;">
              If you didn't request this code, please ignore this email.
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

  const result = await mailService.sendEmail({
    to: user.email,
    subject: 'Verify Your tenantli Account',
    html: html,
    text: `Hello ${user.name}, Thank you for registering with tenantli. Please use the following verification code to complete your registration: ${code}. This code will expire in 1 hour.`
  });

  return result;
};

// Verify user with code
const verifyUser = async (userId, code) => {
  try {
    // First check if verification_expires column exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'depositshield_db' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'verification_expires'
    `);
    
    // If column doesn't exist, add it first
    if (columns.length === 0) {
      console.log('verification_expires column does not exist, adding it now');
      await db.execute(`
        ALTER TABLE depositshield_db.users 
        ADD COLUMN verification_expires DATETIME NULL
      `);
    }
    
    // Get the user's verification code and expiration from the database
    const [rows] = await db.execute(
      'SELECT verification_code, verification_expires FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const storedCode = rows[0].verification_code;
    const expiryTime = rows[0].verification_expires;

    // Check if code exists
    if (!storedCode) {
      return { success: false, message: 'No verification code found. Please request a new code.' };
    }

    // Check if code has expired
    const now = new Date();
    console.log('Current time:', now);
    console.log('Expiry time from DB:', expiryTime);
    
    if (expiryTime) {
      // Convert MySQL string to Date properly considering timezone
      // MySQL returns local time, but JavaScript new Date() considers it UTC if it's a string
      // So we need to treat it properly as a local time
      let parts = expiryTime.split(/[- :]/);
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
        return { success: false, message: 'Verification code has expired. Please request a new one.' };
      }
    }

    // Check if codes match
    if (code !== storedCode) {
      return { success: false, message: 'Invalid verification code' };
    }

    // Update user to verified status and clear verification code and expiry
    await db.execute(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_expires = NULL WHERE id = ?',
      [userId]
    );

    return { success: true, message: 'User verified successfully' };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { success: false, message: 'Server error while verifying user' };
  }
};

// Check if user is verified
const isUserVerified = async (userId) => {
  const [rows] = await db.execute(
    'SELECT is_verified FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    return false;
  }

  return rows[0].is_verified === 1; // MySQL boolean is returned as 1/0
};

// Manually reset a verification code for troubleshooting
const resetVerificationForUser = async (userId) => {
  try {
    // Generate a new code
    const code = generateVerificationCode();
    
    // Set a new expiry time 24 hours in the future
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 24);
    
    // Get local time components for consistent timezone handling
    const year = expiryTime.getFullYear();
    const month = String(expiryTime.getMonth() + 1).padStart(2, '0');
    const day = String(expiryTime.getDate()).padStart(2, '0');
    const hours = String(expiryTime.getHours()).padStart(2, '0');
    const minutes = String(expiryTime.getMinutes()).padStart(2, '0');
    const seconds = String(expiryTime.getSeconds()).padStart(2, '0');
    
    // Format to MySQL DATETIME format manually to preserve the local timezone
    const mySqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    console.log(`Resetting verification for user ${userId} with new code ${code} and expiry ${mySqlDatetime}`);
    
    // Update the user record
    await db.execute(
      'UPDATE users SET verification_code = ?, verification_expires = ?, is_verified = FALSE WHERE id = ?',
      [code, mySqlDatetime, userId]
    );
    
    // Return the new code for testing
    return { code, expiryTime: mySqlDatetime };
  } catch (error) {
    console.error('Error resetting verification:', error);
    throw new Error('Failed to reset verification: ' + error.message);
  }
};

module.exports = {
  generateVerificationCode,
  saveVerificationCode,
  sendVerificationEmail,
  verifyUser,
  isUserVerified,
  resetVerificationForUser
};