import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../context/LanguageContext';
import { Box, ChevronRight, ChevronDown, Lock, ShieldX, CheckCircle, Play, Trophy, Shield, Award, Layers } from 'lucide-react';
import LeaderboardView from '../components/LeaderboardView';

// Helper Component
// Helper Component: TopicCard with premium styling
const TopicCard = ({ topic, isCompleted, sectionId, isDisabled }) => {
  const { t } = useLanguage();
  const content = (
    <div
      className={`relative group overflow-hidden border rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-300
        ${isDisabled
          ? 'bg-cyber-900/10 border-cyber-800/30 cursor-not-allowed opacity-50'
          : isCompleted 
            ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30' 
            : 'bg-[#0d1117] border-cyber-800/60 hover:bg-cyber-900/40 hover:border-cyber-primary/40'}
        hover:translate-x-1.5
      `}
    >
      <div className="flex items-center gap-5 relative z-10 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300
          ${isDisabled
            ? 'bg-cyber-950 border-cyber-800 text-cyber-700'
            : isCompleted 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
              : 'bg-cyber-800/50 border-cyber-700 text-cyber-primary group-hover:border-cyber-primary/60 shadow-[0_0_15px_rgba(0,243,255,0.1)]'}
        `}>
          {isDisabled ? <Lock size={16} /> : isCompleted ? <CheckCircle size={18} strokeWidth={2.5} /> : <Play size={16} className="ml-0.5 fill-current" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-base font-black tracking-tight truncate transition-colors
            ${isDisabled ? 'text-cyber-600' : isCompleted ? 'text-emerald-100/90' : 'text-white group-hover:text-cyber-primary'}
          `}>
            {topic.title}
          </span>
          <div className="flex items-center gap-2.5 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isDisabled ? 'bg-red-500/30' : isCompleted ? 'bg-emerald-500/60' : 'bg-cyber-primary/60 animate-pulse'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em]
                ${isDisabled ? 'text-red-500/40' : isCompleted ? 'text-emerald-500/60' : 'text-cyber-500'}
              `}>
                {isDisabled ? t('sections.locked') : isCompleted ? t('sections.cleared') : t('sections.active')}
              </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 shrink-0">
        {isCompleted && !isDisabled && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Award size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">XP Sync+</span>
          </div>
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${isDisabled ? 'border-cyber-800 text-cyber-800 scale-90' : 'border-cyber-800 text-cyber-600 group-hover:border-cyber-primary/30 group-hover:text-cyber-primary group-hover:bg-cyber-primary/5'}`}>
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );

  if (isDisabled) return content;

  return (
    <Link to={`/sections/${sectionId}/topics/${topic.id}`} className="block">
      {content}
    </Link>
  );
};

