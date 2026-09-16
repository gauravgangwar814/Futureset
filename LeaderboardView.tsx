import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CountUp } from './CountUp';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  TrendingUp, 
  Calendar, 
  CalendarDays, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Zap, 
  Flame,
  Star,
  Link2,
  Check
} from 'lucide-react';

export type LeaderboardTimeframe = 'today' | '7days' | '30days';

interface LeaderboardEarner {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string;
  packageName: string;
  packagePrice?: number;
  referralCode?: string;
  isCurrentUser?: boolean;
  todayEarnings: number;
  sevenDaysEarnings: number;
  thirtyDaysEarnings: number;
}

// Benchmark Top Earners of FutureSet community (seamlessly combined with live registered users)
const BENCHMARK_EARNERS: LeaderboardEarner[] = [
  {
    id: 'lead_1',
    name: 'Aarav Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    packageName: 'Pro',
    todayEarnings: 15600,
    sevenDaysEarnings: 46800,
    thirtyDaysEarnings: 145600
  },
  {
    id: 'lead_2',
    name: 'Rahul Verma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    packageName: 'Pro',
    todayEarnings: 10400,
    sevenDaysEarnings: 38400,
    thirtyDaysEarnings: 119600
  },
  {
    id: 'lead_3',
    name: 'Priya Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    packageName: 'Elite',
    todayEarnings: 9450,
    sevenDaysEarnings: 31500,
    thirtyDaysEarnings: 97650
  },
  {
    id: 'lead_4',
    name: 'Vikash Choudhary',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    packageName: 'Elite',
    todayEarnings: 6300,
    sevenDaysEarnings: 25200,
    thirtyDaysEarnings: 81900
  },
  {
    id: 'lead_5',
    name: 'Sneha Rajput',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    packageName: 'Diamond',
    todayEarnings: 4830,
    sevenDaysEarnings: 19320,
    thirtyDaysEarnings: 64400
  },
  {
    id: 'lead_6',
    name: 'Rohit Mehra',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
    packageName: 'Diamond',
    todayEarnings: 3220,
    sevenDaysEarnings: 16100,
    thirtyDaysEarnings: 51520
  },
  {
    id: 'lead_7',
    name: 'Ananya Roy',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    packageName: 'Gold',
    todayEarnings: 2840,
    sevenDaysEarnings: 12780,
    thirtyDaysEarnings: 42600
  },
  {
    id: 'lead_8',
    name: 'Amit Yadav',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    packageName: 'Gold',
    todayEarnings: 2130,
    sevenDaysEarnings: 9940,
    thirtyDaysEarnings: 35500
  },
  {
    id: 'lead_9',
    name: 'Neha Gupta',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
    packageName: 'Basic',
    todayEarnings: 1680,
    sevenDaysEarnings: 7560,
    thirtyDaysEarnings: 26880
  },
  {
    id: 'lead_10',
    name: 'Devendra Singh',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    packageName: 'Basic',
    todayEarnings: 1260,
    sevenDaysEarnings: 5880,
    thirtyDaysEarnings: 21420
  }
];

