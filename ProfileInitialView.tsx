import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Camera, 
  Edit3, 
  Check, 
  Sparkles, 
  Play, 
  ArrowRight,
  BookOpen,
  Trash2,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { processImageFile, saveFounderPhoto } from '../utils/imageStorage';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

export const ProfileInitialView: React.FC = () => {
  const { currentUser, updateProfile, setActiveView } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || DEFAULT_AVATAR);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please log in to view your profile.</p>
          <button
            onClick={() => setActiveView('login')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile(name.trim(), avatarUrl || currentUser.avatarUrl);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const newUrl = await processImageFile(file);
      setAvatarUrl(newUrl);
      // Permanently fix and save to user profile
      updateProfile(currentUser.name, newUrl);

      // If user is founder Gaurav Gangwar, also sync to website founder photo
      const isFounderUser = 
        currentUser.email.toLowerCase() === 'gauravgangwar814@gmail.com' ||
        currentUser.referralCode.toUpperCase() === 'GAURAV';

      if (isFounderUser) {
        await saveFounderPhoto(newUrl);
        window.dispatchEvent(new CustomEvent('founder-photo-updated', { detail: newUrl }));
        fetch('/api/upload-founder-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: newUrl })
        }).catch(() => {});
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error processing avatar:', err);
    } finally {
      setIsProcessingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePresetAvatar = (url: string) => {
    setAvatarUrl(url);
    updateProfile(currentUser.name, url);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRemoveDP = () => {
    setAvatarUrl(DEFAULT_AVATAR);
    updateProfile(currentUser.name, DEFAULT_AVATAR);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  ];

  return (
    <div id="profile-initial-screen" className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Welcome Banner (White & Blue Card) */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xl">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            
            {/* Profile DP / Photo with Permanent Storage & Quick Edit */}
            <div className="relative group shrink-0">
              <img
                id="user-profile-dp"
                src={currentUser.avatarUrl || avatarUrl}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-blue-600 shadow-xl shadow-blue-500/20"
              />
              <button
                type="button"
                id="btn-edit-dp-trigger"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-transform active:scale-90 font-bold"
                title="Upload Permanent Profile DP"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>

            {/* Profile Name & Membership Details */}
            <div className="flex-1 overflow-hidden">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-0.5 text-xs font-black uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.packageName} Package
                </span>
                <span className="px-3 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active ID
                </span>
              </div>

              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <h1 id="user-profile-name" className="text-2xl sm:text-4xl font-black text-slate-900">
                      {currentUser.name}
                    </h1>
                    <button
                      id="btn-edit-profile-toggle"
                      onClick={() => {
                        setName(currentUser.name);
                        setAvatarUrl(currentUser.avatarUrl);
                        setIsEditing(true);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 border border-slate-200 transition-colors"
                      title="Edit Name and Profile DP"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Referral ID: <strong className="text-blue-700 font-mono">{currentUser.referralCode}</strong> • {currentUser.email}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                    {currentUser.avatarUrl && currentUser.avatarUrl !== DEFAULT_AVATAR && (
                      <button
                        onClick={handleRemoveDP}
                        className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove DP</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Inline Edit Profile */
                <form onSubmit={handleSave} className="mt-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1">
                      Edit Name (Profile DP is permanently fixed):
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 border border-blue-400 text-slate-900 text-sm w-full max-w-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Quick Avatar Presets */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1.5">Or Choose Avatar Preset:</span>
                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePresetAvatar(preset)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                            currentUser.avatarUrl === preset ? 'border-blue-600 scale-110 shadow-md shadow-blue-500/30' : 'border-slate-300'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="btn-save-profile-edit"
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-blue-500/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {saveSuccess && (
                <div className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile DP & details permanently saved!</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* PRIMARY OPTION: "My Courses" — Prominent Card */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>My Courses Option</span>
            </h2>
            <span className="text-xs text-blue-700 font-medium">Unlocked with {currentUser.packageName}</span>
          </div>

          <div
            id="card-my-courses-primary"
            onClick={() => setActiveView('courses')}
            className="group cursor-pointer relative overflow-hidden rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-500/80 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0 font-bold">
                  <Play className="w-8 h-8 fill-current" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black uppercase mb-1">
                    Ready to Watch
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    Access {currentUser.packageName} Video Lessons & Masterclasses
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Watch step-by-step video tutorials, modules, and downloadable blueprints included in your package.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  id="btn-enter-my-courses"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all group-hover:px-7"
                >
                  <span>Open Course Player</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
