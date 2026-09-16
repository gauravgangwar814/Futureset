import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound, 
  Check, 
  X, 
  PhoneCall, 
  Eye, 
  EyeOff, 
  Send, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, sendPasswordResetOtp, resetPassword, setActiveView } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Login failed. Please check your network connection.');
    }
  };

  // Step 1: Send OTP to Gmail
  const handleSendOtp = async () => {
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered Gmail address first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPasswordResetOtp(forgotEmail);
      setIsSendingOtp(false);

      if (res.success) {
        setIsOtpSent(true);
        setMaskedEmail(res.maskedEmail || forgotEmail);
        setResendCooldown(60);
        setInputOtp(''); // Keep OTP input field blank for user to fill
        setForgotSuccess(res.message || `OTP has been sent to your Gmail inbox (${res.maskedEmail || forgotEmail}). Please check your inbox.`);
      } else {
        setForgotError(res.message || 'Failed to send OTP to Gmail.');
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setForgotError('An error occurred while sending OTP. Please try again.');
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered Gmail address.');
      return;
    }

    if (!isOtpSent) {
      setForgotError('Please click "Send OTP" first to receive verification code on your Gmail.');
      return;
    }

    if (!inputOtp.trim()) {
      setForgotError('Please enter the 6-digit OTP sent to your Gmail.');
      return;
    }

    if (inputOtp.trim().length !== 6) {
      setForgotError('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(forgotEmail, inputOtp.trim(), newPassword);
    setIsResetting(false);

    if (res.success) {
      setForgotSuccess(res.message || '✅ OTP verified successfully! Your password has been updated.');
      setEmail(forgotEmail.trim().toLowerCase());
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess('');
        setInputOtp('');
        setIsOtpSent(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 1800);
    } else {
      setForgotError(res.message || '❌ Invalid OTP! The code you entered does not match.');
    }
  };

  return (
    <div id="login-page" className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden">
      {/* Background Blue Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Back Button */}
        <button
          id="btn-login-back"
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 mb-6 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
              <LogIn className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">FutureSet Member Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Access your courses, affiliate earnings, and profile
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            
            {/* Gmail / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Gmail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-input-email"
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                />
                <button
                  type="button"
                  id="btn-toggle-login-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password ke niche chota sa forgot password option */}
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => {
                    setForgotEmail(email || '');
                    setForgotError('');
                    setForgotSuccess('');
                    setInputOtp('');
                    setIsOtpSent(false);
                    setShowForgotModal(true);
                  }}
                  className="text-[12px] text-blue-600 hover:text-blue-800 transition-colors font-bold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Logging in...</span>
                ) : (
                  <>
                    <span>Log In to Account</span>
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* New User Redirect */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have a FutureSet account yet? </span>
            <button
              onClick={() => {
                setActiveView('home');
                setTimeout(() => {
                  const el = document.getElementById('packages-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Enroll in a Package
            </button>
          </div>

        </div>
      </div>

      {/* Forgot Password with Gmail OTP Verification Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md my-8 rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative text-slate-900">
            
            {/* Close button */}
            <button
              id="btn-close-forgot-modal"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-5 border-b border-slate-100">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Reset Password with Gmail OTP</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered Gmail to receive a 6-digit OTP verification code
              </p>
            </div>

            {forgotSuccess && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{forgotError}</div>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
              
              {/* Step 1: Registered Gmail & Send OTP Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Registered Gmail <span className="text-blue-600">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="forgot-input-email"
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    id="btn-send-gmail-otp"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || resendCooldown > 0}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shrink-0 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <span>Resend ({resendCooldown}s)</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{isOtpSent ? 'Resend OTP' : 'Send OTP'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2: Blank OTP Input Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Enter 6-Digit OTP <span className="text-blue-600">*</span>
                  </label>
                  {isOtpSent && (
                    <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      OTP Required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-input-otp"
                    type="text"
                    maxLength={6}
                    required
                    placeholder={isOtpSent ? "Type 6-digit OTP here (e.g. 123456)" : "First click 'Send OTP' above"}
                    value={inputOtp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setInputOtp(val);
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm font-mono tracking-wider transition-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 3: New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. New Password <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-input-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min 4 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                  />
                  <button
                    type="button"
                    id="btn-toggle-forgot-new-password"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 4: Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Confirm New Password <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-input-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 text-slate-900 placeholder-slate-400 text-sm transition-all focus:outline-none"
                  />
                  <button
                    type="button"
                    id="btn-toggle-forgot-confirm-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-reset-password"
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isResetting ? (
                    <span>Verifying OTP & Updating...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify OTP & Set New Password</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Support Help */}
              <div className="pt-2 text-center">
                <a
                  href="https://wa.me/918279641186?text=Hi%20Gaurav%20sir,%20I%20need%20help%20recovering%20my%20FutureSet%20account%20password."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Need help? Contact Admin on WhatsApp (8279641186)</span>
                </a>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

