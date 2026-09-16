import { EarningTransaction, UserEarnings } from '../types';

export const COMMISSION_RATES: Record<string, number> = {
  starter: 180,  // ₹249 package → ₹180 direct commission
  basic: 420,    // ₹599 package → ₹420 direct commission
  gold: 710,     // ₹1012 package → ₹710 direct commission
  diamond: 1610, // ₹2299 package → ₹1610 direct commission
  elite: 3150,   // ₹4299 package → ₹3150 direct commission
  pro: 5200      // ₹7299 package → ₹5200 direct commission
};

export const PASSIVE_INCOME_RATES: Record<string, number> = {
  starter: 18,   // ₹180 direct commission → ₹18 passive income
  basic: 42,     // ₹420 direct commission → ₹42 passive income
  gold: 71,      // ₹710 direct commission → ₹71 passive income
  diamond: 161,  // ₹1610 direct commission → ₹161 passive income
  elite: 315,    // ₹3150 direct commission → ₹315 passive income
  pro: 520       // ₹5200 direct commission → ₹520 passive income
};

export const PACKAGE_TIER_ORDER = ['starter', 'basic', 'gold', 'diamond', 'elite', 'pro'];

export const getCommissionForPackage = (packageId?: string, price?: number): number => {
  if (packageId) {
    const key = packageId.toLowerCase().trim();
    if (COMMISSION_RATES[key] !== undefined) {
      return COMMISSION_RATES[key];
    }
  }
  if (price === 249) return 180;
  if (price === 599) return 420;
  if (price === 1012) return 710;
  if (price === 2299) return 1610;
  if (price === 4299 || price === 4499) return 3150;
  if (price === 7299) return 5200;
  return Math.round((price || 0) * 0.7);
};

/**
 * Calculates exact 1-Level Passive Income earned by User A when their direct referral (User B) makes a referral sale.
 * Direct Commission ₹180 → Passive Income ₹18
 * Direct Commission ₹420 → Passive Income ₹42
 * Direct Commission ₹710 → Passive Income ₹71
 * Direct Commission ₹1610 → Passive Income ₹161
 * Direct Commission ₹3150 → Passive Income ₹315
 * Direct Commission ₹5200 → Passive Income ₹520
 */
export const calculatePassiveIncome = (directCommission: number): number => {
  if (directCommission === 180) return 18;
  if (directCommission === 420) return 42;
  if (directCommission === 710) return 71;
  if (directCommission === 1610) return 161;
  if (directCommission === 3150) return 315;
  if (directCommission === 5200) return 520;
  return Math.round(directCommission * 0.10);
};

/**
 * FutureSet Exact Affiliate Commission Rules:
 * Rule: 
 * - Agar referred user ka purchased package affiliate ke registered package se chhota hai, to purchased package ki fixed commission milegi.
 * - Agar purchased package affiliate ke registered package ke same ya bada hai, to affiliate ke registered package ki commission milegi.
 *
 * Rates:
 * - Starter → ₹180
 * - Basic → ₹420
 * - Gold → ₹710
 * - Diamond → ₹1610
 * - Elite → ₹3150
 * - Pro → ₹5200
 */
export const calculateAffiliateCommission = (
  purchasedPackageId: string,
  referrerPackageId: string,
  purchasedPrice?: number
): {
  commission: number;
  capped: boolean;
  referrerPackageCommission: number;
  purchasedPackageCommission: number;
  note: string;
} => {
  const purchasedKey = (purchasedPackageId || 'starter').toLowerCase().trim();
  const referrerKey = (referrerPackageId || 'starter').toLowerCase().trim();

  const purchasedComm = getCommissionForPackage(purchasedKey, purchasedPrice);
  const referrerComm = getCommissionForPackage(referrerKey);

  const purchasedTierIndex = PACKAGE_TIER_ORDER.indexOf(purchasedKey);
  const referrerTierIndex = PACKAGE_TIER_ORDER.indexOf(referrerKey);

  // If both tier indices are known:
  if (referrerTierIndex !== -1 && purchasedTierIndex !== -1) {
    if (purchasedTierIndex >= referrerTierIndex) {
      // Purchased is same or larger -> affiliate gets their registered package commission
      const isBigger = purchasedTierIndex > referrerTierIndex;
      return {
        commission: referrerComm,
        capped: isBigger,
        referrerPackageCommission: referrerComm,
        purchasedPackageCommission: purchasedComm,
        note: isBigger
          ? `Affiliate commission for ${purchasedKey.toUpperCase()} Package (₹${purchasedPrice || ''}) - Capped at your registered ${referrerKey.toUpperCase()} tier rate (₹${referrerComm})`
          : `Affiliate commission for ${purchasedKey.toUpperCase()} Package (₹${referrerComm})`
      };
    } else {
      // Purchased is smaller -> affiliate gets purchased package commission
      return {
        commission: purchasedComm,
        capped: false,
        referrerPackageCommission: referrerComm,
        purchasedPackageCommission: purchasedComm,
        note: `Affiliate commission for ${purchasedKey.toUpperCase()} Package (₹${purchasedComm})`
      };
    }
  }

  // Fallback formula: min(purchasedComm, referrerComm)
  const finalComm = Math.min(purchasedComm, referrerComm || purchasedComm);
  return {
    commission: finalComm,
    capped: purchasedComm > finalComm,
    referrerPackageCommission: referrerComm,
    purchasedPackageCommission: purchasedComm,
    note: `Affiliate commission for ${purchasedKey.toUpperCase()} Package (₹${finalComm})`
  };
};

