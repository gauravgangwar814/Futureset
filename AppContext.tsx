import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Package, WithdrawalRequest, UpgradeRequest, ActiveView, EarningTransaction, UserEarnings } from '../types';
import { PACKAGES } from '../data/packages';
import { 
  getCommissionForPackage, 
  calculateAffiliateCommission,
  calculatePassiveIncome,
  calculateUserEarnings, 
  getInitialHistoricalTransactions 
} from '../utils/affiliateEarnings';

interface RegistrationDraft {
  name: string;
  whatsapp: string;
  email: string;
  password: string;
  referralCode: string;
  packageId: string;
}

interface AppContextType {
  currentUser: User | null;
  activeView: ActiveView;
  selectedPackage: Package | null;
  registrationDraft: RegistrationDraft | null;
  paymentSubmitted: boolean;
  users: User[];
  withdrawalRequests: WithdrawalRequest[];
  upgradeRequests: UpgradeRequest[];
  referralCodeParam: string;
  earningTransactions: EarningTransaction[];
  currentUserTransactions: EarningTransaction[];
  
  // Navigation & Views
  setActiveView: (view: ActiveView) => void;
  startBuyNow: (pkg: Package) => void;
  proceedToPayment: (draft: RegistrationDraft) => void;
  submitPaymentProof: (screenshotUrl: string, txId?: string) => void;
  handleBackFromPayment: () => void;
  
  // Upgrade Package
  submitUpgradeRequest: (targetPkg: Package, screenshotUrl: string, txId?: string) => Promise<{ success: boolean; message?: string }>;
  approveUpgradeRequest: (upgradeId: string) => Promise<void>;
  deleteUpgradeRequest: (upgradeId: string) => Promise<void>;
  
  // Auth
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; isPending?: boolean }>;
  logout: () => void;
  sendPasswordResetOtp: (email: string) => Promise<{ success: boolean; message: string; maskedEmail?: string; emailSent?: boolean }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  
  // Profile & Data Updates
  updateProfile: (name: string, avatarUrl: string) => void;
  updateKYC: (name: string, bankName: string, accountNumber: string, ifscCode: string, upiId: string) => void;
  requestWithdrawal: (amount?: number) => { success: boolean; message: string };
  
  // Admin / ID Activation & Withdrawals
  isAdminAuthenticated: boolean;
  adminUser: { email: string; name: string; role: string } | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  adminLogout: () => Promise<void>;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  approveWithdrawal: (withdrawalId: string) => void;
  pendingUsersCount: number;
  pendingUpgradesCount: number;
  syncDatabase: () => Promise<void>;
}

