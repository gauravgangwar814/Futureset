import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  UserCheck, 
  CreditCard, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Eye, 
  X, 
  Copy, 
  Check, 
  ExternalLink,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowLeft,
  Smartphone,
  Mail,
  Calendar,
  Building,
  Sparkles,
  RefreshCw,
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2,
  Zap,
  TrendingUp,
  Crown,
  ChevronRight
} from 'lucide-react';
import defaultFounderPhoto from '../assets/images/founder-ceo.jpg';
import { processImageFile, saveFounderPhoto, loadFounderPhoto } from '../utils/imageStorage';

export const AdminDashboardView: React.FC = () => {
  const { 
    users, 
    withdrawalRequests, 
    upgradeRequests,
    activateUser, 
    deleteUser, 
    approveWithdrawal,
    approveUpgradeRequest,
    deleteUpgradeRequest,
    adminLogout, 
    adminUser,
    syncDatabase,
    setActiveView 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'activations' | 'upgrades' | 'withdrawals' | 'founder_settings'>('activations');
  const [activationFilter, setActivationFilter] = useState<'pending' | 'active' | 'all'>('pending');
  const [upgradeFilter, setUpgradeFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [founderPhoto, setFounderPhoto] = useState<string>(defaultFounderPhoto);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const founderPhotoInputRef = useRef<HTMLInputElement>(null);

  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync DB and Founder Photo on mount
  useEffect(() => {
    syncDatabase();
    fetch('/api/founder-photo-json', { cache: 'no-cache' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.photo) {
          setFounderPhoto(data.photo);
        } else {
          loadFounderPhoto().then((saved) => {
            if (saved) setFounderPhoto(saved);
          });
        }
      })
      .catch(() => {
        loadFounderPhoto().then((saved) => {
          if (saved) setFounderPhoto(saved);
        });
      });
  }, []);

  const handleUploadFounderPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const processedDataUrl = await processImageFile(file);
      
      // 1. Update state
      setFounderPhoto(processedDataUrl);

      // 2. Save locally in IndexedDB
      await saveFounderPhoto(processedDataUrl);

      // 3. Broadcast to all open components (e.g. HomeView)
      window.dispatchEvent(new CustomEvent('founder-photo-updated', { detail: processedDataUrl }));

      // 4. Save to server disk permanently
      await fetch('/api/upload-founder-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: processedDataUrl })
      }).catch((err) => console.warn('Server write warning:', err));

      showToast('✅ Founder photo permanently updated & saved to website data!');
    } catch (err) {
      console.error('Failed to update founder photo:', err);
      showToast('❌ Failed to update founder photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncDatabase();
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Database synced with latest records!');
    }, 400);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // User Activation calculations
  const pendingUsers = users.filter(u => u.status === 'pending');
  const activeUsers = users.filter(u => u.status === 'active');

  const filteredUsers = users.filter(u => {
    if (activationFilter === 'pending' && u.status !== 'pending') return false;
    if (activationFilter === 'active' && u.status !== 'active') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchWhatsapp = u.whatsapp?.includes(q);
      const matchPackage = u.packageName?.toLowerCase().includes(q);
      return matchName || matchEmail || matchWhatsapp || matchPackage;
    }
    return true;
  });

  // Package Upgrade calculations
  const pendingUpgrades = upgradeRequests.filter(u => u.status === 'pending');
  const approvedUpgrades = upgradeRequests.filter(u => u.status === 'approved');
  const totalApprovedUpgradeAmount = approvedUpgrades.reduce((sum, u) => sum + (u.amount || 0), 0);

  const filteredUpgrades = upgradeRequests.filter(u => {
    if (upgradeFilter === 'pending' && u.status !== 'pending') return false;
    if (upgradeFilter === 'approved' && u.status !== 'approved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.userName?.toLowerCase().includes(q);
      const matchEmail = u.userEmail?.toLowerCase().includes(q);
      const matchTarget = u.targetPackageName?.toLowerCase().includes(q);
      const matchCurrent = u.currentPackageName?.toLowerCase().includes(q);
      const matchUtr = u.paymentUpiTxId?.toLowerCase().includes(q);
      return matchName || matchEmail || matchTarget || matchCurrent || matchUtr;
    }
    return true;
  });

  // Withdrawal calculations
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');
  const approvedWithdrawals = withdrawalRequests.filter(w => w.status === 'approved');
  const totalApprovedAmount = approvedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  const filteredWithdrawals = withdrawalRequests.filter(w => {
    if (withdrawalFilter === 'pending' && w.status !== 'pending') return false;
    if (withdrawalFilter === 'approved' && w.status !== 'approved') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = w.userName?.toLowerCase().includes(q);
      const matchEmail = w.userEmail?.toLowerCase().includes(q);
      const matchUpi = w.upiId?.toLowerCase().includes(q);
      return matchName || matchEmail || matchUpi;
    }
    return true;
  });

  const handleActivate = (userId: string, userName: string) => {
    activateUser(userId);
    showToast(`✅ User ${userName}'s ID has been permanently activated! They can now log in.`);
  };

  const handleApproveUpgrade = (upgradeId: string, userName: string, targetPkgName: string) => {
    approveUpgradeRequest(upgradeId);
    showToast(`✅ Upgrade approved! ${userName}'s package has been updated to ${targetPkgName} Package.`);
  };

  const handleApproveWithdrawal = (withdrawalId: string, userName: string, amount: number) => {
    approveWithdrawal(withdrawalId);
    showToast(`✅ Withdrawal of ₹${amount.toLocaleString('en-IN')} for ${userName} marked as Approved!`);
  };

  return (
    <div id="admin-dashboard-screen" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header for Admin */}
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  FutureSet Admin Console
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold uppercase">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authorized: <strong className="text-slate-800">{adminUser?.email || 'gauravgangwar814@gmail.com'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              id="btn-admin-sync-database"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors disabled:opacity-50"
              title="Fetch latest registrations and status updates from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              id="btn-admin-switch-to-website"
              onClick={() => {
                window.location.hash = '';
                setActiveView('home');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>

            <button
              id="btn-admin-logout"
              onClick={() => {
                adminLogout();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => { setActiveTab('activations'); setActivationFilter('pending'); }}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
              activeTab === 'activations' && activationFilter === 'pending'
                ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Activations</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-600">
              {pendingUsers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              New payment proofs awaiting approval
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('upgrades'); setUpgradeFilter('pending'); }}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
              activeTab === 'upgrades' && upgradeFilter === 'pending'
                ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Upgrades</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-600">
              {pendingUpgrades.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Package upgrade proofs to activate
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('withdrawals'); setWithdrawalFilter('pending'); }}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
              activeTab === 'withdrawals' && withdrawalFilter === 'pending'
                ? 'border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Withdrawals</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {pendingWithdrawals.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Affiliate payout requests to process
            </div>
          </div>

          <div 
            onClick={() => { setActiveTab('activations'); setActivationFilter('active'); }}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-sm ${
              activeTab === 'activations' && activationFilter === 'active'
                ? 'border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Enrolled Users</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {activeUsers.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Permanently activated learner accounts
            </div>
          </div>

        </div>

        {/* Primary Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          
          <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <button
              id="tab-admin-activations"
              onClick={() => setActiveTab('activations')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'activations'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>1. User Activation</span>
              {pendingUsers.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'activations' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {pendingUsers.length}
                </span>
              )}
            </button>

            <button
              id="tab-admin-upgrades"
              onClick={() => setActiveTab('upgrades')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'upgrades'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Upgrade Requests</span>
              {pendingUpgrades.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'upgrades' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'
                }`}>
                  {pendingUpgrades.length}
                </span>
              )}
            </button>

            <button
              id="tab-admin-withdrawals"
              onClick={() => setActiveTab('withdrawals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'withdrawals'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>3. Withdrawal Requests</span>
              {pendingWithdrawals.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'withdrawals' ? 'bg-white text-blue-600' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {pendingWithdrawals.length}
                </span>
              )}
            </button>

            <button
              id="tab-admin-founder-settings"
              onClick={() => setActiveTab('founder_settings')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'founder_settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>4. Founder Photo & Branding</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, UPI..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

        </div>

        {/* TAB 1: USER ACTIVATION CONTENT */}
        {activeTab === 'activations' && (
          <div className="space-y-6">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivationFilter('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activationFilter === 'pending'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Pending Activations ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActivationFilter('active')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activationFilter === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Active Users ({activeUsers.length})
              </button>
              <button
                onClick={() => setActivationFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activationFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                All Records ({users.length})
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Users Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {activationFilter === 'pending' 
                    ? 'All user registration requests are currently activated and up-to-date.'
                    : 'No user records matching the current filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((user) => {
                  const isPending = user.status === 'pending';

                  return (
                    <div
                      key={user.id}
                      id={`admin-user-card-${user.id}`}
                      className={`rounded-2xl bg-white p-5 sm:p-6 border transition-all shadow-sm ${
                        isPending 
                          ? 'border-blue-300 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/30' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 text-base">{user.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isPending
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isPending ? 'Pending Activation' : 'Active Member'}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-700">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-medium text-emerald-700">{user.whatsapp}</span>
                              <a
                                href={`https://wa.me/91${user.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-600 underline ml-1 hover:text-blue-700"
                              >
                                Message WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Package Badge */}
                        <div className="text-right shrink-0">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black block">
                            {user.packageName} Package
                          </span>
                          <span className="text-xs font-extrabold text-slate-700 mt-1 block">
                            ₹{user.packagePrice?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Details & Payment Reference */}
                      <div className="py-3 space-y-2 text-xs text-slate-600 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Registration Date:</span>
                          <span className="font-mono text-slate-800">
                            {new Date(user.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>

                        {user.referredByCode && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Referred by Sponsor:</span>
                            <span className="font-bold text-blue-700 font-mono">{user.referredByCode}</span>
                          </div>
                        )}

                        {user.paymentUpiTxId && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">UPI Ref / Tx ID:</span>
                            <span className="font-mono font-bold text-emerald-600">{user.paymentUpiTxId}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Proof & Actions */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        
                        {/* View Screenshot Proof */}
                        {user.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshot(user.paymentScreenshot || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Payment Proof</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No Screenshot Uploaded</span>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <button
                              id={`btn-admin-activate-${user.id}`}
                              onClick={() => handleActivate(user.id, user.name)}
                              className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Activate User ID</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Active & Enabled</span>
                            </div>
                          )}

                          {isPending && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to reject/remove user ${user.name}?`)) {
                                  deleteUser(user.id);
                                  showToast(`User ${user.name} removed.`);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors"
                              title="Reject & Delete"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: UPGRADE REQUESTS CONTENT */}
        {activeTab === 'upgrades' && (
          <div className="space-y-6">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                id="btn-filter-upgrade-pending"
                onClick={() => setUpgradeFilter('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  upgradeFilter === 'pending'
                    ? 'bg-amber-50 text-amber-800 border border-amber-300'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Pending Upgrades ({pendingUpgrades.length})
              </button>
              <button
                id="btn-filter-upgrade-approved"
                onClick={() => setUpgradeFilter('approved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  upgradeFilter === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Approved Upgrades ({approvedUpgrades.length})
              </button>
              <button
                id="btn-filter-upgrade-all"
                onClick={() => setUpgradeFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  upgradeFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                All Upgrades ({upgradeRequests.length})
              </button>
            </div>

            {filteredUpgrades.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Upgrade Requests Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {upgradeFilter === 'pending'
                    ? 'All package upgrade requests have been reviewed and activated.'
                    : 'No package upgrade records match the current filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUpgrades.map((upg) => {
                  const isPending = upg.status === 'pending';

                  return (
                    <div
                      key={upg.id}
                      id={`admin-upgrade-card-${upg.id}`}
                      className={`rounded-2xl bg-white p-5 border transition-all shadow-sm flex flex-col justify-between ${
                        isPending 
                          ? 'border-amber-300 shadow-md shadow-amber-500/5 ring-1 ring-amber-400/30' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-3">
                        
                        {/* Header with User Info & Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                              <span>{upg.userName}</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                                Upgrade Request
                              </span>
                            </h3>
                            
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-slate-700">{upg.userEmail}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(upg.userEmail, 'Gmail')}
                                className="ml-1 text-slate-400 hover:text-slate-600"
                                title="Copy Email"
                              >
                                {copiedText === 'Gmail' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </p>

                            {upg.userWhatsapp && (
                              <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-0.5">
                                <span>WhatsApp: {upg.userWhatsapp}</span>
                              </p>
                            )}
                          </div>

                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shrink-0 ${
                            isPending
                              ? 'bg-amber-50 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isPending ? 'Pending Activation' : 'Upgrade Activated'}
                          </span>
                        </div>

                        {/* Package Transition Box */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Package</span>
                            <span className="font-bold text-slate-700">{upg.currentPackageName}</span>
                            <span className="text-slate-500 text-[11px] block">₹{upg.currentPackagePrice?.toLocaleString('en-IN')}</span>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center">
                            <ChevronRight className="w-4 h-4" />
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-amber-600 uppercase block">Target Upgrade</span>
                            <span className="font-extrabold text-emerald-700">{upg.targetPackageName} Package</span>
                            <span className="text-amber-600 font-bold text-[11px] block">₹{upg.targetPackagePrice?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Upgrade Amount & UTR */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-700 uppercase block">Upgrade Payment:</span>
                            <strong className="text-sm font-black text-amber-900">₹{upg.amount?.toLocaleString('en-IN')}</strong>
                          </div>

                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">UTR / Ref ID:</span>
                            <span className="font-mono text-slate-800 font-bold truncate block">
                              {upg.paymentUpiTxId || 'Not provided'}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Requested: {new Date(upg.requestedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}</span>
                          {upg.approvedAt && (
                            <span className="text-emerald-600">
                              • Approved: {new Date(upg.approvedAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Payment Proof & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        
                        {/* View Screenshot Proof */}
                        {upg.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshot(upg.paymentScreenshot || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-xs font-bold text-amber-800 hover:text-amber-900 transition-colors shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>View Upgrade Slip</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No Screenshot Uploaded</span>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {isPending ? (
                            <button
                              id={`btn-admin-approve-upg-${upg.id}`}
                              onClick={() => handleApproveUpgrade(upg.id, upg.userName, upg.targetPackageName)}
                              className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white hover:brightness-110 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve & Activate Upgrade</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Upgraded & Active</span>
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete upgrade request for ${upg.userName}?`)) {
                                deleteUpgradeRequest(upg.id);
                                showToast(`Upgrade request for ${upg.userName} removed.`);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors"
                            title="Delete record"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: WITHDRAWAL REQUESTS CONTENT */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWithdrawalFilter('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  withdrawalFilter === 'pending'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Pending Approvals ({pendingWithdrawals.length})
              </button>
              <button
                onClick={() => setWithdrawalFilter('approved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  withdrawalFilter === 'approved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                Approved ({approvedWithdrawals.length})
              </button>
              <button
                onClick={() => setWithdrawalFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  withdrawalFilter === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                All Requests ({withdrawalRequests.length})
              </button>
            </div>

            {filteredWithdrawals.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Withdrawal Requests</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {withdrawalFilter === 'pending'
                    ? 'All withdrawal requests have been processed and approved.'
                    : 'No withdrawal records match the current filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWithdrawals.map((req) => {
                  const isPending = req.status === 'pending';

                  return (
                    <div
                      key={req.id}
                      id={`admin-withdrawal-card-${req.id}`}
                      className={`rounded-2xl bg-white p-5 sm:p-6 border transition-all shadow-sm ${
                        isPending 
                          ? 'border-blue-300 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/30' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        
                        {/* User & Amount Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
                              ₹{req.amount?.toLocaleString('en-IN')}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              isPending
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isPending ? 'Pending Approval' : 'Approved'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <span>{req.userName}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-normal">{req.userEmail}</span>
                            {req.userWhatsapp && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-xs text-emerald-600 font-normal">WA: {req.userWhatsapp}</span>
                              </>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Requested: {new Date(req.requestedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}</span>
                            {req.approvedAt && (
                              <span className="text-emerald-600">
                                • Approved: {new Date(req.approvedAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Payment Details (UPI & Bank) */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs min-w-[280px]">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                            Payout Bank / UPI Details:
                          </div>

                          {req.upiId && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">UPI ID:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="text-blue-700 font-mono text-xs">{req.upiId}</strong>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(req.upiId, 'UPI ID')}
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                                  title="Copy UPI ID"
                                >
                                  {copiedText === 'UPI ID' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {req.bankName && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">Bank:</span>
                              <span className="text-slate-800 font-medium">{req.bankName}</span>
                            </div>
                          )}

                          {req.accountNumber && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">Account No:</span>
                              <span className="font-mono text-slate-800">{req.accountNumber}</span>
                            </div>
                          )}

                          {req.ifscCode && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">IFSC Code:</span>
                              <span className="font-mono text-slate-800">{req.ifscCode}</span>
                            </div>
                          )}
                        </div>

                        {/* Approve Action Button */}
                        <div className="shrink-0 flex items-center gap-2">
                          {isPending ? (
                            <button
                              id={`btn-admin-approve-wdr-${req.id}`}
                              onClick={() => handleApproveWithdrawal(req.id, req.userName, req.amount)}
                              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Withdrawal</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Status: Approved</span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: FOUNDER PHOTO & BRANDING SETTINGS */}
        {activeTab === 'founder_settings' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
              
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Founder & CEO Official Photo (Gaurav Gangwar)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload your real portrait photo. It will permanently save into the website's core database & storage.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                {/* Photo Preview */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative group w-56 sm:w-64 aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border-4 border-blue-500 shadow-xl">
                    <img
                      src={founderPhoto}
                      alt="Gaurav Gangwar"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.currentTarget.src = defaultFounderPhoto;
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3 text-center">
                      <p className="text-xs font-bold text-white">Gaurav Gangwar</p>
                      <p className="text-[10px] text-blue-300 font-medium">Founder & CEO, FutureSet</p>
                    </div>
                  </div>
                </div>

                {/* Upload Action & Guidance */}
                <div className="md:col-span-7 space-y-5">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed space-y-2">
                    <div className="flex items-center gap-2 font-bold text-blue-800">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Security & Integrity Protected</span>
                    </div>
                    <p>
                      Website visitors cannot change or remove this photo. Only you (Super Admin) can update it from this console or via your account profile.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => founderPhotoInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{isUploadingPhoto ? 'Saving Photo...' : 'Upload Real Founder Photo'}</span>
                    </button>

                    <input
                      ref={founderPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFounderPhoto}
                      className="hidden"
                    />

                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP. Automatically optimized for fast loading across all devices.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Photo is instantly live on Homepage and Founder message section.</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Screenshot Full Screen Zoom Modal */}
      {previewScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Payment Screenshot Proof</h3>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center min-h-[300px]">
              <img
                src={previewScreenshot}
                alt="Payment Screenshot Proof"
                className="w-full h-auto object-contain max-h-[65vh]"
              />
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