/**
 * Calculates current real-time earnings for a user given their transaction history.
 * 
 * STRICT ISOLATION RULES:
 * 1. Direct Commissions (type !== 'passive'):
 *    - Today Earning: Direct commissions timestamped today (after 00:00:00).
 *    - 7 Days Earning: Direct commissions in the last 7 rolling days.
 *    - 30 Days Earning: Direct commissions in the last 30 rolling days.
 *    - All Time Earning: All historical direct commissions.
 * 2. Passive Income (type === 'passive'):
 *    - Passive Income Total: Strictly the sum of all 1-Level passive income transactions.
 *    - Direct and Passive are NEVER combined in cards or calculations.
 */
export const calculateUserEarnings = (
  userId: string,
  transactions: EarningTransaction[],
  legacyEarnings?: UserEarnings
): UserEarnings => {
  const userTransactions = transactions.filter(t => t.userId === userId);
  
  // If there are no individual transactions recorded but legacy baseline earnings exist, return legacy as fallback
  if (userTransactions.length === 0 && legacyEarnings) {
    return {
      today: legacyEarnings.today || 0,
      last7Days: legacyEarnings.last7Days || 0,
      last30Days: legacyEarnings.last30Days || 0,
      allTime: legacyEarnings.allTime || 0,
      passiveIncome: legacyEarnings.passiveIncome || 0
    };
  }

  const now = new Date();
  
  // Start of today (00:00:00.000 local time)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  
  // Start of 7 rolling days (7 days including today: today - 6 days at 00:00:00)
  const startOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0).getTime();
  
  // Start of 30 rolling days (30 days including today: today - 29 days at 00:00:00)
  const startOf30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0).getTime();

  let today = 0;
  let last7Days = 0;
  let last30Days = 0;
  let allTime = 0;
  let passiveIncome = 0;

  for (const tx of userTransactions) {
    const txTime = new Date(tx.timestamp).getTime();
    const amount = Number(tx.amount) || 0;

    if (tx.type === 'passive') {
      // STRICTLY ACCUMULATE IN PASSIVE INCOME ONLY
      passiveIncome += amount;
    } else {
      // STRICTLY ACCUMULATE IN DIRECT COMMISSIONS ONLY
      allTime += amount;

      if (txTime >= startOf30Days) {
        last30Days += amount;
      }
      if (txTime >= startOf7Days) {
        last7Days += amount;
      }
      if (txTime >= startOfToday) {
        today += amount;
      }
    }
  }

  return {
    today,
    last7Days,
    last30Days,
    allTime,
    passiveIncome
  };
};

/**
 * Generate initial seeded historical transactions for demo users (Aarav and Priya)
 * so that their today, 7 days, 30 days, all time direct earning boxes and passive income box
 * are populated with real transactions.
 */
