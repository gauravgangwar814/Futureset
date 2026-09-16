import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Camera, 
  Lock, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Trash2,
  Loader2
} from 'lucide-react';
import { processImageFile, saveFounderPhoto } from '../utils/imageStorage';

export const MyProfileView: React.FC = () => {
  const { currentUser, updateProfile, setActiveView } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full">
          <p className="text-slate-500 mb-4 font-semibold text-sm">Please log in to view your profile.</p>
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

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const compressedDataUrl = await processImageFile(file);
      setAvatarUrl(compressedDataUrl);

      // Check if user is Founder / Gaurav Gangwar
      const isFounderUser = 
        currentUser.email.toLowerCase() === 'gauravgangwar814@gmail.com' ||
        currentUser.referralCode.toUpperCase() === 'GAURAV';

      if (isFounderUser) {
        await saveFounderPhoto(compressedDataUrl);
        window.dispatchEvent(new CustomEvent('founder-photo-updated', { detail: compressedDataUrl }));
        fetch('/api/upload-founder-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: compressedDataUrl })
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error processing avatar:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveDP = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || currentUser.name)}`;
    setAvatarUrl(defaultAvatar);
    updateProfile(name || currentUser.name, defaultAvatar);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile(name, avatarUrl);

    // If Gaurav Gangwar saves profile, also persist founder photo to website
    const isFounderUser = 
      currentUser.email.toLowerCase() === 'gauravgangwar814@gmail.com' ||
      currentUser.referralCode.toUpperCase() === 'GAURAV';

    if (isFounderUser && avatarUrl.startsWith('data:image')) {
      await saveFounderPhoto(avatarUrl);
      window.dispatchEvent(new CustomEvent('founder-photo-updated', { detail: avatarUrl }));
      fetch('/api/upload-founder-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: avatarUrl })
      }).catch(() => {});
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  ];

  return (
    <div id="my-profile-page" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <button
          id="btn-profile-back"
          onClick={() => setActiveView('profile_initial')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 mb-6 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xl">
          
          {/* Header */}
          <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 block">
                Account Information
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Profile</h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your FutureSet identification and profile picture
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase">
                {currentUser.packageName}
              </span>
            </div>
          </div>

          {isSaved && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile details & DP saved permanently to your account!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            
            {/* 1. Profile DP (Editable & Permanent) */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="relative group shrink-0">
                <img
                  id="profile-dp-preview"
                  src={avatarUrl || currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-transform active:scale-95"
                  title="Upload New DP"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Profile DP (Permanent Storage)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Editable
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload your photo or choose an avatar. DP tab tak save rahegi jab tak aap remove na karein.
                </p>

                {/* Avatar presets & Remove DP Button */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                        avatarUrl === preset ? 'border-blue-600 scale-110 ring-2 ring-blue-400/40' : 'border-slate-300'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleRemoveDP}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold transition-colors ml-2"
                    title="Remove custom DP and reset"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove DP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Name (Editable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Editable
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="profile-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-medium text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Gmail (Non-editable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Registered Gmail ID
                </label>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                  <Lock className="w-2.5 h-2.5" /> Locked (Non-editable)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="profile-input-email"
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed font-medium text-sm select-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Gmail address is permanently attached to your FutureSet ID for security.
              </p>
            </div>

            {/* 4. WhatsApp No. (Non-editable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Registered WhatsApp No.
                </label>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200">
                  <Lock className="w-2.5 h-2.5" /> Locked (Non-editable)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="profile-input-whatsapp"
                  type="text"
                  disabled
                  value={currentUser.whatsapp}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 cursor-not-allowed font-medium text-sm select-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                WhatsApp contact cannot be modified directly once registered.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                id="btn-save-profile-changes"
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Save Profile Changes Permanently</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

