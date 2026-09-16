import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PACKAGES } from '../data/packages';
import { Package } from '../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Users, 
  Zap, 
  Award, 
  Play, 
  Star,
  Check,
  Quote,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import defaultFounderPhoto from '../assets/images/founder-ceo.jpg';

export const HomeView: React.FC = () => {
  const { startBuyNow, setActiveView } = useApp();
  const [isPhotoLoaded, setIsPhotoLoaded] = useState(true);
  const [founderPhotoSrc, setFounderPhotoSrc] = useState<string>(() => {
    return '/api/founder-photo';
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live founder photo from server API so all visitors see the real photo
    fetch('/api/founder-photo-json', { cache: 'no-cache' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.photo && isMounted) {
          setFounderPhotoSrc(data.photo);
        } else if (isMounted) {
          setFounderPhotoSrc(`/api/founder-photo?t=${Date.now()}`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFounderPhotoSrc(`/api/founder-photo?t=${Date.now()}`);
        }
      });

    // 2. Listen for real-time updates
    const handlePhotoUpdated = (e: any) => {
      if (e?.detail && isMounted) {
        setFounderPhotoSrc(e.detail);
      }
    };
    window.addEventListener('founder-photo-updated', handlePhotoUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('founder-photo-updated', handlePhotoUpdated);
    };
  }, []);

  const handlePackageClick = (pkg: Package) => {
    startBuyNow(pkg);
  };

  return (
    <div id="home-view-container" className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-semibold text-blue-700">
              India's Premier High-Income Skill & Affiliate Platform
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Master High-Income Skills with{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
              FutureSet
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Gain verified skills in digital marketing, viral content creation, meta ads, and sales automation. Unlock curated video masterclasses and build your affiliate earnings today.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-btn-get-started"
              onClick={() => {
                const el = document.getElementById('packages-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              id="hero-btn-explore-packages"
              onClick={() => {
                const el = document.getElementById('packages-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50 font-bold text-base transition-all shadow-sm"
            >
              <span>Explore Packages</span>
            </button>
          </div>

          {/* Quick Stat Pill Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">10,000+</div>
              <div className="text-xs text-slate-500 mt-1">Active Students</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">6 Packages</div>
              <div className="text-xs text-slate-500 mt-1">Skill Packages</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">₹1 Cr+</div>
              <div className="text-xs text-slate-500 mt-1">Affiliate Payouts</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">4.9/5</div>
              <div className="text-xs text-slate-500 mt-1">Community Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages-section" className="relative py-16 lg:py-24 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              Official Programs
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              FutureSet Skill Packages
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Select your package to unlock instant HD course modules, practical action blueprints, and start your digital wealth journey.
            </p>
          </div>

          {/* 6 Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PACKAGES.map((pkg, idx) => {
              const isVIP = pkg.id === 'pro';

              return (
                <div
                  key={pkg.id}
                  id={`package-card-${pkg.id}`}
                  className={`relative rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1.5 ${
                    isVIP ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : 'shadow-sm'
                  }`}
                >
                  {/* Package Photo Banner with printed package name */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100 group">
                    <img
                      src={pkg.imageUrl}
                      alt={`${pkg.name} - FutureSet Package ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                      }}
                    />

                    {/* Gradient and theme tint overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-20 mix-blend-overlay`} />

                    {/* Top Badges inside photo */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-blue-700 shadow-sm">
                        Package {idx + 1}
                      </span>
                      {pkg.badge && (
                        <span className={`px-2.5 py-1 text-[11px] font-extrabold tracking-wider uppercase rounded-lg shadow-sm ${pkg.accentBg} backdrop-blur-md`}>
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    {/* Bold Printed Package Name & Details inside Photo Banner */}
                    <div className="absolute inset-x-0 bottom-0 p-4 z-10 flex flex-col justify-end">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
                            Package {idx + 1}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">
                            {pkg.name} Package
                          </h3>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-blue-200 text-right backdrop-blur-md shadow-lg">
                          <div className="text-[9px] font-semibold text-slate-500 uppercase">Fee</div>
                          <div className="text-base sm:text-lg font-black text-blue-700 leading-tight">
                            ₹{pkg.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/20 text-[11px] text-slate-100">
                        <span className="font-semibold text-emerald-300">{pkg.coursesCount} HD Masterclasses</span>
                        <span>•</span>
                        <span>{pkg.lessonsCount} Video Lessons</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          {pkg.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Features */}
                  <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed min-h-[36px]">
                        {pkg.tagline}
                      </p>

                      {/* Features list */}
                      <div className="mt-5 space-y-2.5 mb-6">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Included Modules & Blueprints:
                        </div>
                        {pkg.skills.map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buy Now Button */}
                    <div className="pt-4 border-t border-slate-100">
                      <button
                        id={`btn-buy-now-${pkg.id}`}
                        onClick={() => handlePackageClick(pkg)}
                        className="w-full py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-95"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <p className="text-[11px] text-center text-slate-500 mt-2">
                        Instant activation & direct WhatsApp onboarding
                      </p>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Founder & CEO Section */}
      <section id="founder-section" className="relative py-20 bg-white border-t border-slate-200 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Eyebrow & Title */}
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Visionary Leadership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Meet Our Founder & CEO
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Leading the movement to revolutionize high-income skill education and financial independence for youth.
            </p>
          </div>

          {/* Founder Profile Card */}
          <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 sm:p-10 shadow-xl relative overflow-hidden">
            
            {/* Subtle corner badge */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Founder Photo DP */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative group">
                  
                  {/* Decorative glowing back ring */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
                  
                  {/* Image Container */}
                  <div className="relative w-64 sm:w-72 lg:w-80 aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border-2 border-blue-500/80 shadow-2xl">
                    
                    {!isPhotoLoaded && (
                      <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-600 animate-spin" />
                      </div>
                    )}
                    <img
                      src={founderPhotoSrc}
                      alt="Gaurav Gangwar - Founder & CEO, FutureSet"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      onLoad={() => setIsPhotoLoaded(true)}
                      className={`w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 ${
                        isPhotoLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = defaultFounderPhoto;
                        setIsPhotoLoaded(true);
                      }}
                    />

                    {/* Gradient Overlay at Bottom of Photo */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent flex flex-col justify-end p-4 z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-emerald-300">Verified Leadership</span>
                      </div>
                      <h4 className="text-lg font-bold text-white leading-tight">Gaurav Gangwar</h4>
                      <p className="text-xs text-blue-300 font-medium">Founder & CEO, FutureSet</p>
                    </div>
                  </div>
                </div>

                {/* Quick Trust Badges below photo */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Official Profile</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FutureSet Executive</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Founder Vision & Message */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-5">
                  <Quote className="w-6 h-6 rotate-180" />
                </div>

                <blockquote className="text-base sm:text-lg text-slate-700 font-normal leading-relaxed italic">
                  "FutureSet was founded with a singular purpose: to democratize high-income digital skills and give every aspiring individual a genuine pathway to financial independence. We've combined world-class practical courses with a transparent, rewarding affiliate ecosystem so you can learn, implement, and thrive."
                </blockquote>

                {/* Key Commitments */}
                <div className="mt-6 space-y-3.5 pt-6 border-t border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">Practical & Action-Oriented Curriculum</h5>
                      <p className="text-xs text-slate-500">Curated modules designed for real-world freelancing, meta ads, and digital monetization.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">Separate Direct & Passive Income Model</h5>
                      <p className="text-xs text-slate-500">Strictly segregated direct commissions and passive earning streams with instant tracking.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900">24/7 Dedicated Learner Support</h5>
                      <p className="text-xs text-slate-500">Direct WhatsApp onboarding, verification, and support for all community members.</p>
                    </div>
                  </div>
                </div>

                {/* Founder Identity Card / Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Gaurav Gangwar</span>
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <div className="text-xs font-semibold text-blue-600 mt-0.5">
                      Founder & CEO, FutureSet
                    </div>
                  </div>

                  {/* Connect with Founder CTA */}
                  <a
                    id="btn-founder-contact"
                    href="https://wa.me/918279641186?text=Hi%20Gaurav%20Gangwar%20Sir%2C%20I%20want%20to%20know%20more%20about%20FutureSet%20packages%20and%20affiliate%20system."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FutureSet Trust Pillars */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Curated Masterclasses</h3>
              <p className="text-sm text-slate-500 mt-2">
                High-definition video lessons covering high-income skills with step-by-step practical guides.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Seamless Affiliate System</h3>
              <p className="text-sm text-slate-500 mt-2">
                Personal affiliate tracking link, real-time earning analytics, and transparent withdrawal requests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Direct Admin Support</h3>
              <p className="text-sm text-slate-500 mt-2">
                24/7 dedicated support line via WhatsApp (+91 8279641186) for onboarding, payments, and queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 pb-8 border-t border-slate-200 bg-white text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">FutureSet</span>
            <span>© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveView('login')} className="hover:text-blue-600 transition-colors">
              Member Login
            </button>
            <a 
              href="https://wa.me/918279641186?text=Hi%20Gaurav%20sir%2C%20I%20want%20to%20know%20more%20about%20Futureset%20Packages." 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-emerald-600 transition-colors"
            >
              WhatsApp Support (8279641186)
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
