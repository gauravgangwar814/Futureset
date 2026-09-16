import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateAffiliateCommission } from '../utils/affiliateEarnings';
import { 
  Link2, 
  Copy, 
  Check, 
  Share2, 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Users, 
  ExternalLink, 
  ShieldCheck
} from 'lucide-react';

export const AffiliateLinkView: React.FC = () => {
  const { currentUser, setActiveView, logout } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please log in to view your affiliate link.</p>
          <button
            onClick={() => setActiveView('login')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Construct official affiliate URL
  const baseUrl = window.location.origin + window.location.pathname;
  const affiliateUrl = `${baseUrl}?ref=${currentUser.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 Join FutureSet with my official referral link and learn high-income digital skills today! \n\n👉 Enroll here: ${affiliateUrl}\n\nMy Referral Code: ${currentUser.referralCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  // Simulation test to test end-to-end referral
  const handleTestReferralLink = () => {
    // Log out current user and go to home page with the ref query param
    window.history.pushState({}, '', `?ref=${currentUser.referralCode}`);
    logout();
    setTimeout(() => {
      const el = document.getElementById('packages-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <div id="affiliate-link-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          id="btn-affiliate-link-back"
          onClick={() => setActiveView('profile_initial')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xl">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <Link2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Affiliate & Referral Link
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Share your link to invite students. When they purchase, your referral code is automatically applied.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            
            {/* 1. Referral Code Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Your Personal Referral Code
                </span>
                <span className="text-[10px] font-black text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Auto-Applied
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="font-mono text-xl sm:text-2xl font-black text-blue-700 tracking-widest select-all">
                  {currentUser.referralCode}
                </span>
                <button
                  type="button"
                  id="btn-copy-referral-code"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Full Affiliate Link Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Full Shareable Affiliate Link
              </span>

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  id="input-affiliate-url"
                  type="text"
                  readOnly
                  value={affiliateUrl}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 font-mono select-all focus:outline-none focus:border-blue-600"
                />
                
                <button
                  type="button"
                  id="btn-copy-affiliate-link"
                  onClick={handleCopyLink}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. WhatsApp Direct Share Button */}
            <div>
              <button
                type="button"
                id="btn-share-whatsapp"
                onClick={handleShareWhatsApp}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </button>
            </div>

            {/* Commission Structure Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Your Commission on Referral Purchases
                </span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Your Package: {currentUser.packageName}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
                {[
                  { id: 'starter', name: 'Starter', price: 249 },
                  { id: 'basic', name: 'Basic', price: 599 },
                  { id: 'gold', name: 'Gold', price: 1012 },
                  { id: 'diamond', name: 'Diamond', price: 2299 },
                  { id: 'elite', name: 'Elite', price: 4299 },
                  { id: 'pro', name: 'Pro', price: 7299 },
                ].map(pkg => {
                  const comm = calculateAffiliateCommission(pkg.id, currentUser.packageId, pkg.price);
                  const isCurrent = pkg.id.toLowerCase() === currentUser.packageId.toLowerCase();
                  return (
                    <div 
                      key={pkg.id} 
                      className={`p-2.5 rounded-xl border flex justify-between items-center ${
                        isCurrent 
                          ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>₹{pkg.price} {pkg.name}</span>
                      <strong className={`font-black ${isCurrent ? 'text-blue-700' : 'text-emerald-600'}`}>
                        ₹{comm.commission}
                      </strong>
                    </div>
                  );
                })}
              </div>

              {/* Commission Rule Note */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="font-bold text-blue-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>FutureSet Direct Commission & Passive Income Rules:</span>
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><strong>Direct Commission:</strong> Agar referred user chhota package buy kare, to purchased package ki fixed commission milegi. Bada package buy karne par aapke package ({currentUser.packageName}) ki commission milegi.</li>
                  <li><strong>1-Level Passive Income:</strong> Jab aapka direct referred member aage kisi ko refer karta hai, to aapko 10% Passive Income (₹18 / ₹42 / ₹71 / ₹161 / ₹315 / ₹520) alag se milegi.</li>
                </ul>
              </div>
            </div>

            {/* How it Works Note */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Automatic Referral Guarantee</span>
              </div>
              <p>
                When anyone clicks your affiliate link and hits <strong>Buy Now</strong> on any package, your referral code (<strong className="text-blue-700">{currentUser.referralCode}</strong>) is automatically pre-filled in their registration form.
              </p>
            </div>

            {/* Simulator Button to test */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-test-referral-simulator"
                onClick={handleTestReferralLink}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Test Referral Journey (Simulate Opening Link as New User)</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
