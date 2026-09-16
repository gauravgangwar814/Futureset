import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PACKAGES, PACKAGE_TIERS } from '../data/packages';
import { Package } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  FileCheck, 
  ExternalLink,
  Zap,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const UpgradePackageView: React.FC = () => {
  const { 
    currentUser, 
    setActiveView, 
    submitUpgradeRequest,
    upgradeRequests
  } = useApp();

  const [selectedTargetPkg, setSelectedTargetPkg] = useState<Package | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [txId, setTxId] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedUpgradeDetails, setSubmittedUpgradeDetails] = useState<{
    currentPkgName: string;
    targetPkgName: string;
    amount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const UPI_ID = '8279641186@ybl';

  // Find user's tier index
  const currentUserTierIndex = currentUser 
    ? PACKAGE_TIERS.indexOf((currentUser.packageId || '').toLowerCase().trim()) 
    : -1;

  // Filter ONLY higher packages (strictly greater tier index and price)
  const higherPackages = PACKAGES.filter(pkg => {
    const pkgIndex = PACKAGE_TIERS.indexOf(pkg.id.toLowerCase().trim());
    if (currentUserTierIndex === -1) {
      return pkg.price > (currentUser?.packagePrice || 0);
    }
    return pkgIndex > currentUserTierIndex && pkg.price > (currentUser?.packagePrice || 0);
  });

  // Check if user has an existing pending upgrade request
  const existingPendingUpgrade = currentUser 
    ? upgradeRequests.find(u => u.userId === currentUser.id && u.status === 'pending')
    : null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size is larger than 10MB. Please upload a smaller image.');
        return;
      }
      setUploadError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    setUploadError('');
    setScreenshotPreview('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    setTxId(`UPG${Date.now().toString().slice(-8)}`);
  };

  const handleSubmitUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetPkg) return;
    if (!screenshotPreview) {
      setUploadError('Please select or upload your payment screenshot proof.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitUpgradeRequest(selectedTargetPkg, screenshotPreview, txId.trim() || undefined);
      if (res.success) {
        setSubmittedUpgradeDetails({
          currentPkgName: currentUser?.packageName || 'Current Package',
          targetPkgName: selectedTargetPkg.name,
          amount: selectedTargetPkg.price
        });
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center p-8 rounded-3xl bg-white border border-slate-200 max-w-md w-full shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Login Required</h3>
          <p className="text-sm text-slate-500 mb-6">
            Please log in with your registered account to upgrade to a higher package.
          </p>
          <button
            onClick={() => setActiveView('login')}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If already submitted in current view session, stay on confirmation page until user clicks Back
  if (isSubmitted) {
    return (
      <div id="upgrade-success-view" className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
              <FileCheck className="w-10 h-10" />
            </div>

            {/* EXACT MANDATED MESSAGE */}
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 leading-tight">
              Your upgrade payment is successful. Please wait for upgrade activation.
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-3 max-w-md mx-auto">
              Our admin team is reviewing your upgrade receipt. Once approved, your account will instantly switch to the new package and unlock all higher tier courses and commissions.
            </p>

            {submittedUpgradeDetails && (
              <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Account Name:</span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Registered Gmail:</span>
                  <span className="font-bold text-blue-700">{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Previous Tier:</span>
                  <span className="font-semibold text-slate-700">{submittedUpgradeDetails.currentPkgName}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Requested Upgrade:</span>
                  <span className="font-bold text-emerald-600">{submittedUpgradeDetails.targetPkgName} Package</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Amount Submitted:</span>
                  <span className="text-sm font-black text-blue-700">₹{submittedUpgradeDetails.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-upgrade-back-dashboard"
                onClick={() => setActiveView('profile_initial')}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              
              <button
                id="btn-upgrade-back-home"
                onClick={() => setActiveView('home')}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Deep link for UPI app payment if target package is selected
  const upiDeepLink = selectedTargetPkg
    ? `upi://pay?pa=${UPI_ID}&pn=FutureSet&am=${selectedTargetPkg.price}&cu=INR&tn=FutureSet_Upgrade_To_${selectedTargetPkg.name}`
    : '';

  return (
    <div id="upgrade-package-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-from-upgrade"
              onClick={() => {
                if (selectedTargetPkg) {
                  setSelectedTargetPkg(null);
                  setScreenshotPreview(null);
                  setUploadError('');
                } else {
                  setActiveView('profile_initial');
                }
              }}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-blue-600 border border-slate-200 transition-colors shadow-sm"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-black uppercase text-blue-700 tracking-wider">
                  Quick Navigation
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Higher Tiers Only
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <span>Upgrade Package</span>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </h1>
            </div>
          </div>

          {/* Current Package Active Badge */}
          <div className="p-3.5 sm:px-5 rounded-2xl bg-white border border-blue-200 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Your Current Package
              </span>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-black text-slate-900 capitalize">
                  {currentUser.packageName || currentUser.packageId}
                </strong>
                <span className="text-xs font-extrabold text-blue-700">
                  (₹{currentUser.packagePrice.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Pending Upgrade Notice (if any) */}
        {existingPendingUpgrade && !isSubmitted && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-900">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-slate-900 block">Upgrade Request Pending Approval</strong>
              You already submitted a request to upgrade to <strong>{existingPendingUpgrade.targetPackageName} Package (₹{existingPendingUpgrade.targetPackagePrice.toLocaleString('en-IN')})</strong>. 
              Our admin team will activate your package soon. You may also submit an updated request below if required.
            </div>
          </div>
        )}

        {/* SECTION 1: IF USER IS ALREADY ON HIGHEST TIER */}
        {higherPackages.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-blue-200 text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
              Maximum Tier Active! 🏆
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              You are already enrolled in our highest flagship package: <strong className="text-blue-700">{currentUser.packageName} Package (₹{currentUser.packagePrice})</strong>.
              All 16+ courses, advanced masterclasses, and highest affiliate direct & passive rates are permanently unlocked!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveView('courses')}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                Access My Courses
              </button>
              <button
                onClick={() => setActiveView('affiliate_dashboard')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition-colors"
              >
                View Affiliate Earnings
              </button>
            </div>
          </div>
        ) : selectedTargetPkg ? (
          
          /* SECTION 2: PAYMENT & VERIFICATION STEP FOR SELECTED HIGHER PACKAGE */
          <div className="max-w-2xl mx-auto">
            
            {/* Step 2 Header */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedTargetPkg(null);
                  setScreenshotPreview(null);
                  setUploadError('');
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose Another Package</span>
              </button>
              
              <span className="text-xs font-bold text-slate-500">
                Step 2 of 2 • Upgrade Payment
              </span>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
              
              {/* Package Banner Header */}
              <div className="relative w-full h-32 overflow-hidden bg-slate-900">
                {selectedTargetPkg.imageUrl && (
                  <img
                    src={selectedTargetPkg.imageUrl}
                    alt={`${selectedTargetPkg.name} Package`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
                <div className="absolute inset-x-5 bottom-3 flex items-center justify-between z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                      Upgrading To
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-wide">
                      {selectedTargetPkg.name} Package
                    </h3>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/95 border border-blue-200 text-right backdrop-blur-md shadow-sm">
                    <span className="text-sm font-black text-blue-700">
                      ₹{selectedTargetPkg.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Upgrade Comparison Pill */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Tier</span>
                    <span className="font-bold text-slate-800">{currentUser.packageName} (₹{currentUser.packagePrice})</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="text-blue-700 block text-[10px] uppercase font-bold">Target Tier</span>
                    <span className="font-bold text-emerald-600">{selectedTargetPkg.name} (₹{selectedTargetPkg.price})</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitUpgrade} className="space-y-6">
                  
                  {/* 1. Official UPI ID Section */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Official Upgrade UPI ID
                    </span>
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <span className="font-mono text-base sm:text-lg font-black text-blue-700 tracking-wide select-all">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        id="btn-copy-upgrade-upi"
                        onClick={copyToClipboard}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 border border-blue-200"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. QR Code Display */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Scan QR Code with any UPI App (GPay / PhonePe / Paytm)
                    </span>

                    <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                      <QRCodeSVG
                        value={upiDeepLink}
                        size={190}
                        level="H"
                        includeMargin={false}
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                      <span>Upgrade Amount to Pay:</span>
                      <strong className="text-blue-700 text-sm">₹{selectedTargetPkg.price.toLocaleString('en-IN')}</strong>
                    </div>

                    {/* Direct Pay UPI Link Button for mobile */}
                    <a
                      href={upiDeepLink}
                      id="btn-open-upgrade-upi-app"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>Click to Pay Directly on UPI App</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* 3. Payment Screenshot Upload */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Payment Screenshot Upload <span className="text-blue-600">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleUseSampleReceipt}
                        className="text-[11px] text-blue-600 hover:underline font-bold"
                      >
                        Quick Test Receipt
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="upgrade-screenshot-input"
                    />

                    {screenshotPreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-white p-3 flex items-center gap-4 shadow-sm">
                        <img
                          src={screenshotPreview}
                          alt="Upgrade Payment Slip Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                            <Check className="w-4 h-4" />
                            <span>Screenshot Attached</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">Ready for verification</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 border border-slate-200"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-white hover:bg-slate-50 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            Click to browse or drop payment screenshot
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>

                  {/* 4. Optional UTR / Reference ID */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      UTR / UPI Reference ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      placeholder="e.g. 408271829102"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* 5. Submit Button */}
                  <button
                    type="submit"
                    id="btn-submit-upgrade-proof"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Upgrade Proof...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Submit Upgrade Payment Proof</span>
                      </>
                    )}
                  </button>

                </form>
              </div>
            </div>
          </div>
        ) : (

          /* SECTION 3: HIGHER PACKAGES LIST (GRID) */
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Choose Your Next Level
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Available Higher Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Select a higher package below to unlock comprehensive video masterclasses, premium digital skill toolkits, and higher affiliate commission levels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {higherPackages.map((pkg) => {
                const pkgIndex = PACKAGE_TIERS.indexOf(pkg.id.toLowerCase().trim());
                const isNextTier = pkgIndex === currentUserTierIndex + 1;

                return (
                  <div
                    key={pkg.id}
                    id={`upgrade-pkg-card-${pkg.id}`}
                    className={`rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-md hover:shadow-xl hover:shadow-blue-500/10 ${
                      isNextTier
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Badge */}
                    {isNextTier && (
                      <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        Recommended Next Step
                      </div>
                    )}

                    {/* Image Banner */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                      {pkg.imageUrl ? (
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                          <Crown className="w-12 h-12 text-blue-400/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                      
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                            {pkg.badge || 'VIP Tier'}
                          </span>
                          <h3 className="text-lg font-black text-white capitalize">
                            {pkg.name} Package
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 line-through block">
                            ₹{(pkg.price * 2).toLocaleString('en-IN')}
                          </span>
                          <span className="text-base font-black text-amber-400">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Description & Stats */}
                      <div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {pkg.tagline}
                        </p>

                        <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 pb-3 border-b border-slate-100">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <strong>{pkg.coursesCount} Courses</strong>
                          </span>
                          <span>•</span>
                          <span>{pkg.lessonsCount} Lessons</span>
                          <span>•</span>
                          <span className="text-blue-700 font-bold">⭐ {pkg.rating}</span>
                        </div>

                        {/* Included skills preview */}
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                            Key Skills Unlocked:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                            {pkg.skills.length > 3 && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-bold">
                                +{pkg.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Select Action */}
                      <button
                        id={`btn-select-upgrade-${pkg.id}`}
                        onClick={() => {
                          setSelectedTargetPkg(pkg);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isNextTier
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-blue-500/20'
                            : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        <Zap className="w-4 h-4" />
                        <span>Upgrade to {pkg.name} (₹{pkg.price})</span>
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