export const LeaderboardView: React.FC = () => {
  const { currentUser, users, setActiveView } = useApp();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('today');
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute unified earners list (real users + benchmark earners merged without duplicates)
  const unifiedRankings = useMemo(() => {
    // 1. Convert real registered active users into LeaderboardEarner objects
    const liveUsers: LeaderboardEarner[] = users
      .filter(u => u.status === 'active')
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        packageName: u.packageName || 'Starter',
        packagePrice: u.packagePrice,
        referralCode: u.referralCode,
        isCurrentUser: currentUser ? u.id === currentUser.id : false,
        todayEarnings: u.earnings?.today || 0,
        sevenDaysEarnings: u.earnings?.last7Days || 0,
        thirtyDaysEarnings: u.earnings?.last30Days || 0
      }));

    // 2. Filter benchmark earners to not duplicate if user with same name/id exists
    const liveUserNames = new Set(liveUsers.map(u => u.name.toLowerCase().trim()));
    const remainingBenchmarks = BENCHMARK_EARNERS.filter(
      b => !liveUserNames.has(b.name.toLowerCase().trim())
    );

    const allEarners = [...liveUsers, ...remainingBenchmarks];

    // 3. Sort according to selected timeframe earnings descending
    const sorted = allEarners.sort((a, b) => {
      let amountA = 0;
      let amountB = 0;
      if (timeframe === 'today') {
        amountA = a.todayEarnings;
        amountB = b.todayEarnings;
      } else if (timeframe === '7days') {
        amountA = a.sevenDaysEarnings;
        amountB = b.sevenDaysEarnings;
      } else {
        amountA = a.thirtyDaysEarnings;
        amountB = b.thirtyDaysEarnings;
      }
      return amountB - amountA;
    });

    // 4. Return Top 10
    return sorted.slice(0, 10);
  }, [users, currentUser, timeframe]);

  // Find current user's position in full ranking
  const currentUserRankInfo = useMemo(() => {
    if (!currentUser) return null;

    const rankIndex = unifiedRankings.findIndex(
      e => e.id === currentUser.id || (e.email && e.email.toLowerCase() === currentUser.email.toLowerCase())
    );

    let currentAmount = 0;
    if (timeframe === 'today') currentAmount = currentUser.earnings?.today || 0;
    else if (timeframe === '7days') currentAmount = currentUser.earnings?.last7Days || 0;
    else currentAmount = currentUser.earnings?.last30Days || 0;

    return {
      rank: rankIndex !== -1 ? rankIndex + 1 : null,
      amount: currentAmount,
      isTop10: rankIndex !== -1 && rankIndex < 10
    };
  }, [currentUser, unifiedRankings, timeframe]);

  const copyAffiliateLink = () => {
    if (!currentUser) return;
    const refCode = currentUser.referralCode;
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?ref=${encodeURIComponent(refCode)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getAmountForTimeframe = (earner: LeaderboardEarner) => {
    if (timeframe === 'today') return earner.todayEarnings;
    if (timeframe === '7days') return earner.sevenDaysEarnings;
    return earner.thirtyDaysEarnings;
  };

  const rank1 = unifiedRankings[0];
  const rank2 = unifiedRankings[1];
  const rank3 = unifiedRankings[2];
  const rank4To10 = unifiedRankings.slice(3, 10);

  return (
    <div id="leaderboard-view-screen" className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Top Header & Back Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            id="btn-leaderboard-back"
            onClick={() => currentUser ? setActiveView('profile_initial') : setActiveView('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Official Top 10 Rankings</span>
          </div>
        </div>

        {/* Title Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
                <Trophy className="w-3.5 h-3.5" />
                <span>FutureSet Wall of Fame</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Top 10 <span className="text-blue-600">Affiliate Earners</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Recognizing our highest earning affiliate champions across Today, 7-Day, and 30-Day performance windows.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left shrink-0 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Top 10 Pool</span>
                <span className="text-lg font-black text-blue-700">
                  ₹{unifiedRankings.reduce((sum, u) => sum + getAmountForTimeframe(u), 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">Verified Direct Payouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Primary Timeframe Tabs: TODAY, 7 DAYS, 30 DAYS */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md max-w-md mx-auto">
          
          <button
            id="tab-leaderboard-today"
            onClick={() => setTimeframe('today')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
              timeframe === 'today'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-100'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Today</span>
          </button>

          <button
            id="tab-leaderboard-7days"
            onClick={() => setTimeframe('7days')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
              timeframe === '7days'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-100'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>7 Days</span>
          </button>

          <button
            id="tab-leaderboard-30days"
            onClick={() => setTimeframe('30days')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
              timeframe === '30days'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-100'
                : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>30 Days</span>
          </button>

        </div>

        {/* TOP 3 PODIUM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-6">
          
          {/* RANK 2 (Silver - Left on Desktop) */}
          {rank2 && (
            <div 
              id="podium-rank-2"
              className={`order-2 md:order-1 rounded-3xl bg-white border border-slate-200 p-6 text-center relative shadow-md transition-all hover:border-slate-300 ${
                rank2.isCurrentUser ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Badge #2 */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                <Medal className="w-3.5 h-3.5 text-slate-700" />
                <span>Rank #2</span>
              </div>

              <div className="mt-2">
                <div className="relative inline-block mx-auto mb-3">
                  <img 
                    src={rank2.avatarUrl} 
                    alt={rank2.name} 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-md" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-slate-200 text-slate-900 flex items-center justify-center font-black text-xs shadow-sm">
                    2
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 truncate px-2 flex items-center justify-center gap-1.5">
                  <span>{rank2.name}</span>
                  {rank2.isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[9px] font-black text-blue-700">YOU</span>
                  )}
                </h3>

                <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                  {rank2.packageName} Package
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    {timeframe === 'today' ? "Today's Earnings" : timeframe === '7days' ? '7-Day Earnings' : '30-Day Earnings'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₹<CountUp end={getAmountForTimeframe(rank2)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RANK 1 (Gold - Center & Tallest on Desktop) */}
          {rank1 && (
            <div 
              id="podium-rank-1"
              className={`order-1 md:order-2 rounded-3xl bg-white border-2 border-blue-500 p-6 sm:p-7 text-center relative shadow-xl shadow-blue-500/10 md:-translate-y-4 transition-all ${
                rank1.isCurrentUser ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {/* Crown & Badge #1 */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-blue-500/30">
                <Crown className="w-4 h-4 text-white" />
                <span>Champion #1</span>
              </div>

              <div className="mt-2">
                <div className="relative inline-block mx-auto mb-3">
                  <img 
                    src={rank1.avatarUrl} 
                    alt={rank1.name} 
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-500 shadow-md" 
                  />
                  <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    👑
                  </div>
                </div>

                <h3 className="font-black text-lg text-slate-900 truncate px-2 flex items-center justify-center gap-1.5">
                  <span>{rank1.name}</span>
                  {rank1.isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[9px] font-black text-blue-700">YOU</span>
                  )}
                </h3>

                <span className="inline-block px-3 py-0.5 mt-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase">
                  {rank1.packageName} Package
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase text-blue-600 block">
                    {timeframe === 'today' ? "Today's Top Earner" : timeframe === '7days' ? '7-Day Top Earner' : '30-Day Top Earner'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-0.5">
                    ₹<CountUp end={getAmountForTimeframe(rank1)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RANK 3 (Bronze - Right on Desktop) */}
          {rank3 && (
            <div 
              id="podium-rank-3"
              className={`order-3 md:order-3 rounded-3xl bg-white border border-slate-200 p-6 text-center relative shadow-md transition-all hover:border-slate-300 ${
                rank3.isCurrentUser ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Badge #3 */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-700" />
                <span>Rank #3</span>
              </div>

              <div className="mt-2">
                <div className="relative inline-block mx-auto mb-3">
                  <img 
                    src={rank3.avatarUrl} 
                    alt={rank3.name} 
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-600/50 shadow-md" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                    3
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 truncate px-2 flex items-center justify-center gap-1.5">
                  <span>{rank3.name}</span>
                  {rank3.isCurrentUser && (
                    <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[9px] font-black text-blue-700">YOU</span>
                  )}
                </h3>

                <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                  {rank3.packageName} Package
                </span>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    {timeframe === 'today' ? "Today's Earnings" : timeframe === '7days' ? '7-Day Earnings' : '30-Day Earnings'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    ₹<CountUp end={getAmountForTimeframe(rank3)} />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RANK 4 TO 10 LIST */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-xl space-y-3">
          
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-200">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Rankings #4 to #10</span>
            </h2>
            <span className="text-xs text-slate-500">
              Showing Top 10 Earners
            </span>
          </div>

          <div className="space-y-2">
            {rank4To10.map((earner, idx) => {
              const currentRank = idx + 4;
              const amount = getAmountForTimeframe(earner);
              const isMe = earner.isCurrentUser;

              return (
                <div
                  key={earner.id}
                  id={`leaderboard-row-${currentRank}`}
                  className={`flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl transition-all ${
                    isMe
                      ? 'bg-blue-50/70 border border-blue-400 shadow-sm'
                      : 'bg-slate-50/70 border border-slate-200 hover:border-blue-300 hover:bg-white'
                  }`}
                >
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    
                    {/* Rank Badge */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-sm">
                      #{currentRank}
                    </div>

                    {/* Avatar */}
                    <img
                      src={earner.avatarUrl}
                      alt={earner.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    {/* Name & Package */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate block">
                          {earner.name}
                        </span>
                        {isMe && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[9px] font-black text-blue-700 shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold uppercase block">
                        {earner.packageName} Package
                      </span>
                    </div>

                  </div>

                  {/* Right: Earning Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {timeframe === 'today' ? 'Today' : timeframe === '7days' ? '7 Days' : '30 Days'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-blue-700">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* CURRENT USER STATUS BANNER (If Logged In) */}
        {currentUser && (
          <div className="rounded-3xl bg-white border border-blue-200 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
              />
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase block">Your Affiliate Standing</span>
                <h4 className="text-base font-black text-slate-900">{currentUser.name}</h4>
                <p className="text-xs text-slate-500">
                  {currentUserRankInfo?.rank 
                    ? `Current Rank #${currentUserRankInfo.rank} in ${timeframe === 'today' ? 'Today' : timeframe === '7days' ? '7-Day' : '30-Day'} Leaderboard`
                    : `Make sales to enter Top 10 rankings!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-leaderboard-share-link"
                onClick={copyAffiliateLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>

              <button
                id="btn-leaderboard-open-dashboard"
                onClick={() => setActiveView('affiliate_dashboard')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all active:scale-95 whitespace-nowrap"
              >
                <span>My Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