export const getInitialHistoricalTransactions = (): EarningTransaction[] => {
  const now = new Date();
  const todayIso = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30, 0).toISOString();
  const twoDaysAgoIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 15, 0).toISOString();
  const fiveDaysAgoIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 11, 45, 0).toISOString();
  const twelveDaysAgoIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12, 16, 20, 0).toISOString();
  const twentyDaysAgoIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20, 9, 10, 0).toISOString();
  const fortyDaysAgoIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 40, 18, 0, 0).toISOString();

  return [
    // Aarav's DIRECT earnings:
    // Today: ₹5200 (Pro)
    {
      id: 'tx_aarav_1',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 5200,
      packageId: 'pro',
      packageName: 'Pro',
      packagePrice: 7299,
      fromUserName: 'Rohan Mehra',
      fromUserEmail: 'rohan.m@gmail.com',
      timestamp: todayIso,
      note: 'Direct affiliate commission for Pro Package'
    },
    // 2 days ago: ₹3150 (Elite)
    {
      id: 'tx_aarav_2',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 3150,
      packageId: 'elite',
      packageName: 'Elite',
      packagePrice: 4299,
      fromUserName: 'Sneha Kapoor',
      fromUserEmail: 'sneha.k@gmail.com',
      timestamp: twoDaysAgoIso,
      note: 'Direct affiliate commission for Elite Package'
    },
    // 5 days ago: ₹1610 (Diamond)
    {
      id: 'tx_aarav_3',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 1610,
      packageId: 'diamond',
      packageName: 'Diamond',
      packagePrice: 2299,
      fromUserName: 'Manish Verma',
      fromUserEmail: 'manish.v@gmail.com',
      timestamp: fiveDaysAgoIso,
      note: 'Direct affiliate commission for Diamond Package'
    },
    // 12 days ago: ₹5200 (Pro)
    {
      id: 'tx_aarav_4',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 5200,
      packageId: 'pro',
      packageName: 'Pro',
      packagePrice: 7299,
      fromUserName: 'Karan Malhotra',
      fromUserEmail: 'karan.m@gmail.com',
      timestamp: twelveDaysAgoIso,
      note: 'Direct affiliate commission for Pro Package'
    },
    // 20 days ago: ₹3150 (Elite)
    {
      id: 'tx_aarav_5',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 3150,
      packageId: 'elite',
      packageName: 'Elite',
      packagePrice: 4299,
      fromUserName: 'Divya Sharma',
      fromUserEmail: 'divya.s@gmail.com',
      timestamp: twentyDaysAgoIso,
      note: 'Direct affiliate commission for Elite Package'
    },
    // 40 days ago: ₹5200 (Pro)
    {
      id: 'tx_aarav_6',
      userId: 'user_demo_1',
      type: 'direct',
      amount: 5200,
      packageId: 'pro',
      packageName: 'Pro',
      packagePrice: 7299,
      fromUserName: 'Aditya Gupta',
      fromUserEmail: 'aditya.g@gmail.com',
      timestamp: fortyDaysAgoIso,
      note: 'Direct affiliate commission for Pro Package'
    },

    // Aarav's PASSIVE INCOME earnings (Priya Patel is Aarav's direct referral, so when Priya refers, Aarav gets 1-Level Passive Income):
    {
      id: 'tx_aarav_pass_1',
      userId: 'user_demo_1',
      type: 'passive',
      amount: 71,
      packageId: 'gold',
      packageName: 'Gold',
      packagePrice: 1012,
      fromUserName: 'Deepak Joshi',
      fromUserEmail: 'deepak.j@gmail.com',
      directReferrerName: 'Priya Patel',
      timestamp: todayIso,
      note: 'Passive Income (₹71) earned from Priya Patel\'s direct referral (Deepak Joshi bought Gold)'
    },
    {
      id: 'tx_aarav_pass_2',
      userId: 'user_demo_1',
      type: 'passive',
      amount: 42,
      packageId: 'basic',
      packageName: 'Basic',
      packagePrice: 599,
      fromUserName: 'Simran Kaur',
      fromUserEmail: 'simran.k@gmail.com',
      directReferrerName: 'Priya Patel',
      timestamp: twoDaysAgoIso,
      note: 'Passive Income (₹42) earned from Priya Patel\'s direct referral (Simran Kaur bought Basic)'
    },
    {
      id: 'tx_aarav_pass_3',
      userId: 'user_demo_1',
      type: 'passive',
      amount: 71,
      packageId: 'diamond',
      packageName: 'Diamond',
      packagePrice: 2299,
      fromUserName: 'Rahul Sen',
      fromUserEmail: 'rahul.s@gmail.com',
      directReferrerName: 'Priya Patel',
      timestamp: twelveDaysAgoIso,
      note: 'Passive Income (₹71) earned from Priya Patel\'s direct referral (Rahul Sen bought Diamond)'
    },

    // Priya's DIRECT earnings:
    // Today: ₹710 (Gold)
    {
      id: 'tx_priya_1',
      userId: 'user_demo_2',
      type: 'direct',
      amount: 710,
      packageId: 'gold',
      packageName: 'Gold',
      packagePrice: 1012,
      fromUserName: 'Deepak Joshi',
      fromUserEmail: 'deepak.j@gmail.com',
      timestamp: todayIso,
      note: 'Direct affiliate commission for Gold Package'
    },
    // 2 days ago: ₹420 (Basic)
    {
      id: 'tx_priya_2',
      userId: 'user_demo_2',
      type: 'direct',
      amount: 420,
      packageId: 'basic',
      packageName: 'Basic',
      packagePrice: 599,
      fromUserName: 'Simran Kaur',
      fromUserEmail: 'simran.k@gmail.com',
      timestamp: twoDaysAgoIso,
      note: 'Direct affiliate commission for Basic Package'
    },
    // 12 days ago: ₹710 (Diamond package bought by referral, capped at Priya's Gold limit ₹710)
    {
      id: 'tx_priya_3',
      userId: 'user_demo_2',
      type: 'direct',
      amount: 710,
      packageId: 'diamond',
      packageName: 'Diamond',
      packagePrice: 2299,
      fromUserName: 'Rahul Sen',
      fromUserEmail: 'rahul.s@gmail.com',
      timestamp: twelveDaysAgoIso,
      note: 'Direct affiliate commission for Diamond Package (₹2299) - Capped at Gold tier limit (₹710)'
    }
  ];
};
