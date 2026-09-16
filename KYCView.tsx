import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Building, 
  Hash, 
  CreditCard, 
  User as UserIcon, 
  Check, 
  ArrowLeft, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';

export const KYCView: React.FC = () => {
  const { currentUser, updateKYC, setActiveView } = useApp();

  const [name, setName] = useState(currentUser?.kyc?.name || currentUser?.name || '');
  const [bankName, setBankName] = useState(currentUser?.kyc?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(currentUser?.kyc?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentUser?.kyc?.ifscCode || '');
  const [upiId, setUpiId] = useState(currentUser?.kyc?.isCompleted ? (currentUser?.kyc?.upiId || '') : '');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full">
          <p className="text-slate-500 mb-4 font-semibold text-sm">Please log in to complete your KYC.</p>
          <button
            onClick={() => setActiveView('login')}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name as per bank account.');
      return;
    }
    if (!bankName.trim()) {
      setErrorMessage('Please enter your bank name.');
      return;
    }
    if (!accountNumber.trim() || accountNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid bank account number.');
      return;
    }
    if (!ifscCode.trim() || ifscCode.trim().length < 6) {
      setErrorMessage('Please enter a valid IFSC code (e.g. HDFC0001234).');
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMessage('Please enter a valid UPI ID (e.g. yourname@upi).');
      return;
    }

    updateKYC(name, bankName, accountNumber, ifscCode, upiId);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="complete-kyc-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          id="btn-kyc-back"
          onClick={() => setActiveView('profile_initial')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xl">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Complete KYC Verification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit your bank and payout details to enable instant commission withdrawals.
            </p>
          </div>

          {/* Status Badge */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">KYC Status</span>
                <span className="text-[11px] text-slate-500">
                  {currentUser.kyc.isCompleted ? 'Details Saved & Verified' : 'Action Required'}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${
              currentUser.kyc.isCompleted 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {currentUser.kyc.isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>

          {isSaved && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>KYC details saved successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* KYC Form containing EXACTLY: Name, Bank Name, IFSC Code, UPI ID + Save button */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* 1. Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Holder Name <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="kyc-input-name"
                  type="text"
                  required
                  placeholder="Enter full name as per bank records"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Bank Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Name <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="kyc-input-bank-name"
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank, SBI, ICICI, Axis"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Account Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Number <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="kyc-input-account-number"
                  type="text"
                  required
                  placeholder="Enter your bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 4. IFSC Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                IFSC Code <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="kyc-input-ifsc-code"
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm uppercase tracking-wider transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 4. UPI ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                UPI ID <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="kyc-input-upi-id"
                  type="text"
                  required
                  placeholder="e.g. yourname@okhdfcbank or 8279641186@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Below the form add a Save button */}
            <div className="pt-4">
              <button
                id="btn-save-kyc"
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save KYC Details</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
