import fs from 'fs';
import path from 'path';

export interface UserKYC {
  name: string;
  bankName: string;
  accountNumber?: string;
  ifscCode: string;
  upiId: string;
  isCompleted: boolean;
  updatedAt?: string;
}

export interface UserEarnings {
  today: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
  passiveIncome: number;
}

export interface EarningTransaction {
  id: string;
  userId: string;
  type?: 'direct' | 'passive';
  amount: number;
  packageId: string;
  packageName: string;
  packagePrice: number;
  fromUserId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  directReferrerName?: string;
  timestamp: string;
  note?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  password?: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  referralCode: string;
  referredByCode?: string;
  avatarUrl: string;
  status: 'pending' | 'active';
  createdAt: string;
  paymentScreenshot?: string;
  paymentUpiTxId?: string;
  kyc: UserKYC;
  earnings: UserEarnings;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWhatsapp?: string;
  amount: number;
  upiId: string;
  bankName: string;
  accountNumber?: string;
  ifscCode?: string;
  status: 'pending' | 'processed' | 'approved';
  requestedAt: string;
  approvedAt?: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userWhatsapp?: string;
  currentPackageId: string;
  currentPackageName: string;
  currentPackagePrice: number;
  targetPackageId: string;
  targetPackageName: string;
  targetPackagePrice: number;
  amount: number;
  paymentScreenshot: string;
  paymentUpiTxId?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
}