const SectionSkeleton = () => (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-32 pt-8">
      {/* Skeleton Breadcrumb */}
      <div className="w-48 h-4 bg-cyber-800/50 rounded animate-pulse mb-6"></div>
      
      {/* Skeleton Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-cyber-900/40 border border-cyber-800/50 p-8 md:p-12 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden h-[400px] lg:h-auto">
        <div className="flex-1 space-y-6">
          <div className="w-40 h-6 bg-cyber-800 rounded-full animate-pulse"></div>
          <div className="w-3/4 h-16 bg-cyber-800 rounded-xl animate-pulse"></div>
          <div className="w-1/2 h-6 bg-cyber-800 rounded animate-pulse"></div>
        </div>
        
        <div className="w-full lg:w-[22rem] h-64 bg-cyber-800/40 border border-cyber-700/50 rounded-3xl p-8 animate-pulse">
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-cyber-700 rounded"></div>
              <div className="w-16 h-8 bg-cyber-700 rounded"></div>
            </div>
            <div className="w-16 h-16 bg-cyber-700 rounded-2xl"></div>
          </div>
          <div className="w-full h-3 bg-cyber-900 rounded-full mb-4"></div>
          <div className="mt-8 w-full h-12 bg-cyber-700 rounded-xl"></div>
        </div>
      </div>
  
      {/* Skeleton Tabs */}
      <div className="flex gap-12 border-b border-cyber-800/80 px-8">
        <div className="w-32 h-12 border-b-2 border-cyber-primary animate-pulse"></div>
        <div className="w-32 h-12 border-b-2 border-transparent"></div>
      </div>
  
      {/* Skeleton Content */}
      <div className="space-y-12 px-4 md:px-0">
        {[1, 2].map(i => (
          <div key={i} className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-cyber-800 rounded-2xl border border-cyber-700 animate-pulse"></div>
              <div className="w-64 h-8 bg-cyber-800 rounded animate-pulse"></div>
            </div>
            <div className="bg-cyber-900/20 border border-cyber-800/40 rounded-[2.5rem] p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-24 bg-cyber-800/40 border border-cyber-700/50 rounded-2xl animate-pulse shimmer-wrapper">
                    <div className="shimmer"></div>
                    <div className="flex items-center p-5 gap-5">
                      <div className="w-12 h-12 bg-cyber-700 rounded-xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="w-3/4 h-4 bg-cyber-700 rounded"></div>
                        <div className="w-1/4 h-2 bg-cyber-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const SectionPage = () => {
  const { sectionId } = useParams();
  const { user, userData, isAdmin, isSuperAdmin } = useAuth();
  const { getUserProgress } = useProgress();
  const { t } = useLanguage();
  
  const [section, setSection] = useState(null);
  const [modules, setModules] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [openModules, setOpenModules] = useState(new Set());

  const toggleModule = (moduleId) => {
    setOpenModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!sectionId) return;

    setLoading(true);
    setModulesLoading(true);
    let isMounted = true;
    const unsubscribers = [];

    const fetchData = async () => {
      try {
        // 1. Fetch Section Details
        const sectionRef = doc(db, 'sections', sectionId);
        const sectionSnap = await getDoc(sectionRef);
        
        if (!isMounted) return;
        if (sectionSnap.exists()) {
          setSection({ id: sectionSnap.id, ...sectionSnap.data() });
        } else {
          setSection(null);
        }
        setLoading(false);

        // 2. Fetch Modules via sectionModules junction
        const junctionQuery = query(
          collection(db, 'sectionModules'),
          where('sectionId', '==', sectionId)
        );
        const junctionSnap = await getDocs(junctionQuery);
        
        if (junctionSnap.empty) {
          if (isMounted) {
            setModules([]);
            setModulesLoading(false);
          }
          return;
        }

        // 3. Fetch all modules and their related data in parallel
        const modulesData = await Promise.all(junctionSnap.docs.map(async (jDoc) => {
          const jData = jDoc.data();
          const moduleId = jData.moduleId;
          
          // Fetch module details
          const moduleSnap = await getDoc(doc(db, 'modules', moduleId));
          if (!moduleSnap.exists()) return null;

          const moduleData = { id: moduleSnap.id, ...moduleSnap.data(), order: jData.order || 0 };

          // Fetch Groups and Topic Junctions in parallel for this module
          const [groupsSnap, topicJunctionSnap] = await Promise.all([
            getDocs(query(collection(db, 'groups'), where('moduleId', '==', moduleId), orderBy('order', 'asc'))),
            getDocs(query(collection(db, 'moduleTopics'), where('moduleId', '==', moduleId)))
          ]);

          const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Fetch all topics for this module's junctions
          const topics = await Promise.all(topicJunctionSnap.docs.map(async (tJDoc) => {
            const tJData = tJDoc.data();
            const topicSnap = await getDoc(doc(db, 'topics', tJData.topicId));
            if (topicSnap.exists()) {
              return {
                id: topicSnap.id,
                ...topicSnap.data(),
                order: tJData.order || 0,
                groupId: tJData.groupId || 'ungrouped'
              };
            }
            return null;
          }));

          const filteredTopics = topics.filter(Boolean).sort((a, b) => a.order - b.order);
          const groupIds = new Set(groups.map(g => g.id));

          moduleData.groups = groups.map(group => ({
            ...group,
            topics: filteredTopics.filter(t => t.groupId === group.id)
          }));

          moduleData.ungroupedTopics = filteredTopics.filter(t => !t.groupId || t.groupId === 'ungrouped' || !groupIds.has(t.groupId));

          return moduleData;
        }));

        if (!isMounted) return;

        const finalModules = modulesData.filter(Boolean).sort((a, b) => a.order - b.order);
        setModules(finalModules);
        
        if (finalModules.length > 0 && openModules.size === 0) {
          setOpenModules(new Set([finalModules[0].id]));
        }
        
        setModulesLoading(false);
      } catch (err) {
        console.error('Error fetching section data:', err);
        if (isMounted) {
          setLoading(false);
          setModulesLoading(false);
        }
      }
    };

    fetchData();

    // 4. Real-time listener for user progress (Keeping this as it's targeted and important)
    if (user) {
      const progressRef = doc(db, 'userProgress', user.uid);
      const unsubProgress = onSnapshot(progressRef, (progressSnap) => {
        if (!isMounted) return;
        if (progressSnap.exists()) {
          const data = progressSnap.data();
          if (data.completedTopics) {
            setProgressData(data.completedTopics);
          }
        }
      }, (error) => {
        console.error('Error listening to progress:', error);
      });
      unsubscribers.push(unsubProgress);
    }

    return () => {
      isMounted = false;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [sectionId, user]);

  // Calculate Progress Stats (MUST be before any early returns to respect Rules of Hooks)
  const { totalTopics, completedTopics, progressPercentage, firstUncompletedTopicId } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let firstUncompletedId = null;

    modules.forEach(mod => {
      // Check Groups
      mod.groups?.forEach(group => {
        group.topics.forEach(topic => {
          total++;
          if (progressData[topic.id]) {
            completed++;
          } else if (!firstUncompletedId) {
            firstUncompletedId = topic.id;
          }
        });
      });
      
      // Check Ungrouped
      mod.ungroupedTopics?.forEach(topic => {
        total++;
        if (progressData[topic.id]) {
          completed++;
        } else if (!firstUncompletedId) {
          firstUncompletedId = topic.id;
        }
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      totalTopics: total,
      completedTopics: completed,
      progressPercentage: percent,
      firstUncompletedTopicId: firstUncompletedId
    };
  }, [modules, progressData]);

  if (loading || (modulesLoading && activeTab === 'content')) return <SectionSkeleton />;
  if (!section) return <div>Section not found</div>;

  // Access check
  const hasAccess = () => {
    if (!user) return false;
    if (isAdmin || isSuperAdmin) return true;
    if (!userData?.allowedSections || userData.allowedSections.length === 0) return true;
    return userData.allowedSections.includes(sectionId);
  };

  const isSectionLocked = section.isLocked && !isAdmin && !isSuperAdmin;

  if (!hasAccess() || isSectionLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
        <div className={`p-6 ${isSectionLocked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'} rounded-full border`}>
          {isSectionLocked ? <Lock size={48} className="text-amber-400" /> : <ShieldX size={48} className="text-red-400" />}
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">{isSectionLocked ? t('sections.encryptedTitle') : t('sections.accessDeniedTitle')}</h1>
          <p className="text-cyber-400 max-w-md">
            {isSectionLocked 
              ? t('sections.encryptedDesc') 
              : t('sections.accessDeniedDesc')}
          </p>
        </div>
        <Link to="/sections" className="btn btn-outline flex items-center gap-2">
          &larr; {t('sections.backToSections')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-32">
      {/* Premium Header Section */}
      <div className="relative group">
        <Link to="/sections" className="flex items-center gap-2 text-cyber-500 hover:text-cyber-primary transition-colors mb-6 font-mono text-[11px] uppercase tracking-[0.3em] font-black group/back">
          <div className="w-5 h-5 rounded-full border border-cyber-800 flex items-center justify-center group-hover/back:border-cyber-primary transition-colors">
            <span className="mb-0.5">←</span>
          </div>
          {t('sections.breadcrumb')}
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-cyber-900/40 border border-cyber-800/50 p-8 md:p-12 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyber-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary text-[10px] font-black tracking-widest uppercase mb-6">
              <Shield size={12} /> {t('sections.securedPath')} // {section.id.substring(0, 8)}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight drop-shadow-sm">
              {section.title}
            </h1>
            <p className="text-cyber-400 font-medium text-lg md:text-xl mt-6 max-w-2xl leading-relaxed opacity-90">
              {section.description}
            </p>
          </div>
          
          {/* Dashboard Progress Widget */}
          {totalTopics > 0 && (
            <div className="relative shrink-0 w-full lg:w-[22rem] z-10">
              <div className="absolute inset-0 bg-cyber-primary/5 blur-2xl rounded-3xl group-hover:bg-cyber-primary/10 transition-all duration-700"></div>
              <div className="bg-cyber-800/40 border border-cyber-700/50 rounded-3xl p-8 backdrop-blur-xl relative shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-cyber-500 uppercase tracking-widest">{t('sections.pulse')}</span>
                    <span className="text-3xl font-black text-white flex items-center gap-1">
                      {progressPercentage}%
                      <div className="w-2 h-2 rounded-full bg-cyber-primary animate-pulse"></div>
                    </span>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-cyber-900/50 border border-cyber-700 flex items-center justify-center text-cyber-primary shadow-inner">
                    <Trophy size={32} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full h-3 bg-cyber-950 rounded-full overflow-hidden border border-cyber-800 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-cyber-primary via-emerald-400 to-cyber-primary bg-[length:200%_auto] animate-gradient-x transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between font-mono text-[11px] text-cyber-500 font-bold px-1">
                    <span>{completedTopics} {t('sections.passed')}</span>
                    <span className="opacity-50">/</span>
                    <span>{totalTopics} {t('sections.total')}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    to={firstUncompletedTopicId ? `/topics/${firstUncompletedTopicId}` : "#"}
                    className={`group/btn w-full py-4 rounded-xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden relative
                      ${progressPercentage === 100 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default' 
                        : 'bg-cyber-primary text-black hover:bg-white hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] active:scale-[0.97]'}
                    `}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                    {progressPercentage === 100 ? (
                      <><CheckCircle size={18} /> {t('sections.missionAccomplished')}</>
                    ) : (
                      <><Play size={18} className="fill-current" /> {completedTopics === 0 ? t('sections.commenceMission') : t('sections.resumeMission')}</>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-12 border-b border-cyber-800/80 mb-4 px-8">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-5 border-b-2 font-black tracking-[0.2em] uppercase text-xs transition-all duration-300 relative
            ${activeTab === 'content' ? 'border-cyber-primary text-cyber-primary' : 'border-transparent text-cyber-600 hover:text-white'}
          `}
        >
          {activeTab === 'content' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyber-primary rounded-full blur-[2px]"></div>}
          {t('sections.curriculum')}
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-5 border-b-2 font-black tracking-[0.2em] uppercase text-xs transition-all duration-300 flex items-center gap-3 relative
            ${activeTab === 'leaderboard' ? 'border-amber-400 text-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'border-transparent text-cyber-600 hover:text-white'}
          `}
        >
          <Trophy size={16} />
          {activeTab === 'leaderboard' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full blur-[2px]"></div>}
          {t('sections.leaderboard')}
        </button>
      </div>

      <div className="px-4 md:px-0">
        {activeTab === 'content' ? (
          <div className="space-y-6 pb-20">
            {(() => {
              // Compute per-module stats
              const enrichedModules = modules.map(mod => {
                const allTopics = [
                  ...(mod.groups?.flatMap(g => g.topics) || []),
                  ...(mod.ungroupedTopics || [])
                ];
                const total = allTopics.length;
                const completed = allTopics.filter(t => progressData[t.id]).length;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isFullyCompleted = total > 0 && completed === total;
                const isInProgress = completed > 0 && !isFullyCompleted;
                return { ...mod, _total: total, _completed: completed, _pct: pct, _isFullyCompleted: isFullyCompleted, _isInProgress: isInProgress };
              });

              // The "active" module: first in-progress, or fallback to first uncompleted
              const activeModule = enrichedModules.find(m => m._isInProgress)
                ?? enrichedModules.find(m => !m._isFullyCompleted && m._total > 0);

              // Remaining modules (all of them in order, excluding the active one if we show it separately)
              const remainingModules = enrichedModules.filter(m => m.id !== activeModule?.id);

              const ModuleTopicsExpanded = ({ module }) => {
                const isLockedToStudent = module.isLocked && !isAdmin && !isSuperAdmin;
                return (
                  <div className="mt-4 border-t border-cyber-800/50 pt-4 space-y-6">
                    {module.description && (
                      <p className="text-sm text-cyber-400 font-medium leading-relaxed italic border-l-2 border-cyber-primary/40 pl-4 py-1">
                        {module.description}
                      </p>
                    )}
                    {isLockedToStudent ? (
                      <div className="bg-cyber-950/50 border border-cyber-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <Lock size={24} className="text-red-500/50 mb-3" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('sections.restricted')}</h3>
                        <p className="text-cyber-500 text-xs max-w-sm mt-1 leading-relaxed">{t('sections.restrictedDesc')}</p>
                      </div>
                    ) : (
                      <div className="space-y-10 relative">
                        {/* List Connecting Line (Timeline) */}
                        <div className="absolute top-2 bottom-2 left-5 w-px bg-gradient-to-b from-cyber-primary/40 via-cyber-primary/10 to-transparent pointer-events-none z-0"></div>

                        {module.groups?.map(group => group.topics.length > 0 && (
                          <div key={group.id} className="space-y-4">
                            <div className="flex items-center gap-3 relative z-10 translate-x-1">
                              <div className="w-8 h-8 rounded-full bg-cyber-950 border border-cyber-700/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                <div className="w-2 h-2 rounded-full bg-cyber-primary animate-pulse shadow-[0_0_8px_rgba(0,243,255,0.8)]"></div>
                              </div>
                              <h3 className="text-[11px] font-black text-cyber-400 uppercase tracking-[0.25em]">{group.title}</h3>
                            </div>
                            <div className="flex flex-col gap-3 relative z-10">
                              {group.topics.map(topic => (
                                <TopicCard key={topic.id} topic={topic} isCompleted={!!progressData[topic.id]} sectionId={sectionId} isDisabled={topic.isLocked && !isAdmin && !isSuperAdmin} />
                              ))}
                            </div>
                          </div>
                        ))}

                        {module.ungroupedTopics?.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 relative z-10 translate-x-1">
                              <div className="w-8 h-8 rounded-full bg-cyber-950 border border-cyber-700/50 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-cyber-500"></div>
                              </div>
                              <h3 className="text-[11px] font-black text-cyber-400 uppercase tracking-[0.25em]">{t('sections.generalIntel')}</h3>
                            </div>
                            <div className="flex flex-col gap-3 relative z-10">
                              {module.ungroupedTopics.map(topic => (
                                <TopicCard key={topic.id} topic={topic} isCompleted={!!progressData[topic.id]} sectionId={sectionId} isDisabled={topic.isLocked && !isAdmin && !isSuperAdmin} />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(!module.groups?.length && !module.ungroupedTopics?.length) && (
                          <p className="text-[10px] text-cyber-700 font-bold uppercase tracking-widest italic text-center py-8">{t('sections.emptySector')}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <>
                  {/* ── ACTIVE / IN-PROGRESS MODULE HERO ── */}
                  {activeModule && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyber-primary animate-pulse inline-block"></span>
                        {t('sections.inProgressModules')}
                      </h2>
                      <div
                        onClick={() => toggleModule(activeModule.id)}
                        className="cursor-pointer group relative overflow-hidden bg-[#0d1117] border border-cyber-700/60 hover:border-cyber-primary/50 rounded-2xl p-5 transition-all duration-300"
                      >
                        {/* Ambient glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/5 via-transparent to-transparent pointer-events-none" />
                        <div className="flex items-center gap-5">
                          {/* Icon Box */}
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-xl bg-cyber-900 border border-cyber-700 flex items-center justify-center text-cyber-primary shadow-[0_0_20px_rgba(0,243,255,0.15)] group-hover:shadow-[0_0_30px_rgba(0,243,255,0.25)] transition-all duration-500">
                              <Box size={28} />
                            </div>
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyber-primary text-black uppercase tracking-widest">
                                {t('sections.inProgressBadge')}
                              </span>
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                <Layers size={8} /> {t('sections.regularBadge')}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-white tracking-tight truncate">{activeModule.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-cyber-400">
                              <span className="flex items-center gap-1">
                                <CheckCircle size={11} className="text-cyber-500" />
                                {activeModule._completed}/{activeModule._total} {t('sections.topicsCountLabel')}
                              </span>
                            </div>
                          </div>
                          {/* Progress & action */}
                          <div className="shrink-0 text-right flex flex-col items-end gap-2">
                            <span className="text-cyber-primary font-black text-sm">
                              {activeModule._pct}%
                            </span>
                            <div className="w-28 h-1.5 bg-cyber-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyber-primary to-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${activeModule._pct}%` }}
                              />
                            </div>
                            <ChevronDown
                              size={14}
                              className={`text-cyber-500 transition-transform duration-300 ${openModules.has(activeModule.id) ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </div>
                        {/* Expanded topics */}
                        {openModules.has(activeModule.id) && <ModuleTopicsExpanded module={activeModule} />}
                      </div>
                    </div>
                  )}

                  {/* ── ALL MODULES LIST ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-black text-white uppercase tracking-widest">{t('sections.allModules')}</h2>
                      <span className="text-[10px] text-cyber-500 font-bold">
                        {enrichedModules.length} · {enrichedModules.filter(m => m._isFullyCompleted).length} {t('sections.passed')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {remainingModules.map((module, mIdx) => {
                        const isLockedToStudent = module.isLocked && !isAdmin && !isSuperAdmin;
                        const isOpen = openModules.has(module.id);

                        return (
                          <div
                            key={module.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${mIdx * 60}ms` }}
                          >
                            {/* Card header row */}
                            <div
                              onClick={() => toggleModule(module.id)}
                              className={`cursor-pointer group flex items-center gap-4 p-4 bg-[#0d1117] border rounded-2xl transition-all duration-300
                                ${
                                  module._isFullyCompleted
                                    ? 'border-emerald-500/20 hover:border-emerald-500/40'
                                    : isLockedToStudent
                                    ? 'border-red-900/30 opacity-60'
                                    : 'border-cyber-800/40 hover:border-cyber-primary/30'
                                }
                                ${isOpen ? 'rounded-b-none' : ''}
                              `}
                            >
                              {/* Icon */}
                              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${
                                module._isFullyCompleted
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : isLockedToStudent
                                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                  : 'bg-cyber-900/60 border-cyber-800 text-cyber-primary'
                              }`}>
                                {module._isFullyCompleted
                                  ? <CheckCircle size={20} strokeWidth={2.5} />
                                  : isLockedToStudent
                                  ? <Lock size={18} />
                                  : <Box size={20} />
                                }
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                  {module.isLocked && (
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full border border-red-500/30 text-red-400 uppercase tracking-widest">
                                      {t('sections.locked')}
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-sm font-black tracking-tight ${
                                  module._isFullyCompleted ? 'text-emerald-100/70' : 'text-white'
                                }`}>
                                  {module.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-cyber-500">
                                  <Layers size={9} />
                                  <span>{module._total} {t('sections.topicsCountLabel')}</span>
                                </div>
                              </div>

                              {/* Right: status or progress */}
                              <div className="shrink-0 flex items-center gap-3">
                                {module._isFullyCompleted ? (
                                  <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
                                    <CheckCircle size={14} strokeWidth={2.5} />
                                    {t('sections.cleared')}
                                  </span>
                                ) : module._pct > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-cyber-900 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-cyber-primary to-emerald-400 rounded-full"
                                        style={{ width: `${module._pct}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] font-black text-cyber-300">{module._pct}%</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-black text-cyber-600 uppercase tracking-widest">
                                    {module._total === 0 ? '—' : t('sections.active')}
                                  </span>
                                )}
                                <ChevronDown
                                  size={14}
                                  className={`text-cyber-600 group-hover:text-cyber-400 transition-all duration-300 ${isOpen ? 'rotate-180 text-cyber-primary' : ''}`}
                                />
                              </div>
                            </div>

                            {/* Expanded content */}
                            {isOpen && (
                              <div className="bg-[#0d1117] border border-t-0 border-cyber-800/40 rounded-b-2xl px-5 pb-5">
                                <ModuleTopicsExpanded module={module} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="animate-fade-in-up mt-8">
            <LeaderboardView sectionId={sectionId} />
          </div>
        )}
      </div>
    </div>
  );
};



export default SectionPage;
