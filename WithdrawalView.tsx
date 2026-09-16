import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowDownToLine, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Building, 
  Sparkles,
  CreditCard,
  LogOut
} from 'lucide-react';

export const WithdrawalView: React.FC = () => {
  const { 
    currentUser, 
    withdrawalRequests, 
    requestWithdrawal, 
    setActiveView,
    logout
  } = useApp();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full">
          <p className="text-slate-500 mb-4 font-semibold text-sm">Please log in to make a withdrawal request.</p>
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

  // Filter requests connected to this logged-in user
  const userWithdrawals = withdrawalRequests.filter(
    w => w.userId === currentUser.id || (w.userEmail && currentUser.email && w.userEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const totalLifetimeEarnings = Number(currentUser.earnings?.allTime) || 0;
  const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const withdrawableAmount = Math.max(0, totalLifetimeEarnings - totalWithdrawn);

  const [withdrawInput, setWithdrawInput] = useState<string>('');

  const handleWithdrawClick = () => {
    setNotification(null);
    if (!currentUser.kyc.isCompleted) {
      setNotification({
        type: 'error',
        message: 'Your KYC is incomplete. Please complete your KYC with Bank/UPI details first before requesting withdrawal.'
      });
      return;
    }

    if (withdrawableAmount <= 0) {
      setNotification({
        type: 'error',
        message: 'You have ₹0 withdrawable balance remaining. You have already requested withdrawal for all your earnings.'
      });
      return;
    }

    const enteredAmount = withdrawInput.trim() ? Number(withdrawInput) : withdrawableAmount;

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid withdrawal amount.'
      });
      return;
    }

    if (enteredAmount > withdrawableAmount) {
      setNotification({
        type: 'error',
        message: `Entered amount (₹${enteredAmount.toLocaleString('en-IN')}) exceeds your available withdrawable balance of ₹${withdrawableAmount.toLocaleString('en-IN')}.`
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = requestWithdrawal(enteredAmount);
      setIsSubmitting(false);
      setWithdrawInput('');
      setNotification({
        type: res.success ? 'success' : 'error',
        message: res.message
      });
    }, 500);
  };

  return (
    <div id="withdrawal-request-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button
          id="btn-withdrawal-back"
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
              <ArrowDownToLine className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Withdrawal Request
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit your withdrawal request to transfer affiliate commissions directly to your bank account or UPI ID.
            </p>
          </div>

          {/* Withdrawable Balance Card */}
          <div className="mt-6 p-6 rounded-2xl bg-blue-50/50 border border-blue-100 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Available Withdrawable Balance
            </span>
            <div className="text-3xl sm:text-4xl font-black text-blue-700 mt-1">
              ₹{withdrawableAmount.toLocaleString('en-IN')}
            </div>
            
            {totalWithdrawn > 0 ? (
              <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-[11px] bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
                <span>Lifetime Earnings: <strong className="text-slate-900">₹{totalLifetimeEarnings.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Withdrawn / Requested: <strong className="text-blue-600">₹{totalWithdrawn.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span>Remaining: <strong className="text-emerald-600">₹{withdrawableAmount.toLocaleString('en-IN')}</strong></span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Connected to Account: <strong className="text-slate-800">{currentUser.name}</strong>
              </p>
            )}
          </div>

          {/* Amount Selection Input */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="withdrawal-amount-input" className="text-xs font-bold text-slate-700">
                Withdrawal Amount (₹)
              </label>
              {withdrawableAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setWithdrawInput(withdrawableAmount.toString())}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Withdraw All (₹{withdrawableAmount.toLocaleString('en-IN')})
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                id="withdrawal-amount-input"
                type="number"
                min="1"
                max={withdrawableAmount}
                value={withdrawInput}
                onChange={(e) => setWithdrawInput(e.target.value)}
                placeholder={withdrawableAmount > 0 ? `Enter amount or leave blank to withdraw full ₹${withdrawableAmount.toLocaleString('en-IN')}` : 'No withdrawable balance remaining'}
                disabled={withdrawableAmount <= 0 || isSubmitting}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:opacity-60"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Withdrawal krne ke bad aapke bache huye paise hi yahan show honge.
            </p>
          </div>

          {/* KYC Status & Destination */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Payout Destination</span>
              {currentUser.kyc.isCompleted ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified KYC
                </span>
              ) : (
                <button
                  onClick={() => setActiveView('kyc')}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  Complete KYC Now →
                </button>
              )}
            </div>

            {currentUser.kyc.isCompleted ? (
              <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>Bank: <strong className="text-slate-900">{currentUser.kyc.bankName}</strong></div>
                {currentUser.kyc.accountNumber && (
                  <div>A/C No: <strong className="text-slate-900 font-mono">{currentUser.kyc.accountNumber}</strong></div>
                )}
                <div>IFSC: <strong className="text-slate-900 font-mono">{currentUser.kyc.ifscCode}</strong></div>
                <div>UPI ID: <strong className="text-blue-700 font-mono">{currentUser.kyc.upiId}</strong></div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5 pt-1">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Please configure your KYC details first to enable withdrawals.</span>
              </div>
            )}
          </div>

          {notification && (
            <div className={`mt-4 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                : 'bg-rose-50 border border-rose-200 text-rose-600'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>{notification.message}</div>
            </div>
          )}

          {/* The Mandated Withdrawal Request Button */}
          <div className="pt-6">
            <button
              id="btn-submit-withdrawal-request"
              type="button"
              disabled={isSubmitting || withdrawableAmount <= 0}
              onClick={handleWithdrawClick}
              className={`w-full py-4 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                withdrawableAmount <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20'
              } disabled:opacity-60`}
            >
              {isSubmitting ? (
                <span>Processing Request...</span>
              ) : withdrawableAmount <= 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                  <span>₹0 Withdrawable Balance Remaining</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-5 h-5" />
                  <span>
                    Submit Withdrawal Request {withdrawInput.trim() && Number(withdrawInput) > 0 ? `(₹${Number(withdrawInput).toLocaleString('en-IN')})` : `(₹${withdrawableAmount.toLocaleString('en-IN')})`}
                  </span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Withdrawal requests are processed within 24 hours via IMPS / UPI.
            </p>
          </div>

          {/* History of Withdrawal Requests for this user */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Your Withdrawal History ({userWithdrawals.length})
            </h3>

            {userWithdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No past withdrawal requests.</p>
            ) : (
              <div className="space-y-2">
                {userWithdrawals.map(wdr => (
                  <div key={wdr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">₹{wdr.amount.toLocaleString('en-IN')}</span>
                      <span className="text-slate-500 block text-[10px]">
                        {new Date(wdr.requestedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} • {wdr.upiId}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                      wdr.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {wdr.status === 'approved' ? 'Successful' : 'Under Processing'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Option to Log Out beneath Withdrawal Request */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 block">Finished with your session?</span>
              <span className="text-[11px] text-slate-500">Securely sign out of your FutureSet account</span>
            </div>
            
            <button
              id="btn-withdrawal-logout"
              type="button"
              onClick={() => logout()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of FutureSet</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