interface DatabaseSchema {
  users: User[];
  withdrawals: WithdrawalRequest[];
  transactions: EarningTransaction[];
  upgrades: UpgradeRequest[];
  founderPhoto?: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');
const BACKUP_FILE_PATH_1 = path.join(process.cwd(), 'data', 'database.backup.json');
const BACKUP_FILE_PATH_2 = path.join(process.cwd(), 'public', 'database.backup.json');

// Direct Commission Matrix based on package tier limits
const DIRECT_COMMISSION_RATES: Record<string, number> = {
  starter: 180,  // ₹249 package → ₹180 direct commission
  basic: 420,    // ₹599 package → ₹420 direct commission
  gold: 710,     // ₹1012 package → ₹710 direct commission
  diamond: 1610, // ₹2299 package → ₹1610 direct commission
  elite: 3150,   // ₹4299 package → ₹3150 direct commission
  pro: 5200,     // ₹7299 package → ₹5200 direct commission
  p1: 180,
  p2: 420,
  p3: 710,
  p4: 1610,
  p5: 3150,
  p6: 5200
};

const PACKAGE_TIER_ORDER = ['starter', 'basic', 'gold', 'diamond', 'elite', 'pro'];

export function calculateAffiliateCommission(
  purchasedPackageId: string,
  sponsorPackageId: string,
  purchasedPrice: number
): { commission: number; capped: boolean } {
  const pKey = (purchasedPackageId || 'starter').toLowerCase().trim();
  const sKey = (sponsorPackageId || 'starter').toLowerCase().trim();

  const fullDirectRate = DIRECT_COMMISSION_RATES[pKey] || Math.round((purchasedPrice || 0) * 0.7);
  const sponsorMaxAllowed = DIRECT_COMMISSION_RATES[sKey] || fullDirectRate;

  const purchasedIndex = PACKAGE_TIER_ORDER.indexOf(pKey);
  const sponsorIndex = PACKAGE_TIER_ORDER.indexOf(sKey);

  if (sponsorIndex !== -1 && purchasedIndex !== -1) {
    if (purchasedIndex >= sponsorIndex) {
      const isBigger = purchasedIndex > sponsorIndex;
      return { commission: sponsorMaxAllowed, capped: isBigger };
    }
  }

  if (sponsorMaxAllowed < fullDirectRate) {
    return { commission: sponsorMaxAllowed, capped: true };
  }
  return { commission: fullDirectRate, capped: false };
}

export function calculatePassiveIncome(directCommissionEarned: number): number {
  if (directCommissionEarned === 180) return 18;
  if (directCommissionEarned === 420) return 42;
  if (directCommissionEarned === 710) return 71;
  if (directCommissionEarned === 1610) return 161;
  if (directCommissionEarned === 3150) return 315;
  if (directCommissionEarned === 5200) return 520;
  return Math.round(directCommissionEarned * 0.10);
}

export const MASTER_REFERRAL_CODES = [
  'GAURAV',
  'GAURAV814',
  'FUTURESET',
  'FSADMIN',
  'FOUNDER',
  'ADMIN',
  'FS100'
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    withdrawals: [],
    transactions: [],
    upgrades: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

      const candidateFiles = [DB_FILE_PATH, BACKUP_FILE_PATH_1, BACKUP_FILE_PATH_2];
      const mergedUsersMap = new Map<string, User>();
      const mergedWithdrawalsMap = new Map<string, WithdrawalRequest>();
      const mergedTransactionsMap = new Map<string, EarningTransaction>();
      const mergedUpgradesMap = new Map<string, UpgradeRequest>();
      let foundFounderPhoto: string | undefined;

      for (const filePath of candidateFiles) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed) {
              if (Array.isArray(parsed.users)) {
                for (const u of parsed.users) {
                  if (u && (u.id || u.email)) {
                    const key = (u.id || u.email).toLowerCase();
                    if (!mergedUsersMap.has(key)) {
                      mergedUsersMap.set(key, u);
                    } else {
                      const existing = mergedUsersMap.get(key)!;
                      if (u.status === 'active') existing.status = 'active';
                      if (u.kyc?.isCompleted) existing.kyc = u.kyc;
                    }
                  }
                }
              }
              if (Array.isArray(parsed.withdrawals)) {
                for (const w of parsed.withdrawals) if (w && w.id) mergedWithdrawalsMap.set(w.id, w);
              }
              if (Array.isArray(parsed.transactions)) {
                for (const t of parsed.transactions) if (t && t.id) mergedTransactionsMap.set(t.id, t);
              }
              if (Array.isArray(parsed.upgrades)) {
                for (const upg of parsed.upgrades) if (upg && upg.id) mergedUpgradesMap.set(upg.id, upg);
              }
              if (!foundFounderPhoto && typeof parsed.founderPhoto === 'string' && parsed.founderPhoto.startsWith('data:image')) {
                foundFounderPhoto = parsed.founderPhoto;
              }
            }
          } catch (e) {
            console.warn('[DB Load Warn]', filePath, e);
          }
        }
      }

      this.data = {
        users: Array.from(mergedUsersMap.values()),
        withdrawals: Array.from(mergedWithdrawalsMap.values()),
        transactions: Array.from(mergedTransactionsMap.values()),
        upgrades: Array.from(mergedUpgradesMap.values()),
        founderPhoto: foundFounderPhoto || this.getFounderPhoto() || undefined
      };
      this.save();
    } catch (e) {
      console.error('[Database Init Error]:', e);
      this.data = { users: [], withdrawals: [], transactions: [], upgrades: [] };
    }
  }

  public getFounderPhoto(): string | null {
    if (this.data.founderPhoto && this.data.founderPhoto.startsWith('data:image')) {
      return this.data.founderPhoto;
    }
    try {
      const candidates = [
        path.join(process.cwd(), 'data', 'founder-photo.jpg'),
        path.join(process.cwd(), 'public', 'founder-ceo.jpg'),
        path.join(process.cwd(), 'src', 'assets', 'images', 'founder-ceo.jpg')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const buf = fs.readFileSync(p);
          const b64 = `data:image/jpeg;base64,${buf.toString('base64')}`;
          this.data.founderPhoto = b64;
          return b64;
        }
      }
    } catch {}
    return null;
  }

  public setFounderPhoto(photoBase64: string): void {
    this.data.founderPhoto = photoBase64;
    this.save();
  }

  private save() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

      const content = JSON.stringify(this.data, null, 2);

      // Primary disk save
      fs.writeFileSync(DB_FILE_PATH, content, 'utf-8');

      // Redundant backup saves to protect against any single-path reset
      try { fs.writeFileSync(BACKUP_FILE_PATH_1, content, 'utf-8'); } catch {}
      try { fs.writeFileSync(BACKUP_FILE_PATH_2, content, 'utf-8'); } catch {}
    } catch (e) {
      console.error('[Database Save Error]:', e);
    }
  }

  public verifyReferralCode(rawCode: string): { 
    valid: boolean; 
    sponsorName?: string; 
    sponsorPackage?: string; 
    isMaster?: boolean; 
    message?: string 
  } {
    if (!rawCode || typeof rawCode !== 'string') {
      return { valid: false, message: 'Referral code is required.' };
    }

    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { valid: false, message: 'Referral code cannot be empty.' };
    }

    // 1. Check Master / Official Founder Referral Codes
    if (MASTER_REFERRAL_CODES.includes(code)) {
      return {
        valid: true,
        sponsorName: 'Gaurav Gangwar (Founder & CEO, FutureSet)',
        sponsorPackage: 'Official Founder Sponsor',
        isMaster: true
      };
    }

    // 2. Check all existing users in the database
    const matchedUser = this.data.users.find(
      u => u.referralCode && u.referralCode.trim().toUpperCase() === code
    );

    if (matchedUser) {
      return {
        valid: true,
        sponsorName: matchedUser.name,
        sponsorPackage: `${matchedUser.packageName} Package`,
        isMaster: false
      };
    }

    return {
      valid: false,
      message: 'Invalid Referral Code. No active sponsor found with this code.'
    };
  }

  public mergeData(incoming: {
    users?: User[];
    withdrawals?: WithdrawalRequest[];
    transactions?: EarningTransaction[];
    upgrades?: UpgradeRequest[];
  }): DatabaseSchema {
    let modified = false;

    if (Array.isArray(incoming.users)) {
      for (const incomingUser of incoming.users) {
        if (!incomingUser || !incomingUser.email) continue;
        const cleanEmail = incomingUser.email.trim().toLowerCase();
        const existingIndex = this.data.users.findIndex(
          u => (u.id && u.id === incomingUser.id) || (u.email && u.email.trim().toLowerCase() === cleanEmail)
        );

        if (existingIndex === -1) {
          // Add new user without modifying others
          this.data.users.push({
            ...incomingUser,
            email: cleanEmail,
            referralCode: incomingUser.referralCode || `FS${(incomingUser.name || 'USR').substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`
          });
          modified = true;
        } else {
          // Merge safely without deleting existing fields
          const existing = this.data.users[existingIndex];
          const isActive = existing.status === 'active' || incomingUser.status === 'active';
          
          this.data.users[existingIndex] = {
            ...existing,
            ...incomingUser,
            id: existing.id || incomingUser.id,
            email: cleanEmail,
            name: existing.name || incomingUser.name,
            whatsapp: existing.whatsapp || incomingUser.whatsapp,
            password: existing.password || incomingUser.password,
            packageId: incomingUser.packageId || existing.packageId,
            packageName: incomingUser.packageName || existing.packageName,
            packagePrice: incomingUser.packagePrice || existing.packagePrice,
            referralCode: existing.referralCode || incomingUser.referralCode,
            referredByCode: existing.referredByCode || incomingUser.referredByCode,
            avatarUrl: incomingUser.avatarUrl || existing.avatarUrl,
            status: isActive ? 'active' : (existing.status || incomingUser.status || 'pending'),
            createdAt: existing.createdAt || incomingUser.createdAt,
            kyc: existing.kyc?.isCompleted ? existing.kyc : (incomingUser.kyc?.isCompleted ? incomingUser.kyc : (existing.kyc || incomingUser.kyc)),
            earnings: {
              today: Math.max(existing.earnings?.today || 0, incomingUser.earnings?.today || 0),
              last7Days: Math.max(existing.earnings?.last7Days || 0, incomingUser.earnings?.last7Days || 0),
              last30Days: Math.max(existing.earnings?.last30Days || 0, incomingUser.earnings?.last30Days || 0),
              allTime: Math.max(existing.earnings?.allTime || 0, incomingUser.earnings?.allTime || 0),
              passiveIncome: Math.max(existing.earnings?.passiveIncome || 0, incomingUser.earnings?.passiveIncome || 0),
            },
            paymentScreenshot: existing.paymentScreenshot || incomingUser.paymentScreenshot,
            paymentUpiTxId: existing.paymentUpiTxId || incomingUser.paymentUpiTxId
          };
          modified = true;
        }
      }
    }

    if (Array.isArray(incoming.withdrawals)) {
      for (const w of incoming.withdrawals) {
        if (!w || !w.id) continue;
        if (!this.data.withdrawals.some(existing => existing.id === w.id)) {
          this.data.withdrawals.push(w);
          modified = true;
        }
      }
    }

    if (Array.isArray(incoming.transactions)) {
      for (const t of incoming.transactions) {
        if (!t || !t.id) continue;
        if (!this.data.transactions.some(existing => existing.id === t.id)) {
          this.data.transactions.push(t);
          modified = true;
        }
      }
    }

    if (Array.isArray(incoming.upgrades)) {
      for (const upg of incoming.upgrades) {
        if (!upg || !upg.id) continue;
        const existingIdx = this.data.upgrades.findIndex(existing => existing.id === upg.id);
        if (existingIdx === -1) {
          this.data.upgrades.push(upg);
          modified = true;
        } else {
          this.data.upgrades[existingIdx] = { ...this.data.upgrades[existingIdx], ...upg };
        }
      }
    }

    if (modified) {
      this.save();
    }

    return this.getAllData();
  }

  public authenticateUser(email: string, password?: string): {
    success: boolean;
    user?: User;
    message?: string;
    isPending?: boolean;
  } {
    if (!email) {
      return { success: false, message: 'Gmail address is required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = this.data.users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No account found with this Gmail address. Please check your Gmail or enroll in a package.' };
    }

    const cleanPassword = (password || '').trim();
    const storedPassword = (user.password || '').trim();

    if (storedPassword && storedPassword !== cleanPassword) {
      return { success: false, message: 'Invalid password. Please check your password and try again.' };
    }

    if (user.status === 'pending') {
      return {
        success: false,
        message: 'Your account is pending activation by administrator. Please wait for ID activation. 🙏',
        isPending: true
      };
    }

    return {
      success: true,
      user,
      message: 'Login successful!'
    };
  }

  public getAllData(): DatabaseSchema {
    return {
      users: [...this.data.users],
      withdrawals: [...this.data.withdrawals],
      transactions: [...this.data.transactions],
      upgrades: [...this.data.upgrades]
    };
  }

  public getUserByEmail(email: string): User | undefined {
    const cleanEmail = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase().trim() === cleanEmail);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public registerUser(userData: {
    name: string;
    email: string;
    whatsapp: string;
    password?: string;
    packageId: string;
    packageName: string;
    packagePrice: number;
    referredByCode?: string;
    paymentScreenshot?: string;
    paymentUpiTxId?: string;
  }): { success: boolean; user?: User; message?: string } {
    const cleanEmail = userData.email.toLowerCase().trim();
    const existing = this.getUserByEmail(cleanEmail);

    if (existing) {
      return {
        success: false,
        message: 'An account with this Gmail address already exists. Please log in directly.'
      };
    }

    // Mandatory Referral Code Enforcement
    const cleanReferredByCode = userData.referredByCode ? userData.referredByCode.trim().toUpperCase() : '';
    if (!cleanReferredByCode) {
      return {
        success: false,
        message: '❌ Referral Code is strictly mandatory! You cannot create an ID without a valid Sponsor / Referral Code.'
      };
    }

    // Validate the sponsor code
    const verification = this.verifyReferralCode(cleanReferredByCode);
    if (!verification.valid) {
      return {
        success: false,
        message: '❌ Invalid Referral Code! Please enter an active and valid Sponsor / Referral Code to register.'
      };
    }

    const newId = `user_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const referralCode = `FS${userData.name.substring(0, 3).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

    const newUser: User = {
      id: newId,
      name: userData.name.trim(),
      email: cleanEmail,
      whatsapp: userData.whatsapp.trim(),
      password: userData.password?.trim(),
      packageId: userData.packageId,
      packageName: userData.packageName,
      packagePrice: userData.packagePrice,
      referralCode,
      referredByCode: cleanReferredByCode,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name.trim())}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentScreenshot: userData.paymentScreenshot,
      paymentUpiTxId: userData.paymentUpiTxId?.trim(),
      kyc: {
        name: userData.name.trim(),
        bankName: '',
        ifscCode: '',
        upiId: '',
        isCompleted: false
      },
      earnings: {
        today: 0,
        last7Days: 0,
        last30Days: 0,
        allTime: 0,
        passiveIncome: 0
      }
    };

    this.data.users.unshift(newUser);
    this.save();

    console.log(`[DB] Real User Registered: ${newUser.name} (${newUser.email}) - Package: ${newUser.packageName}`);
    return { success: true, user: newUser };
  }

  public activateUser(userId: string): { success: boolean; user?: User; message?: string } {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: 'User not found in database.' };
    }

    const targetUser = this.data.users[userIndex];
    targetUser.status = 'active';

    // Handle Referral Commissions
    if (targetUser.referredByCode) {
      const referrer = this.data.users.find(
        r => r.referralCode.toUpperCase() === targetUser.referredByCode?.toUpperCase()
      );

      if (referrer) {
        const commissionCalc = calculateAffiliateCommission(
          targetUser.packageId,
          referrer.packageId,
          targetUser.packagePrice
        );

        // 1. Direct commission to Direct Sponsor
        const alreadyAddedDirect = this.data.transactions.some(
          t => t.fromUserId === targetUser.id && t.userId === referrer.id && t.type !== 'passive'
        );

        if (!alreadyAddedDirect) {
          const directTx: EarningTransaction = {
            id: `tx_dir_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
            userId: referrer.id,
            type: 'direct',
            amount: commissionCalc.commission,
            packageId: targetUser.packageId,
            packageName: targetUser.packageName,
            packagePrice: targetUser.packagePrice,
            fromUserId: targetUser.id,
            fromUserName: targetUser.name,
            fromUserEmail: targetUser.email,
            timestamp: new Date().toISOString(),
            note: commissionCalc.capped
              ? `Direct affiliate commission for ${targetUser.packageName} Package (₹${targetUser.packagePrice}) - Capped at your registered ${referrer.packageName} tier rate (₹${commissionCalc.commission})`
              : `Direct affiliate commission for ${targetUser.packageName} Package (₹${targetUser.packagePrice})`
          };
          this.data.transactions.unshift(directTx);
        }

        // 2. 1-Level Passive Income to Referrer's Referrer
        if (referrer.referredByCode) {
          const grandReferrer = this.data.users.find(
            r => r.referralCode.toUpperCase() === referrer.referredByCode?.toUpperCase()
          );

          if (grandReferrer) {
            const alreadyAddedPassive = this.data.transactions.some(
              t => t.fromUserId === targetUser.id && t.userId === grandReferrer.id && t.type === 'passive'
            );

            if (!alreadyAddedPassive) {
              const passiveAmount = calculatePassiveIncome(commissionCalc.commission);
              const passiveTx: EarningTransaction = {
                id: `tx_pass_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
                userId: grandReferrer.id,
                type: 'passive',
                amount: passiveAmount,
                packageId: targetUser.packageId,
                packageName: targetUser.packageName,
                packagePrice: targetUser.packagePrice,
                fromUserId: targetUser.id,
                fromUserName: targetUser.name,
                fromUserEmail: targetUser.email,
                directReferrerName: referrer.name,
                timestamp: new Date().toISOString(),
                note: `Passive Income (₹${passiveAmount}) earned from ${referrer.name}'s direct referral (${targetUser.name} enrolled with ${targetUser.packageName})`
              };
              this.data.transactions.unshift(passiveTx);
            }
          }
        }
      }
    }

    this.save();
    console.log(`[DB] Real User Activated: ${targetUser.name} (${targetUser.email})`);
    return { success: true, user: targetUser };
  }

  public deleteUser(userId: string): boolean {
    // User IDs must never be removed once created
    const target = this.data.users.find(u => u.id === userId);
    if (!target || target.id === 'user_1787080505451' || target.email?.toLowerCase().includes('gamingtool999')) {
      return false;
    }
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.withdrawals = this.data.withdrawals.filter(w => w.userId !== userId);
    this.data.transactions = this.data.transactions.filter(t => t.userId !== userId && t.fromUserId !== userId);
    this.save();
    return this.data.users.length < initialLen;
  }

  public updateKYC(userId: string, kycData: {
    name: string;
    bankName: string;
    accountNumber?: string;
    ifscCode: string;
    upiId: string;
  }): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    user.kyc = {
      name: kycData.name.trim(),
      bankName: kycData.bankName.trim(),
      accountNumber: kycData.accountNumber?.trim(),
      ifscCode: kycData.ifscCode.trim().toUpperCase(),
      upiId: kycData.upiId.trim(),
      isCompleted: true,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return true;
  }

  public updateProfile(userId: string, profileData: { name?: string; avatarUrl?: string }): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    if (profileData.name) user.name = profileData.name.trim();
    if (profileData.avatarUrl) user.avatarUrl = profileData.avatarUrl.trim();
    this.save();
    return true;
  }

  public resetPassword(email: string, newPass: string): boolean {
    const user = this.getUserByEmail(email);
    if (!user) return false;

    user.password = newPass.trim();
    this.save();
    return true;
  }

  public createWithdrawal(reqData: {
    userId: string;
    userName: string;
    userEmail: string;
    userWhatsapp?: string;
    amount: number;
    upiId: string;
    bankName: string;
    accountNumber?: string;
    ifscCode?: string;
  }): WithdrawalRequest {
    const newWdr: WithdrawalRequest = {
      id: `wdr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: reqData.userId,
      userName: reqData.userName,
      userEmail: reqData.userEmail,
      userWhatsapp: reqData.userWhatsapp,
      amount: reqData.amount,
      upiId: reqData.upiId,
      bankName: reqData.bankName,
      accountNumber: reqData.accountNumber,
      ifscCode: reqData.ifscCode,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    this.data.withdrawals.unshift(newWdr);
    this.save();
    return newWdr;
  }

  public approveWithdrawal(withdrawalId: string): boolean {
    const wdr = this.data.withdrawals.find(w => w.id === withdrawalId);
    if (!wdr) return false;

    wdr.status = 'approved';
    wdr.approvedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public submitUpgrade(upgradeData: {
    userId: string;
    userName: string;
    userEmail: string;
    userWhatsapp?: string;
    currentPackageId: string;
    currentPackageName: string;
    currentPackagePrice: number;
    targetPackageId: string;
    targetPackageName: string;
    targetPackagePrice: number;
    amount: number;
    paymentScreenshot: string;
    paymentUpiTxId?: string;
  }): UpgradeRequest {
    const newUpgrade: UpgradeRequest = {
      id: `upg_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: upgradeData.userId,
      userName: upgradeData.userName,
      userEmail: upgradeData.userEmail.toLowerCase().trim(),
      userWhatsapp: upgradeData.userWhatsapp?.trim(),
      currentPackageId: upgradeData.currentPackageId,
      currentPackageName: upgradeData.currentPackageName,
      currentPackagePrice: Number(upgradeData.currentPackagePrice),
      targetPackageId: upgradeData.targetPackageId,
      targetPackageName: upgradeData.targetPackageName,
      targetPackagePrice: Number(upgradeData.targetPackagePrice),
      amount: Number(upgradeData.amount),
      paymentScreenshot: upgradeData.paymentScreenshot,
      paymentUpiTxId: upgradeData.paymentUpiTxId?.trim(),
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    this.data.upgrades.unshift(newUpgrade);
    this.save();
    console.log(`[DB] Real Upgrade Request Submitted: ${newUpgrade.userName} (${newUpgrade.currentPackageName} -> ${newUpgrade.targetPackageName})`);
    return newUpgrade;
  }

  public approveUpgrade(upgradeId: string): { success: boolean; user?: User; message?: string } {
    const upgIndex = this.data.upgrades.findIndex(u => u.id === upgradeId);
    if (upgIndex === -1) {
      return { success: false, message: 'Upgrade request record not found.' };
    }

    const upgrade = this.data.upgrades[upgIndex];
    upgrade.status = 'approved';
    upgrade.approvedAt = new Date().toISOString();

    // Find the user to update their package
    const user = this.data.users.find(
      u => (u.id && u.id === upgrade.userId) || (u.email && u.email.toLowerCase().trim() === upgrade.userEmail.toLowerCase().trim())
    );

    if (user) {
      // Permanently update user package to the target higher package
      user.packageId = upgrade.targetPackageId;
      user.packageName = upgrade.targetPackageName;
      user.packagePrice = upgrade.targetPackagePrice;

      // Handle referral commission for upgrade if sponsor exists
      if (user.referredByCode) {
        const referrer = this.data.users.find(
          r => r.referralCode.toUpperCase() === user.referredByCode?.toUpperCase()
        );

        if (referrer) {
          const commissionCalc = calculateAffiliateCommission(
            upgrade.targetPackageId,
            referrer.packageId,
            upgrade.targetPackagePrice
          );

          // Record upgraded direct commission note
          const directTx: EarningTransaction = {
            id: `tx_dir_upg_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
            userId: referrer.id,
            type: 'direct',
            amount: commissionCalc.commission,
            packageId: upgrade.targetPackageId,
            packageName: upgrade.targetPackageName,
            packagePrice: upgrade.targetPackagePrice,
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserEmail: user.email,
            timestamp: new Date().toISOString(),
            note: `Direct affiliate commission for Package Upgrade to ${upgrade.targetPackageName} (₹${upgrade.targetPackagePrice})`
          };
          this.data.transactions.unshift(directTx);
        }
      }

      console.log(`[DB] Package Upgrade Approved & Activated: ${user.name} is now on ${user.packageName} Package!`);
    }

    this.save();
    return { success: true, user, message: `Package upgraded to ${upgrade.targetPackageName} successfully!` };
  }

  public deleteUpgrade(upgradeId: string): boolean {
    const initialLen = this.data.upgrades.length;
    this.data.upgrades = this.data.upgrades.filter(u => u.id !== upgradeId);
    this.save();
    return this.data.upgrades.length < initialLen;
  }
}

export const db = new Database();
