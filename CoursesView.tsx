import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getUnlockedModulesForPackage } from '../data/packages';
import { CourseModule, CourseLesson } from '../types';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Award, 
  FileText, 
  ChevronRight,
  Layers,
  Volume2
} from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { currentUser, setActiveView } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please log in to access your course content.</p>
          <button
            onClick={() => setActiveView('login')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const unlockedModules = getUnlockedModulesForPackage(currentUser.packageId);
  const allLessons = unlockedModules.flatMap(m => m.lessons);

  const [activeModuleId, setActiveModuleId] = useState<string>(unlockedModules[0]?.id || '');
  const [activeLesson, setActiveLesson] = useState<CourseLesson>(allLessons[0] || unlockedModules[0]?.lessons[0]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['l1']);

  const currentModule = unlockedModules.find(m => m.id === activeModuleId) || unlockedModules[0];

  const toggleLessonCompleted = (id: string) => {
    setCompletedLessonIds(prev => 
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

  const progressPercent = Math.round(
    (completedLessonIds.length / (allLessons.length || 1)) * 100
  );

  return (
    <div id="my-courses-screen" className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              id="btn-courses-back"
              onClick={() => setActiveView('profile_initial')}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 transition-colors shadow-sm"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Courses & Masterclasses</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.packageName} Access
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full access to <strong className="text-blue-700">{currentUser.packageName}</strong> and all included modules for {currentUser.name}
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Course Progress</div>
              <div className="text-sm font-black text-blue-600">{progressPercent}% Completed</div>
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Learning Hub Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Main Video Player & Lesson Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Player Box */}
            <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {activeLesson ? (
                  <video
                    key={activeLesson.id}
                    controls
                    autoPlay
                    playsInline
                    poster={activeLesson.thumbnailUrl}
                    className="w-full h-full object-contain"
                  >
                    <source src={activeLesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-slate-400 text-sm">Select a lesson to begin watching</div>
                )}
              </div>

              {/* Lesson Controls & Description */}
              {activeLesson && (
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                        {currentModule?.title}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                        {activeLesson.title}
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {activeLesson.duration}
                        </span>
                        <span>Instructor: <strong className="text-blue-700">{currentModule?.instructor}</strong></span>
                      </div>
                    </div>

                    {/* Mark Completed Button */}
                    <button
                      type="button"
                      onClick={() => toggleLessonCompleted(activeLesson.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                        completedLessonIds.includes(activeLesson.id)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {completedLessonIds.includes(activeLesson.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Lesson Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Lesson Overview
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeLesson.description}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  {activeLesson.keyTakeaways && activeLesson.keyTakeaways.length > 0 && (
                    <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Action Steps & Key Takeaways</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {activeLesson.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

          {/* Right Col: Course Modules & Lesson Playlist */}
          <div className="space-y-6">
            
            {/* Module Picker */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-md">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Unlocked Course Modules ({unlockedModules.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {unlockedModules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModuleId(module.id);
                      if (module.lessons.length > 0) {
                        setActiveLesson(module.lessons[0]);
                      }
                    }}
                    className={`w-full p-3 rounded-xl text-left text-xs transition-all ${
                      module.id === activeModuleId
                        ? 'bg-blue-50 border border-blue-300 text-blue-700 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{module.title}</span>
                      <span className="text-[10px] text-blue-600 shrink-0 uppercase font-mono">
                        {module.packageId}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Module Lessons Playlist */}
            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Lessons in this Module
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {currentModule?.lessons.length || 0} Lessons
                </span>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {currentModule?.lessons.map((lesson, idx) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`group p-3 rounded-2xl cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={lesson.thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                              <Volume2 className="w-4 h-4 text-white fill-current animate-pulse" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-600">
                              Lesson 0{idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">{lesson.duration}</span>
                          </div>
                          <h4 className={`text-xs font-semibold truncate mt-0.5 ${
                            isActive ? 'text-blue-700 font-bold' : 'text-slate-800'
                          }`}>
                            {lesson.title}
                          </h4>
                        </div>

                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
