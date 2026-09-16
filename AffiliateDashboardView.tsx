import React from 'react';
import { useApp } from '../context/AppContext';
import { CountUp } from './CountUp';
import { 
  TrendingUp, 
  Calendar, 
  CalendarDays, 
  Clock, 
  Award, 
  ArrowLeft, 
  ArrowUpRight, 
  Wallet, 
  Sparkles,
  Users,
  Layers
} from 'lucide-react';

export const AffiliateDashboardView: React.FC = () => {
  const { currentUser, currentUserTransactions, setActiveView } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please log in to view your affiliate dashboard.</p>
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

  return (
    <div id="affiliate-dashboard-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            id="btn-affiliate-back"
            onClick={() => setActiveView('profile_initial')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Affiliate Account Live
          </span>
        </div>

        {/* User Profile Header */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            
            {/* User's profile DP */}
            <div className="shrink-0">
              <img
                id="affiliate-user-dp"
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-blue-600 shadow-xl shadow-blue-500/20"
              />
            </div>

            {/* User's name & Package name & Affiliate ID */}
            <div className="flex-1 overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Enrolled via {currentUser.packageName} Package</span>
              </div>

              <h1 id="affiliate-user-name" className="text-2xl sm:text-4xl font-black text-slate-900">
                {currentUser.name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-500">
                <span>Affiliate ID: <strong className="text-blue-700 font-mono text-sm font-bold">{currentUser.referralCode}</strong></span>
              </div>
            </div>

          </div>
        </div>

        {/* EARNING CARDS:
            Direct Earnings (Cards 1 to 4) + Passive Income (Card 5)
            Strictly kept separate with no combining of amounts. */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Earnings Overview</span>
            </h2>
            <span className="text-xs text-slate-500">Direct Commission & Passive Income</span>
          </div>

          {/* 4 Direct Earning Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Today Earning */}
            <div 
              id="card-today-earning" 
              className="rounded-3xl bg-white border border-slate-200 hover:border-emerald-400 p-6 shadow-md relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Today Earning
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                <CountUp end={currentUser.earnings.today} prefix="₹" />
              </div>
              
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Direct daily commissions</span>
              </div>
            </div>

            {/* Card 2: 7 Days Earning */}
            <div 
              id="card-7days-earning" 
              className="rounded-3xl bg-white border border-slate-200 hover:border-blue-400 p-6 shadow-md relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  7 Days Earning
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                <CountUp end={currentUser.earnings.last7Days} prefix="₹" />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Last 7 rolling days</span>
              </div>
            </div>

            {/* Card 3: 30 Days Earning */}
            <div 
              id="card-30days-earning" 
              className="rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 p-6 shadow-md relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  30 Days Earning
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                <CountUp end={currentUser.earnings.last30Days} prefix="₹" />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Monthly revenue cycle</span>
              </div>
            </div>

            {/* Card 4: All Time Earning */}
            <div 
              id="card-alltime-earning" 
              className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 border border-blue-400 p-6 shadow-lg shadow-blue-500/20 relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 text-white"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-blue-100">
                  All Time Earning
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-white">
                <CountUp end={currentUser.earnings.allTime} prefix="₹" />
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-100 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Total direct commissions</span>
              </div>
            </div>

          </div>

          {/* 5th Card: Passive Income */}
          <div 
            id="card-passive-income" 
            className="mt-5 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-400 p-6 sm:p-7 shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm font-bold">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                      Passive Income
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      1-Level Team Bonus
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                    <CountUp end={currentUser.earnings.passiveIncome || 0} prefix="₹" />
                  </div>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-black bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>10% Auto Passive Credit</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
                  Earned automatically when members you directly referred make a referral sale. Stored permanently and separate from direct earnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral & Passive Commission History */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Commission & Passive Income History</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time record of all direct commissions and 1-level passive earnings ({currentUser.referralCode})
              </p>
            </div>
            <button
              onClick={() => setActiveView('affiliate_link')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Share Link →
            </button>
          </div>

          {currentUserTransactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>No commissions recorded yet. Share your affiliate link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentUserTransactions.map((tx) => {
                const isPassive = tx.type === 'passive';
                return (
                  <div 
                    key={tx.id}
                    className={`p-4 rounded-2xl bg-slate-50 border ${
                      isPassive ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200'
                    } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl ${
                        isPassive 
                          ? 'bg-blue-100 border border-blue-200 text-blue-700' 
                          : 'bg-emerald-100 border border-emerald-200 text-emerald-700'
                      } flex items-center justify-center shrink-0 font-bold text-sm`}>
                        {isPassive ? <Users className="w-4 h-4" /> : '+₹'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {isPassive 
                              ? `Passive from ${tx.directReferrerName || 'Direct Member'}`
                              : (tx.fromUserName || 'Referred Student')}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                            isPassive 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-slate-200 text-slate-800 border border-slate-300'
                          }`}>
                            {isPassive ? '1-Level Passive' : `${tx.packageName} Package`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {tx.note || (isPassive 
                            ? `Passive income from ${tx.fromUserName || 'Student'}'s enrollment in ${tx.packageName}`
                            : `Direct commission for ${tx.packageName} enrollment`)}
                          {' • '}
                          {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className={`text-base sm:text-lg font-black ${
                        isPassive ? 'text-blue-700' : 'text-emerald-600'
                      }`}>
                        +₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {isPassive ? 'Passive Income' : 'Direct Commission'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
