import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { db } from './server/db.js';

dotenv.config();

// Temporary OTP Store in server memory (email -> { otp, expiresAt })
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailViaNodemailer(toEmail: string, otp: string): Promise<{ sent: boolean; reason?: string }> {
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim().replace(/\s+/g, ''); // Remove spaces from Google App Passwords
  const smtpHost = (process.env.SMTP_HOST || '').trim() || 'smtp.gmail.com';
  const customPort = parseInt(process.env.SMTP_PORT || '', 10);
  const customSecureEnv = process.env.SMTP_SECURE;

  if (!smtpUser || !smtpPass) {
    console.log(`[Email Dispatch Simulation] No SMTP credentials provided. Simulated OTP for ${toEmail}: ${otp}`);
    return { 
      sent: false, 
      reason: 'SMTP credentials not configured in environment variables (SMTP_USER / SMTP_PASS).' 
    };
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #0b1120; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #f59e0b, #eab308); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #020617; letter-spacing: -0.5px;">FutureSet</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e293b; font-weight: 600;">Account Password Reset</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="font-size: 18px; margin-top: 0; color: #f1f5f9;">Hello,</h2>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          We received a request to reset your password for your <strong>FutureSet</strong> account. Please use the following One-Time Password (OTP) code in the app to set your new password:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background-color: #1e293b; border: 2px dashed #f59e0b; border-radius: 12px; padding: 14px 32px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fbbf24;">${otp}</span>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">This OTP is valid for <strong>10 minutes</strong> only.</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 10px; padding: 14px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
            ⚠️ <strong>Security Note:</strong> Never share this OTP with anyone, including FutureSet staff or support. If you did not request this password reset, please ignore this email.
          </p>
        </div>

        <div style="text-align: center;">
          <a href="https://mail.google.com" style="display: inline-block; background: #f59e0b; color: #020617; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">Back to FutureSet</a>
        </div>
      </div>
      <div style="background-color: #020617; padding: 16px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          © ${new Date().getFullYear()} FutureSet Learning & Affiliate Platform. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"FutureSet Support" <${smtpUser}>`,
    to: toEmail,
    subject: `FutureSet Password Reset OTP: ${otp}`,
    text: `Your FutureSet Password Reset OTP is: ${otp}. This code is valid for 10 minutes. Do not share it with anyone.`,
    html: htmlContent
  };

  const isGmail = smtpHost.toLowerCase().includes('gmail') || smtpUser.toLowerCase().endsWith('@gmail.com');
  const configs: Array<{ name: string; options: any }> = [];

  // 1. If custom port/secure parameters were provided, try correctly mapped transport first
  if (!isNaN(customPort)) {
    const isPort465 = customPort === 465;
    const isPort587 = customPort === 587;
    const secureFlag = customSecureEnv !== undefined ? customSecureEnv === 'true' : isPort465;

    configs.push({
      name: `Custom Config (Host: ${smtpHost}, Port: ${customPort}, Secure: ${secureFlag})`,
      options: {
        host: smtpHost,
        port: customPort,
        secure: secureFlag,
        requireTLS: isPort587 || !secureFlag,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      }
    });
  }

  // 2. SMTPS on Port 465 (Implicit TLS - standard for Gmail)
  configs.push({
    name: 'SMTPS (Port 465, Implicit TLS)',
    options: {
      host: smtpHost,
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    }
  });

  // 3. SMTP on Port 587 with STARTTLS (Explicit TLS)
  configs.push({
    name: 'SMTP + STARTTLS (Port 587, Explicit TLS)',
    options: {
      host: smtpHost,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false }
    }
  });

  // 4. Gmail Service Preset
  if (isGmail) {
    configs.push({
      name: 'Gmail Service Preset',
      options: {
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      }
    });
  }

  let lastError: any = null;

  for (const config of configs) {
    try {
      const transporter = nodemailer.createTransport(config.options);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Dispatch Success] Sent via ${config.name} to ${toEmail}: ${info.messageId}`);
      return { sent: true };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Email Dispatch Strategy Failed] ${config.name}: ${err?.message || err}`);
      if (err?.code === 'EAUTH' || err?.responseCode === 535) {
        break; // Authentication failed (wrong user or app password), no need to retry other ports
      }
    }
  }

  console.error('[Email Dispatch All Strategies Failed]', lastError);
  return { 
    sent: false, 
    reason: lastError?.message || 'Failed to dispatch email via SMTP' 
  };
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Permanently save uploaded founder photo to database and disk
  app.post('/api/upload-founder-photo', (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== 'string') {
        res.status(400).json({ success: false, message: 'Valid image data is required' });
        return;
      }

      // 1. Save directly to database.json so it is persisted across any server reboots/builds
      db.setFounderPhoto(imageData);

      // 2. Also write raw JPEG buffer to server asset paths
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const dataDir = path.join(process.cwd(), 'data');
      const publicDir = path.join(process.cwd(), 'public');
      const distDir = path.join(process.cwd(), 'dist');
      const srcDir = path.join(process.cwd(), 'src', 'assets', 'images');

      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
      if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

      fs.writeFileSync(path.join(dataDir, 'founder-photo.jpg'), buffer);
      fs.writeFileSync(path.join(publicDir, 'founder-ceo.jpg'), buffer);
      fs.writeFileSync(path.join(distDir, 'founder-ceo.jpg'), buffer);
      fs.writeFileSync(path.join(srcDir, 'founder-ceo.jpg'), buffer);

      console.log(`[Founder Photo Saved] Wrote ${buffer.length} bytes to database, dataDir, and public assets`);
      res.json({ 
        success: true, 
        message: 'Founder photo permanently saved to database and website assets!' 
      });
    } catch (err: any) {
      console.error('Error saving founder photo:', err);
      res.status(500).json({ success: false, message: 'Failed to write photo to server disk' });
    }
  });

  // Get current founder photo from database or server disk
  app.get('/api/founder-photo', (req, res) => {
    try {
      // 1. Priority: check database base64 photo
      const dbPhoto = db.getFounderPhoto();
      if (dbPhoto) {
        const base64Data = dbPhoto.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.send(buffer);
        return;
      }

      // 2. Check data/founder-photo.jpg
      const dataPhoto = path.join(process.cwd(), 'data', 'founder-photo.jpg');
      if (fs.existsSync(dataPhoto)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(dataPhoto);
        return;
      }

      // 3. Check public/founder-ceo.jpg
      const publicPhoto = path.join(process.cwd(), 'public', 'founder-ceo.jpg');
      if (fs.existsSync(publicPhoto)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(publicPhoto);
        return;
      }

      const srcPhoto = path.join(process.cwd(), 'src', 'assets', 'images', 'founder-ceo.jpg');
      if (fs.existsSync(srcPhoto)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(srcPhoto);
        return;
      }
      res.status(404).json({ success: false, message: 'Founder photo not found' });
    } catch (err: any) {
      res.status(500).json({ success: false });
    }
  });

  app.get('/api/founder-photo-json', (req, res) => {
    let photo = db.getFounderPhoto();
    if (!photo) {
      const dataPhoto = path.join(process.cwd(), 'data', 'founder-photo.jpg');
      if (fs.existsSync(dataPhoto)) {
        try {
          const buffer = fs.readFileSync(dataPhoto);
          photo = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        } catch {}
      }
    }
    res.json({ photo });
  });

  // Send Password Reset OTP Email
  app.post('/api/auth/send-otp-email', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        res.status(400).json({ success: false, message: 'Valid email address is required' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(cleanEmail, { otp, expiresAt });

      // Clean up old entries
      for (const [key, val] of otpStore.entries()) {
        if (val.expiresAt < Date.now()) {
          otpStore.delete(key);
        }
      }

      const emailResult = await sendEmailViaNodemailer(cleanEmail, otp);

      // Masked email for display (e.g. g***r@gmail.com)
      const [userPart, domainPart] = cleanEmail.split('@');
      const maskedUser = userPart.length > 2 
        ? `${userPart[0]}${'*'.repeat(Math.min(userPart.length - 2, 4))}${userPart[userPart.length - 1]}`
        : userPart;
      const maskedEmail = `${maskedUser}@${domainPart || 'gmail.com'}`;

      res.json({
        success: true,
        message: emailResult.sent 
          ? `OTP has been sent to your Gmail inbox (${maskedEmail}). Please check your Gmail app / inbox.` 
          : `OTP generated and dispatched to ${maskedEmail}`,
        emailSent: emailResult.sent,
        maskedEmail,
        expiresInSeconds: 600,
        gmailAppUrl: 'https://mail.google.com'
      });
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      res.status(500).json({ success: false, message: 'Server error while sending OTP' });
    }
  });

  // Verify OTP Endpoint
  app.post('/api/auth/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ success: false, message: 'Email and OTP are required' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const stored = otpStore.get(cleanEmail);

      if (!stored) {
        res.status(400).json({ success: false, message: 'No OTP found or OTP has expired. Please request a new OTP.' });
        return;
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanEmail);
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
      }

      if (stored.otp.trim() !== otp.toString().trim()) {
        res.status(400).json({ success: false, message: '❌ Invalid OTP! The code you entered does not match the code sent to your Gmail.' });
        return;
      }

      res.json({ success: true, message: 'OTP verified successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Server error while verifying OTP' });
    }
  });

  // Reset Password with OTP verification Endpoint
  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const stored = otpStore.get(cleanEmail);

      if (!stored) {
        res.status(400).json({ success: false, message: 'No OTP found or OTP has expired. Please request a new OTP from your Gmail.' });
        return;
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(cleanEmail);
        res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        return;
      }

      if (stored.otp.trim() !== otp.toString().trim()) {
        res.status(400).json({ success: false, message: '❌ Invalid OTP! The code you entered does not match the code sent to your Gmail.' });
        return;
      }

      // Consume OTP
      otpStore.delete(cleanEmail);
      db.resetPassword(cleanEmail, newPassword);
      res.json({ success: true, message: 'OTP verified and password reset successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Server error while resetting password' });
    }
  });

  // ----------------------------------------------------
  // REAL DATABASE SYNC & OPERATIONS
  // ----------------------------------------------------
  // Sync full database state (GET)
  app.get('/api/database/sync', (req, res) => {
    try {
      const data = db.getAllData();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to sync database' });
    }
  });

  // Sync and Merge local data with server database (POST)
  app.post('/api/database/sync', (req, res) => {
    try {
      const { users, withdrawals, transactions, upgrades } = req.body || {};
      const merged = db.mergeData({ users, withdrawals, transactions, upgrades });
      res.json({ success: true, ...merged });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to merge and sync database' });
    }
  });

  // Real-time Referral Code Verification
  app.get('/api/referral/verify', (req, res) => {
    try {
      const code = (req.query.code as string || '').trim().toUpperCase();
      if (!code) {
        res.status(400).json({ valid: false, message: 'Referral code is required.' });
        return;
      }
      const result = db.verifyReferralCode(code);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ valid: false, message: 'Server error verifying referral code.' });
    }
  });

  // User Registration
  app.post('/api/users/register', (req, res) => {
    try {
      const { 
        name, 
        email, 
        whatsapp, 
        password, 
        packageId, 
        packageName, 
        packagePrice, 
        referredByCode, 
        paymentScreenshot, 
        paymentUpiTxId 
      } = req.body;

      if (!name || !email || !whatsapp || !packageId || !packageName || !packagePrice) {
        res.status(400).json({ success: false, message: 'All registration fields are required.' });
        return;
      }

      const result = db.registerUser({
        name,
        email,
        whatsapp,
        password,
        packageId,
        packageName,
        packagePrice: Number(packagePrice),
        referredByCode,
        paymentScreenshot,
        paymentUpiTxId
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        message: 'Registration successful! Your account is pending activation.',
        user: result.user,
        ...db.getAllData()
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  });

  // User Login
  app.post('/api/users/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Gmail address is required.' });
        return;
      }

      const authResult = db.authenticateUser(email, password);

      if (!authResult.success) {
        if (authResult.isPending) {
          res.status(403).json({
            success: false,
            message: authResult.message || 'Your account is pending activation by administrator. Please wait for ID activation. 🙏',
            isPending: true
          });
          return;
        }

        res.status(401).json({
          success: false,
          message: authResult.message || 'Invalid Gmail address or password. Please check and try again.'
        });
        return;
      }

      res.json({
        success: true,
        user: authResult.user,
        message: 'Login successful!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  });

  // Update Profile
  app.post('/api/users/update-profile', (req, res) => {
    try {
      const { userId, name, avatarUrl } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const success = db.updateProfile(userId, { name, avatarUrl });
      if (!success) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  });

  // Update KYC
  app.post('/api/users/update-kyc', (req, res) => {
    try {
      const { userId, kyc } = req.body;
      if (!userId || !kyc) {
        res.status(400).json({ success: false, message: 'User ID and KYC data are required' });
        return;
      }

      const success = db.updateKYC(userId, kyc);
      if (!success) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update KYC' });
    }
  });

  // Create Withdrawal Request
  app.post('/api/withdrawals/create', (req, res) => {
    try {
      const { userId, userName, userEmail, userWhatsapp, amount, upiId, bankName, accountNumber, ifscCode } = req.body;
      if (!userId || !amount || amount <= 0) {
        res.status(400).json({ success: false, message: 'Invalid withdrawal parameters' });
        return;
      }

      const wdr = db.createWithdrawal({
        userId,
        userName,
        userEmail,
        userWhatsapp,
        amount: Number(amount),
        upiId: upiId || '',
        bankName: bankName || '',
        accountNumber,
        ifscCode
      });

      res.json({ success: true, withdrawal: wdr, ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create withdrawal' });
    }
  });

  // Admin User Activation
  app.post('/api/admin/users/activate', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = db.activateUser(userId);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({ success: true, message: 'User activated successfully!', ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to activate user' });
    }
  });

  // Admin User Deletion / Rejection
  app.post('/api/admin/users/delete', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const success = db.deleteUser(userId);
      res.json({ success, message: success ? 'User removed from database' : 'User not found', ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  });

  // Admin Approve Withdrawal
  app.post('/api/admin/withdrawals/approve', (req, res) => {
    try {
      const { withdrawalId } = req.body;
      if (!withdrawalId) {
        res.status(400).json({ success: false, message: 'Withdrawal ID is required' });
        return;
      }

      const success = db.approveWithdrawal(withdrawalId);
      if (!success) {
        res.status(404).json({ success: false, message: 'Withdrawal record not found' });
        return;
      }

      res.json({ success: true, message: 'Withdrawal marked as approved', ...db.getAllData() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to approve withdrawal' });
    }
  });

  // Package Upgrade Request Submission
  app.post('/api/upgrades/submit', (req, res) => {
    try {
      const { 
        userId, 
        userName, 
        userEmail, 
        userWhatsapp,
        currentPackageId, 
        currentPackageName, 
        currentPackagePrice, 
        targetPackageId, 
        targetPackageName, 
        targetPackagePrice, 
        amount, 
        paymentScreenshot, 
        paymentUpiTxId 
      } = req.body;

      if (!userId || !userEmail || !targetPackageId || !paymentScreenshot) {
        res.status(400).json({ success: false, message: 'Missing required upgrade submission data' });
        return;
      }

      const upgrade = db.submitUpgrade({
        userId,
        userName: userName || 'User',
        userEmail,
        userWhatsapp,
        currentPackageId,
        currentPackageName,
        currentPackagePrice,
        targetPackageId,
        targetPackageName,
        targetPackagePrice,
        amount: amount || targetPackagePrice,
        paymentScreenshot,
        paymentUpiTxId
      });

      res.json({
        success: true,
        message: 'Your upgrade payment is successful. Please wait for upgrade activation.',
        upgrade,
        ...db.getAllData()
      });
    } catch (err: any) {
      console.error('Upgrade submission error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit upgrade request' });
    }
  });

  // Admin Approve & Activate Package Upgrade
  app.post('/api/admin/upgrades/approve', (req, res) => {
    try {
      const { upgradeId } = req.body;
      if (!upgradeId) {
        res.status(400).json({ success: false, message: 'Upgrade ID is required' });
        return;
      }

      const result = db.approveUpgrade(upgradeId);
      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        message: result.message || 'Package upgraded successfully!',
        ...db.getAllData()
      });
    } catch (err: any) {
      console.error('Upgrade approval error:', err);
      res.status(500).json({ success: false, message: 'Failed to approve upgrade' });
    }
  });

  // Admin Delete / Reject Package Upgrade
  app.post('/api/admin/upgrades/delete', (req, res) => {
    try {
      const { upgradeId } = req.body;
      if (!upgradeId) {
        res.status(400).json({ success: false, message: 'Upgrade ID is required' });
        return;
      }

      const success = db.deleteUpgrade(upgradeId);
      res.json({
        success,
        message: success ? 'Upgrade request removed' : 'Upgrade record not found',
        ...db.getAllData()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete upgrade record' });
    }
  });

  // Admin Sessions Store (token -> { email, expiresAt })
  const adminSessions = new Map<string, { email: string; expiresAt: number }>();

  function generateAdminToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'fs_adm_';
    for (let i = 0; i < 48; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Admin Login Endpoint (Strict Backend Verification)
  app.post('/api/admin/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Admin email and password are required.' });
        return;
      }

      const authorizedAdminEmail = (process.env.ADMIN_EMAIL || 'gauravgangwar814@gmail.com').toLowerCase().trim();
      const authorizedAdminPassword = (process.env.ADMIN_PASSWORD || 'Admin@Gaurav814').trim();

      const inputEmail = email.toLowerCase().trim();
      const inputPassword = password.toString().trim();

      if (inputEmail !== authorizedAdminEmail || inputPassword !== authorizedAdminPassword) {
        console.warn(`[Admin Auth Rejected] Unauthorized login attempt with email: ${inputEmail}`);
        res.status(401).json({ 
          success: false, 
          message: 'Access Denied: Invalid credentials or unauthorized admin Gmail.' 
        });
        return;
      }

      // Generate 24-hour admin session token
      const token = generateAdminToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      adminSessions.set(token, { email: inputEmail, expiresAt });

      // Clean expired sessions
      for (const [key, session] of adminSessions.entries()) {
        if (session.expiresAt < Date.now()) {
          adminSessions.delete(key);
        }
      }

      console.log(`[Admin Auth Success] Authorized Admin logged in: ${inputEmail}`);
      res.json({
        success: true,
        message: 'Admin authentication successful',
        token,
        admin: {
          email: inputEmail,
          name: 'Gaurav Gangwar',
          role: 'Super Admin'
        },
        expiresAt
      });
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      res.status(500).json({ success: false, message: 'Server error during admin login.' });
    }
  });

  // Admin Session Verification Endpoint
  app.post('/api/admin/verify-token', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : req.body?.token;

      if (!token) {
        res.status(401).json({ valid: false, message: 'No admin token provided.' });
        return;
      }

      const session = adminSessions.get(token);
      if (!session || Date.now() > session.expiresAt) {
        if (session) adminSessions.delete(token);
        res.status(401).json({ valid: false, message: 'Admin session expired or invalid. Please login again.' });
        return;
      }

      res.json({
        valid: true,
        admin: {
          email: session.email,
          name: 'Gaurav Gangwar',
          role: 'Super Admin'
        }
      });
    } catch (err: any) {
      res.status(500).json({ valid: false, message: 'Server error verifying admin session.' });
    }
  });

  // Admin Logout Endpoint
  app.post('/api/admin/logout', (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : req.body?.token;
      if (token) {
        adminSessions.delete(token);
      }
      res.json({ success: true, message: 'Admin logged out successfully' });
    } catch (err: any) {
      res.json({ success: true });
    }
  });

  // Vite Middleware for development / Static Serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FutureSet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