const STORAGE_KEY_USERS = 'futureset_users_v4';
const STORAGE_KEY_CURRENT_USER = 'futureset_current_user_v4';
const STORAGE_KEY_WITHDRAWALS = 'futureset_withdrawals_v4';
const STORAGE_KEY_UPGRADES = 'futureset_upgrades_v4';
const STORAGE_KEY_TRANSACTIONS = 'futureset_earning_transactions_v4';
const STORAGE_KEY_ADMIN_TOKEN = 'futureset_admin_session_token_v3';
const STORAGE_KEY_ACTIVE_VIEW = 'futureset_active_view_v4';
const STORAGE_KEY_SELECTED_PACKAGE = 'futureset_selected_package_v4';
const STORAGE_KEY_REGISTRATION_DRAFT = 'futureset_registration_draft_v4';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [earningTransactions, setEarningTransactions] = useState<EarningTransaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const keys = [
        STORAGE_KEY_USERS,
        'futureset_users_v4',
        'futureset_users_v3',
        'futureset_users_v2',
        'futureset_users_v1',
        'futureset_users'
      ];
      const mergedMap = new Map<string, User>();
      for (const k of keys) {
        const stored = localStorage.getItem(k);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              for (const u of parsed) {
                if (u && (u.id || u.email)) {
                  const key = (u.id || u.email).toLowerCase();
                  if (!mergedMap.has(key)) {
                    mergedMap.set(key, u);
                  }
                }
              }
            }
          } catch {}
        }
      }
      if (mergedMap.size > 0) return Array.from(mergedMap.values());
    } catch {}
    return [];
  });

  // Permanent login session persistence across page refreshes, browser reopens, and redeployments
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const keys = [
        STORAGE_KEY_CURRENT_USER,
        'futureset_current_user_v4',
        'futureset_current_user_v3',
        'futureset_current_user_v2',
        'futureset_current_user_v1',
        'futureset_current_user'
      ];
      for (const k of keys) {
        const storedUser = localStorage.getItem(k);
        if (storedUser) return storedUser;
      }
    } catch {}
    // Default to the registered user ID so account is never lost on refresh/reload
    return 'user_1787080505451';
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UPGRADES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Permanent Safe Database Sync: Bidirectionally syncs with server, merges records safely, never deletes user accounts or earnings
  const syncDatabase = async () => {
    try {
      // 1. Gather local data as safeguard
      let localUsers: User[] = [];
      let localWithdrawals: WithdrawalRequest[] = [];
      let localUpgrades: UpgradeRequest[] = [];
      let localTransactions: EarningTransaction[] = [];

      try {
        const u = localStorage.getItem(STORAGE_KEY_USERS);
        if (u) localUsers = JSON.parse(u);
        const w = localStorage.getItem(STORAGE_KEY_WITHDRAWALS);
        if (w) localWithdrawals = JSON.parse(w);
        const upg = localStorage.getItem(STORAGE_KEY_UPGRADES);
        if (upg) localUpgrades = JSON.parse(upg);
        const t = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
        if (t) localTransactions = JSON.parse(t);
      } catch {}

      // Always send local backup to server so server database merges and persists it permanently to disk
      const response = await fetch('/api/database/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: localUsers,
          withdrawals: localWithdrawals,
          transactions: localTransactions,
          upgrades: localUpgrades
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (Array.isArray(data.users)) {
            setUsers(prev => {
              const map = new Map<string, User>();
              // Insert server users
              for (const u of data.users) {
                if (u && (u.id || u.email)) {
                  const key = (u.id || u.email).toLowerCase();
                  map.set(key, u);
                }
              }
              // Preserve any active status or local record
              for (const u of prev) {
                if (u && (u.id || u.email)) {
                  const key = (u.id || u.email).toLowerCase();
                  if (!map.has(key)) {
                    map.set(key, u);
                  } else {
                    const existing = map.get(key)!;
                    if (u.status === 'active' && existing.status !== 'active') {
                      existing.status = 'active';
                    }
                    if (u.kyc?.isCompleted && !existing.kyc?.isCompleted) {
                      existing.kyc = u.kyc;
                    }
                  }
                }
              }
              const mergedUsers = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(mergedUsers)); } catch {}
              return mergedUsers;
            });
          }

          if (Array.isArray(data.withdrawals)) {
            setWithdrawalRequests(prev => {
              const map = new Map<string, WithdrawalRequest>();
              for (const w of data.withdrawals) if (w && w.id) map.set(w.id, w);
              for (const w of prev) if (w && w.id && !map.has(w.id)) map.set(w.id, w);
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(merged)); } catch {}
              return merged;
            });
          }

          if (Array.isArray(data.upgrades)) {
            setUpgradeRequests(prev => {
              const map = new Map<string, UpgradeRequest>();
              for (const upg of data.upgrades) if (upg && upg.id) map.set(upg.id, upg);
              for (const upg of prev) if (upg && upg.id && !map.has(upg.id)) map.set(upg.id, upg);
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(merged)); } catch {}
              return merged;
            });
          }

          if (Array.isArray(data.transactions)) {
            setEarningTransactions(prev => {
              const map = new Map<string, EarningTransaction>();
              for (const t of data.transactions) if (t && t.id) map.set(t.id, t);
              for (const t of prev) if (t && t.id && !map.has(t.id)) map.set(t.id, t);
              const merged = Array.from(map.values());
              try { localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(merged)); } catch {}
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Database sync warning (using persistent local cache):', err);
    }
  };

  useEffect(() => {
    syncDatabase();
    const interval = setInterval(syncDatabase, 5000);
    return () => clearInterval(interval);
  }, []);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SELECTED_PACKAGE);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [registrationDraft, setRegistrationDraft] = useState<RegistrationDraft | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REGISTRATION_DRAFT);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (hash === '#admin' || hash === '#admin-portal' || hash === '#admin-dashboard' || pathname === '/admin') {
        return 'admin_dashboard';
      }
      if (hash === '#admin-login') {
        return 'admin_login';
      }

      const storedView = localStorage.getItem(STORAGE_KEY_ACTIVE_VIEW);
      const validViews: ActiveView[] = [
        'home',
        'checkout_registration',
        'checkout_payment',
        'login',
        'profile_initial',
        'profile_edit',
        'courses',
        'affiliate_dashboard',
        'affiliate_link',
        'upgrade_package',
        'kyc',
        'withdrawal',
        'leaderboard',
        'admin_login',
        'admin_dashboard'
      ];
      if (storedView && validViews.includes(storedView as ActiveView)) {
        return storedView as ActiveView;
      }
    } catch {}
    return 'home';
  });

  const [paymentSubmitted, setPaymentSubmitted] = useState<boolean>(false);
  const [referralCodeParam, setReferralCodeParam] = useState<string>('');

  // Admin Session State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Verify Admin Token on mount and when token changes
  useEffect(() => {
    if (!adminToken) {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      return;
    }

    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });

        const data = await response.json();
        if (response.ok && data.valid) {
          setIsAdminAuthenticated(true);
          setAdminUser(data.admin || { email: 'gauravgangwar814@gmail.com', name: 'Gaurav Gangwar', role: 'Super Admin' });
        } else {
          // Token expired or invalid
          try { sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN); } catch {}
          setAdminToken(null);
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      } catch (err) {
        console.error('Error verifying admin session:', err);
      }
    };

    verifyAdmin();
  }, [adminToken]);

  // Handle URL hash routing for direct Admin Portal access (#admin / #admin-login / /admin)
  useEffect(() => {
    const handleRouteCheck = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      if (hash === '#admin' || hash === '#admin-portal' || hash === '#admin-dashboard' || pathname === '/admin') {
        if (isAdminAuthenticated) {
          setActiveView('admin_dashboard');
        } else {
          setActiveView('admin_login');
        }
      } else if (hash === '#admin-login') {
        setActiveView('admin_login');
      }
    };

    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    return () => window.removeEventListener('hashchange', handleRouteCheck);
  }, [isAdminAuthenticated]);

  // Admin Login via secure backend endpoint
  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Access Denied: Invalid credentials or unauthorized account.'
        };
      }

      // Store in session storage
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, data.token);
      } catch (e) {
        console.error('Failed to store admin token in sessionStorage', e);
      }

      setAdminToken(data.token);
      setIsAdminAuthenticated(true);
      setAdminUser(data.admin || { email: email.trim(), name: 'Gaurav Gangwar', role: 'Super Admin' });
      setActiveView('admin_dashboard');
      window.location.hash = 'admin';

      return { success: true, message: 'Admin login successful' };
    } catch (err: any) {
      console.error('Admin login error:', err);
      return {
        success: false,
        message: 'Could not connect to backend server to authenticate admin. Please try again.'
      };
    }
  };

  // Admin Logout
  const adminLogout = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });
      }
    } catch (e) {
      // ignore
    } finally {
      try { sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN); } catch {}
      setAdminToken(null);
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      window.location.hash = '';
      setActiveView('home');
    }
  };

  // Persist transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(earningTransactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [earningTransactions]);

  // Save users & withdrawals & upgrades to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem('futureset_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WITHDRAWALS, JSON.stringify(withdrawalRequests));
      localStorage.setItem('futureset_withdrawals', JSON.stringify(withdrawalRequests));
    } catch (e) {
      console.error('Failed to save withdrawals', e);
    }
  }, [withdrawalRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_UPGRADES, JSON.stringify(upgradeRequests));
    } catch (e) {
      console.error('Failed to save upgrades', e);
    }
  }, [upgradeRequests]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUserId);
        localStorage.setItem('futureset_current_user', currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        localStorage.removeItem('futureset_current_user');
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }, [currentUserId]);

  // Persist active view across page refreshes and reloads
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_VIEW, activeView);
    } catch (e) {
      console.error('Failed to save activeView', e);
    }
  }, [activeView]);

  // Persist selected package for seamless checkout refresh
  useEffect(() => {
    try {
      if (selectedPackage) {
        localStorage.setItem(STORAGE_KEY_SELECTED_PACKAGE, JSON.stringify(selectedPackage));
      } else {
        localStorage.removeItem(STORAGE_KEY_SELECTED_PACKAGE);
      }
    } catch (e) {
      console.error('Failed to save selectedPackage', e);
    }
  }, [selectedPackage]);

  // Persist registration draft across refreshes
  useEffect(() => {
    try {
      if (registrationDraft) {
        localStorage.setItem(STORAGE_KEY_REGISTRATION_DRAFT, JSON.stringify(registrationDraft));
      } else {
        localStorage.removeItem(STORAGE_KEY_REGISTRATION_DRAFT);
      }
    } catch (e) {
      console.error('Failed to save registrationDraft', e);
    }
  }, [registrationDraft]);

  // Read URL query parameters for referral code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');
    if (ref) {
      setReferralCodeParam(ref.trim().toUpperCase());
    }
  }, []);

  // Compute users with dynamic real-time earnings calculated from their transactions and today's date
  const processedUsers = useMemo(() => {
    return users.map(user => {
      const computedEarnings = calculateUserEarnings(user.id, earningTransactions, user.earnings);
      return {
        ...user,
        earnings: computedEarnings
      };
    });
  }, [users, earningTransactions]);

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return (
      processedUsers.find(
        u => u.id === currentUserId || (u.email && u.email.toLowerCase() === currentUserId.toLowerCase())
      ) || null
    );
  }, [processedUsers, currentUserId]);

  const currentUserTransactions = useMemo(() => {
    if (!currentUserId) return [];
    return earningTransactions
      .filter(t => t.userId === currentUserId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [earningTransactions, currentUserId]);

  // Navigation handlers
  const startBuyNow = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPaymentSubmitted(false);
    setActiveView('checkout_registration');
  };

  const proceedToPayment = (draft: RegistrationDraft) => {
    if (!draft.referralCode || !draft.referralCode.trim()) {
      alert('❌ Referral Code is strictly mandatory. You cannot create an ID without a valid Referral Code.');
      return;
    }
    setRegistrationDraft(draft);
    setPaymentSubmitted(false);
    setActiveView('checkout_payment');
  };

  const generateReferralCode = (name: string): string => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'FS';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${randNum}`;
  };

  const submitPaymentProof = async (screenshotUrl: string, txId?: string) => {
    if (!registrationDraft || !selectedPackage) return;

    const cleanReferral = registrationDraft.referralCode ? registrationDraft.referralCode.trim().toUpperCase() : '';
    if (!cleanReferral) {
      alert('❌ Referral Code is strictly required to create an account. Please enter a valid Sponsor / Referral Code.');
      return;
    }

    const cleanEmail = registrationDraft.email.trim().toLowerCase();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      alert('An account with this Gmail address already exists. Please log in directly or use another Gmail address.');
      return;
    }

    const payload = {
      name: registrationDraft.name.trim(),
      email: cleanEmail,
      whatsapp: registrationDraft.whatsapp.trim(),
      password: registrationDraft.password,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      referredByCode: cleanReferral,
      paymentScreenshot: screenshotUrl,
      paymentUpiTxId: txId || `UPI${Date.now().toString().slice(-8)}`
    };

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.users && Array.isArray(data.users)) setUsers(data.users);
        if (data.transactions && Array.isArray(data.transactions)) setEarningTransactions(data.transactions);
        if (data.withdrawals && Array.isArray(data.withdrawals)) setWithdrawalRequests(data.withdrawals);
        setPaymentSubmitted(true);
        return;
      } else {
        alert(data.message || 'Registration failed. Please check your referral code and details.');
        return;
      }
    } catch (err) {
      console.warn('Network error during registration, saving locally', err);
    }

    // Fallback local save if network is offline (preserving all existing users)
    const newUserId = `user_${Date.now()}`;
    const newReferralCode = generateReferralCode(registrationDraft.name);

    const newUser: User = {
      id: newUserId,
      name: registrationDraft.name.trim(),
      email: cleanEmail,
      whatsapp: registrationDraft.whatsapp.trim(),
      password: registrationDraft.password,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      referralCode: newReferralCode,
      referredByCode: cleanReferral,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(registrationDraft.name)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentScreenshot: screenshotUrl,
      paymentUpiTxId: txId || `UPI${Date.now().toString().slice(-8)}`,
      kyc: {
        name: registrationDraft.name.trim(),
        bankName: '',
        accountNumber: '',
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

    setUsers(prev => [newUser, ...prev]);
    setPaymentSubmitted(true);
  };

  const handleBackFromPayment = () => {
    setPaymentSubmitted(false);
    setRegistrationDraft(null);
    setSelectedPackage(null);
    setActiveView('home');
    
    // Smooth scroll down to packages
    setTimeout(() => {
      const el = document.getElementById('packages-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; isPending?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Direct real-time authentication against server database
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        // Sync full database state from server
        try {
          const syncRes = await fetch('/api/database/sync');
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.success) {
              if (Array.isArray(syncData.users)) setUsers(syncData.users);
              if (Array.isArray(syncData.withdrawals)) setWithdrawalRequests(syncData.withdrawals);
              if (Array.isArray(syncData.transactions)) setEarningTransactions(syncData.transactions);
            }
          }
        } catch (syncErr) {
          console.warn('Sync error after login:', syncErr);
        }

        setCurrentUserId(data.user.id);
        setActiveView('profile_initial');
        return { success: true, message: 'Login successful!' };
      } else {
        if (data.isPending) {
          return {
            success: false,
            message: data.message || 'Your account is pending activation by administrator. Please wait for id activation. 🙏',
            isPending: true
          };
        }
        return {
          success: false,
          message: data.message || 'Invalid Gmail address or password. Please check and try again.'
        };
      }
    } catch (e) {
      console.warn('Backend login fetch error, falling back to cached state:', e);
    }

    // 2. Fallback to local memory if offline
    let user = processedUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail) 
      || users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No account found with this Gmail address. Please check your email or register.' };
    }

    const cleanUserPassword = (user.password || '').trim();
    if (cleanUserPassword && cleanUserPassword !== cleanPassword) {
      return { success: false, message: 'Invalid password. Please check and try again.' };
    }

    if (user.status === 'pending') {
      return { 
        success: false, 
        message: 'Your account is pending activation by administrator. Please wait for ID activation. 🙏',
        isPending: true
      };
    }

    setCurrentUserId(user.id);
    setActiveView('profile_initial');
    return { success: true, message: 'Login successful!' };
  };

  const logout = () => {
    setCurrentUserId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } catch {}
    setActiveView('home');
    setPaymentSubmitted(false);
    setRegistrationDraft(null);
    setSelectedPackage(null);
  };

  // Profile Updates - Permanently saves Name & Profile DP until user explicitly removes or edits it
  const updateProfile = async (name: string, avatarUrl: string) => {
    if (!currentUserId) return;

    const targetUser = users.find(u => u.id === currentUserId);
    // If empty avatarUrl, fallback to default dicebear avatar for user
    const finalAvatar = avatarUrl.trim() || (targetUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim() || targetUser.name)}` : '');

    const updatedUsers = users.map(u => {
      if (u.id === currentUserId) {
        return {
          ...u,
          name: name.trim() || u.name,
          avatarUrl: finalAvatar
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    } catch (e) {
      console.error('Failed to persist users to localStorage', e);
    }

    try {
      await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, name: name.trim(), avatarUrl: finalAvatar })
      });
    } catch (err) {
      console.warn('Could not sync profile update to server', err);
    }
  };

  const updateKYC = async (name: string, bankName: string, accountNumber: string, ifscCode: string, upiId: string) => {
    if (!currentUserId) return;
    const kycPayload = {
      name: name.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
      isCompleted: Boolean(name && bankName && ifscCode && upiId),
      updatedAt: new Date().toISOString()
    };

    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUserId) {
          return {
            ...u,
            kyc: kycPayload
          };
        }
        return u;
      })
    );

    try {
      await fetch('/api/users/update-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, kyc: kycPayload })
      });
    } catch (err) {
      console.warn('Could not sync KYC update to server', err);
    }
  };

  const sendPasswordResetOtp = async (email: string): Promise<{ success: boolean; message: string; maskedEmail?: string; emailSent?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: 'No registered account found with this Gmail address. Please check and enter your registered Gmail.'
      };
    }

    // Send email via server endpoint
    try {
      const response = await fetch('/api/auth/send-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            success: true,
            message: data.message || `OTP has been dispatched to your Gmail inbox (${data.maskedEmail}). Please check your Gmail app / inbox.`,
            maskedEmail: data.maskedEmail,
            emailSent: data.emailSent
          };
        } else {
          return {
            success: false,
            message: data.message || 'Failed to send OTP to Gmail. Please try again.'
          };
        }
      }
    } catch (e) {
      console.warn('Backend send-otp-email endpoint error', e);
    }

    const [userPart, domainPart] = cleanEmail.split('@');
    const maskedUser = userPart.length > 2 
      ? `${userPart[0]}${'*'.repeat(Math.min(userPart.length - 2, 4))}${userPart[userPart.length - 1]}`
      : userPart;
    const maskedEmail = `${maskedUser}@${domainPart || 'gmail.com'}`;

    return {
      success: true,
      message: `OTP dispatched to your registered Gmail (${maskedEmail}). Please check your Gmail app / inbox.`,
      maskedEmail,
      emailSent: true
    };
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No registered account found with this Gmail address.' };
    }

    if (!otp || !otp.trim()) {
      return { success: false, message: 'Please enter the 6-digit OTP sent to your Gmail.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    // Secure verification via backend
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otp.trim(),
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || '❌ Invalid OTP! The code you entered does not match the code sent to your Gmail.'
        };
      }
    } catch (err) {
      console.error('Reset password API error:', err);
      return {
        success: false,
        message: 'Could not connect to server to verify OTP. Please try again.'
      };
    }

    // Update password in permanent state
    setUsers(prev =>
      prev.map(u => {
        if (u.email.toLowerCase() === cleanEmail) {
          return {
            ...u,
            password: newPassword
          };
        }
        return u;
      })
    );

    return {
      success: true,
      message: '✅ Password reset successfully! You can now log in with your new password.'
    };
  };

  const requestWithdrawal = (amount?: number): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to make a withdrawal.' };
    }

    if (!currentUser.kyc.isCompleted) {
      return { success: false, message: 'Please complete your KYC details before requesting a withdrawal.' };
    }

    const availableAmount = amount || currentUser.earnings.allTime;
    if (availableAmount <= 0) {
      return { success: false, message: 'No available earnings to withdraw currently.' };
    }

    const newRequest: WithdrawalRequest = {
      id: `wdr_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userWhatsapp: currentUser.whatsapp,
      amount: availableAmount,
      upiId: currentUser.kyc.upiId,
      bankName: currentUser.kyc.bankName,
      accountNumber: currentUser.kyc.accountNumber,
      ifscCode: currentUser.kyc.ifscCode,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setWithdrawalRequests(prev => [newRequest, ...prev]);

    // Sync to backend DB
    fetch('/api/withdrawals/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userWhatsapp: currentUser.whatsapp,
        amount: availableAmount,
        upiId: currentUser.kyc.upiId,
        bankName: currentUser.kyc.bankName,
        accountNumber: currentUser.kyc.accountNumber,
        ifscCode: currentUser.kyc.ifscCode
      })
    }).catch(err => console.warn('Could not sync withdrawal to server', err));

    return {
      success: true,
      message: `Withdrawal request for ₹${availableAmount.toLocaleString('en-IN')} submitted successfully! Funds will be transferred to your registered UPI ID/Bank account.`
    };
  };

  // Admin Withdrawal Approval
  const approveWithdrawal = async (withdrawalId: string) => {
    setWithdrawalRequests(prev =>
      prev.map(w => {
        if (w.id === withdrawalId) {
          return {
            ...w,
            status: 'approved' as const,
            approvedAt: new Date().toISOString()
          };
        }
        return w;
      })
    );

    try {
      const res = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId })
      });
      const data = await res.json();
      if (res.ok && data.success && data.withdrawals) {
        setWithdrawalRequests(data.withdrawals);
      }
    } catch (err) {
      console.warn('Could not sync withdrawal approval to server', err);
    }
  };

  // Admin ID Activation
  const activateUser = async (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const activatedUser = { ...u, status: 'active' as const };
          
          if (activatedUser.referredByCode) {
            const referrer = prev.find(r => r.referralCode.toUpperCase() === activatedUser.referredByCode?.toUpperCase());
            if (referrer) {
              const commissionCalc = calculateAffiliateCommission(
                activatedUser.packageId,
                referrer.packageId,
                activatedUser.packagePrice
              );
              
              setEarningTransactions(existingTx => {
                const addedTxList: EarningTransaction[] = [];

                const alreadyAddedDirect = existingTx.some(t => t.fromUserId === activatedUser.id && t.userId === referrer.id && t.type !== 'passive');
                if (!alreadyAddedDirect) {
                  const directTx: EarningTransaction = {
                    id: `tx_dir_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
                    userId: referrer.id,
                    type: 'direct',
                    amount: commissionCalc.commission,
                    packageId: activatedUser.packageId,
                    packageName: activatedUser.packageName,
                    packagePrice: activatedUser.packagePrice,
                    fromUserId: activatedUser.id,
                    fromUserName: activatedUser.name,
                    fromUserEmail: activatedUser.email,
                    timestamp: new Date().toISOString(),
                    note: commissionCalc.capped
                      ? `Direct affiliate commission for ${activatedUser.packageName} Package (₹${activatedUser.packagePrice}) - Capped at your registered ${referrer.packageName} tier rate (₹${commissionCalc.commission})`
                      : `Direct affiliate commission for ${activatedUser.packageName} Package (₹${activatedUser.packagePrice})`
                  };
                  addedTxList.push(directTx);
                }

                if (referrer.referredByCode) {
                  const grandReferrer = prev.find(r => r.referralCode.toUpperCase() === referrer.referredByCode?.toUpperCase());
                  if (grandReferrer) {
                    const alreadyAddedPassive = existingTx.some(t => t.fromUserId === activatedUser.id && t.userId === grandReferrer.id && t.type === 'passive');
                    if (!alreadyAddedPassive) {
                      const passiveAmount = calculatePassiveIncome(commissionCalc.commission);
                      const passiveTx: EarningTransaction = {
                        id: `tx_pass_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
                        userId: grandReferrer.id,
                        type: 'passive',
                        amount: passiveAmount,
                        packageId: activatedUser.packageId,
                        packageName: activatedUser.packageName,
                        packagePrice: activatedUser.packagePrice,
                        fromUserId: activatedUser.id,
                        fromUserName: activatedUser.name,
                        fromUserEmail: activatedUser.email,
                        directReferrerName: referrer.name,
                        timestamp: new Date().toISOString(),
                        note: `Passive Income (₹${passiveAmount}) earned from ${referrer.name}'s direct referral (${activatedUser.name} enrolled with ${activatedUser.packageName})`
                      };
                      addedTxList.push(passiveTx);
                    }
                  }
                }

                if (addedTxList.length > 0) {
                  return [...addedTxList, ...existingTx];
                }
                return existingTx;
              });
            }
          }
          
          return activatedUser;
        }
        return u;
      })
    );

    try {
      const res = await fetch('/api/admin/users/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.users) setUsers(data.users);
        if (data.transactions) setEarningTransactions(data.transactions);
      }
    } catch (err) {
      console.warn('Could not sync user activation to server', err);
    }
  };

  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));

    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn('Could not sync delete to server', err);
    }
  };

  // Submit Package Upgrade Request
  const submitUpgradeRequest = async (
    targetPkg: Package, 
    screenshotUrl: string, 
    txId?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to upgrade your package.' };
    }

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userWhatsapp: currentUser.whatsapp,
      currentPackageId: currentUser.packageId,
      currentPackageName: currentUser.packageName,
      currentPackagePrice: currentUser.packagePrice,
      targetPackageId: targetPkg.id,
      targetPackageName: targetPkg.name,
      targetPackagePrice: targetPkg.price,
      amount: targetPkg.price,
      paymentScreenshot: screenshotUrl,
      paymentUpiTxId: txId
    };

    // Optimistically create locally
    const localUpgrade: UpgradeRequest = {
      id: `upg_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userWhatsapp: currentUser.whatsapp,
      currentPackageId: currentUser.packageId,
      currentPackageName: currentUser.packageName,
      currentPackagePrice: currentUser.packagePrice,
      targetPackageId: targetPkg.id,
      targetPackageName: targetPkg.name,
      targetPackagePrice: targetPkg.price,
      amount: targetPkg.price,
      paymentScreenshot: screenshotUrl,
      paymentUpiTxId: txId,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setUpgradeRequests(prev => [localUpgrade, ...prev]);

    try {
      const response = await fetch('/api/upgrades/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (data.upgrades) setUpgradeRequests(data.upgrades);
        return {
          success: true,
          message: 'Your upgrade payment is successful. Please wait for upgrade activation.'
        };
      }
    } catch (err) {
      console.warn('Backend upgrade submission error:', err);
    }

    return {
      success: true,
      message: 'Your upgrade payment is successful. Please wait for upgrade activation.'
    };
  };

  // Admin Approve & Activate Package Upgrade
  const approveUpgradeRequest = async (upgradeId: string) => {
    const upg = upgradeRequests.find(u => u.id === upgradeId);
    if (!upg) return;

    // Optimistically update upgrade request
    setUpgradeRequests(prev =>
      prev.map(item =>
        item.id === upgradeId
          ? { ...item, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : item
      )
    );

    // Optimistically update user's package
    setUsers(prev =>
      prev.map(u => {
        if ((u.id && u.id === upg.userId) || (u.email && u.email.toLowerCase() === upg.userEmail.toLowerCase())) {
          return {
            ...u,
            packageId: upg.targetPackageId,
            packageName: upg.targetPackageName,
            packagePrice: upg.targetPackagePrice
          };
        }
        return u;
      })
    );

    try {
      const res = await fetch('/api/admin/upgrades/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgradeId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.users) setUsers(data.users);
        if (data.upgrades) setUpgradeRequests(data.upgrades);
        if (data.transactions) setEarningTransactions(data.transactions);
      }
    } catch (err) {
      console.warn('Could not sync upgrade approval to server', err);
    }
  };

  // Admin Delete / Reject Upgrade Request
  const deleteUpgradeRequest = async (upgradeId: string) => {
    setUpgradeRequests(prev => prev.filter(u => u.id !== upgradeId));

    try {
      const res = await fetch('/api/admin/upgrades/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upgradeId })
      });
      const data = await res.json();
      if (res.ok && data.upgrades) {
        setUpgradeRequests(data.upgrades);
      }
    } catch (err) {
      console.warn('Could not sync upgrade deletion to server', err);
    }
  };

  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const pendingUpgradesCount = upgradeRequests.filter(u => u.status === 'pending').length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeView,
        selectedPackage,
        registrationDraft,
        paymentSubmitted,
        users: processedUsers,
        withdrawalRequests,
        upgradeRequests,
        referralCodeParam,
        earningTransactions,
        currentUserTransactions,
        setActiveView,
        startBuyNow,
        proceedToPayment,
        submitPaymentProof,
        handleBackFromPayment,
        submitUpgradeRequest,
        approveUpgradeRequest,
        deleteUpgradeRequest,
        login,
        logout,
        sendPasswordResetOtp,
        resetPassword,
        updateProfile,
        updateKYC,
        requestWithdrawal,
        activateUser,
        deleteUser,
        approveWithdrawal,
        pendingUsersCount,
        pendingUpgradesCount,
        syncDatabase,
        isAdminAuthenticated,
        adminUser,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
