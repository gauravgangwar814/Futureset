import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles, UserCheck, Lock, Mail, Phone, User as UserIcon, Tag, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const RegistrationView: React.FC = () => {
  const { 
    selectedPackage, 
    proceedToPayment, 
    setActiveView, 
    referralCodeParam,
    users
  } = useApp();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sponsor Verification State
  const [sponsorStatus, setSponsorStatus] = useState<{
    checking: boolean;
    verified: boolean;
    sponsorName?: string;
    sponsorPackage?: string;
    error?: string;
  }>({
    checking: false,
    verified: false
  });

  // Auto-fill referral code if available from URL query param
  useEffect(() => {
    if (referralCodeParam) {
      setReferralCode(referralCodeParam.trim().toUpperCase());
    }
  }, [referralCodeParam]);

  // Real-time verification of Referral Code
  useEffect(() => {
    const cleanCode = referralCode.trim().toUpperCase();
    if (!cleanCode) {
      setSponsorStatus({
        checking: false,
        verified: false,
        error: undefined
      });
      return;
    }

    setSponsorStatus(prev => ({ ...prev, checking: true, error: undefined }));

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/referral/verify?code=${encodeURIComponent(cleanCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setSponsorStatus({
              checking: false,
              verified: true,
              sponsorName: data.sponsorName,
              sponsorPackage: data.sponsorPackage
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Network error checking referral code, fallback to local users', err);
      }

      // Local fallback check
      const masterCodes = ['GAURAV', 'GAURAV814', 'FUTURESET', 'FSADMIN', 'FOUNDER', 'ADMIN', 'FS100'];
      if (masterCodes.includes(cleanCode)) {
        setSponsorStatus({
          checking: false,
          verified: true,
          sponsorName: 'Gaurav Gangwar (Founder & CEO, FutureSet)',
          sponsorPackage: 'Official Founder Sponsor'
        });
        return;
      }

      const localUser = users.find(u => u.referralCode && u.referralCode.trim().toUpperCase() === cleanCode);
      if (localUser) {
        setSponsorStatus({
          checking: false,
          verified: true,
          sponsorName: localUser.name,
          sponsorPackage: `${localUser.packageName} Package`
        });
      } else {
        setSponsorStatus({
          checking: false,
          verified: false,
          error: '❌ Invalid Referral Code! No active sponsor found with this code.'
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [referralCode, users]);

  if (!selectedPackage) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No package selected.</p>
          <button
            onClick={() => setActiveView('home')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const cleanReferral = referralCode.trim().toUpperCase();
    if (!cleanReferral) {
      setErrorMessage('❌ Referral Code is strictly mandatory! You cannot create an account without a valid Sponsor / Referral Code.');
      return;
    }

    if (!sponsorStatus.verified) {
      setErrorMessage(sponsorStatus.error || '❌ Please enter a valid and active Sponsor / Referral Code to create your ID.');
      return;
    }

    proceedToPayment({
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      password,
      referralCode: cleanReferral,
      packageId: selectedPackage.id
    });
  };

  return (
    <div id="registration-page" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Back Button */}
        <button
          id="btn-reg-back"
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 mb-6 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Packages</span>
        </button>

        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
          
          {/* Selected Package Visual Banner */}
          {selectedPackage.imageUrl && (
            <div className="relative w-full h-28 overflow-hidden bg-slate-100">
              <img
                src={selectedPackage.imageUrl}
                alt={`${selectedPackage.name} Package`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between z-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                    Selected Package
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    {selectedPackage.name} Package
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/95 border border-blue-200 text-right backdrop-blur-md shadow-sm">
                  <span className="text-xs font-black text-blue-700">
                    ₹{selectedPackage.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
                  Step 1 of 2 • Registration
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Create Learner Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in your details & Sponsor code to create your official FutureSet ID
                </p>
              </div>
            </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form containing: Name, WhatsApp No., Gmail, Password, Referral Code (Mandatory) */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 2. WhatsApp No. */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp No. <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-whatsapp"
                  type="tel"
                  required
                  placeholder="10-digit WhatsApp number (e.g. 8279641186)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Official ID notifications will be sent to this WhatsApp number.</p>
            </div>

            {/* 3. Gmail */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gmail / Email ID <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-email"
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create your login password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
                <button
                  type="button"
                  id="btn-toggle-reg-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 5. Referral Code (STRICTLY MANDATORY) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Referral / Sponsor Code <span className="text-blue-600">* (Mandatory)</span>
                </label>
                {sponsorStatus.verified && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Sponsor Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-referral-code"
                  type="text"
                  required
                  placeholder="Enter Sponsor Referral Code (e.g. FS... or GAURAV)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm uppercase tracking-wider transition-all focus:outline-none ${
                    sponsorStatus.verified
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : sponsorStatus.error
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {sponsorStatus.checking && (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                  {!sponsorStatus.checking && sponsorStatus.verified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {!sponsorStatus.checking && sponsorStatus.error && (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              </div>

              {/* Sponsor Verification Details Badge */}
              {sponsorStatus.verified && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-600">Sponsor: </span>
                    <strong className="text-emerald-700 font-bold">{sponsorStatus.sponsorName}</strong>
                    {sponsorStatus.sponsorPackage && (
                      <span className="text-slate-500 text-[11px]"> ({sponsorStatus.sponsorPackage})</span>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message for Invalid Referral Code */}
              {!sponsorStatus.checking && sponsorStatus.error && (
                <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{sponsorStatus.error}</span>
                </p>
              )}

              {!sponsorStatus.verified && !sponsorStatus.error && (
                <p className="text-[10px] text-slate-500 mt-1">
                  * Account creation requires a valid referral code from your sponsor or platform.
                </p>
              )}
            </div>

            {/* Pay & Activate Button */}
            <div className="pt-4">
              <button
                id="btn-pay-and-activate"
                type="submit"
                disabled={sponsorStatus.checking || (referralCode.trim() !== '' && !sponsorStatus.verified)}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                <span>Pay & Activate</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-3 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next step: UPI payment verification & QR code</span>
              </div>
            </div>

          </form>

          </div>
        </div>
      </div>
    </div>
  );
};

