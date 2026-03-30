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
      className={`relative group overflow-hidden border rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200
        ${isDisabled
          ? 'bg-cyber-900/10 border-cyber-800/30 cursor-not-allowed opacity-50'
          : isCompleted 
            ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30' 
            : 'bg-cyber-900/30 border-cyber-800/50 hover:bg-cyber-800/50 hover:border-cyber-primary/40'}
      `}
    >
      <div className="flex items-center gap-3 relative z-10 min-w-0">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300
          ${isDisabled
            ? 'bg-cyber-950 border-cyber-800 text-cyber-700'
            : isCompleted 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-cyber-800/50 border-cyber-700 text-cyber-primary group-hover:border-cyber-primary/50'}
        `}>
          {isDisabled ? <Lock size={14} /> : isCompleted ? <CheckCircle size={16} strokeWidth={2.5} /> : <Play size={14} className="ml-0.5 fill-current" />}
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-bold truncate transition-colors
            ${isDisabled ? 'text-cyber-600' : isCompleted ? 'text-emerald-100/70' : 'text-white group-hover:text-cyber-primary'}
          `}>
            {topic.title}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest
                ${isDisabled ? 'text-red-500/40' : isCompleted ? 'text-emerald-500/60' : 'text-cyber-500'}
              `}>
                {isDisabled ? t('sections.locked') : isCompleted ? t('sections.cleared') : t('sections.active')}
              </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10 shrink-0">
        {isCompleted && !isDisabled && (
          <div className="flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Award size={10} className="text-emerald-400" />
          </div>
        )}
        <div className={`transition-all duration-300 ${isDisabled ? 'text-cyber-800' : 'text-cyber-600 group-hover:text-cyber-primary'}`}>
          <ChevronRight size={14} />
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
    const unsubscribers = [];

    try {
      // 1. Real-time listener for Section Details
      const sectionRef = doc(db, 'sections', sectionId);
      const unsubSection = onSnapshot(sectionRef, (sectionSnap) => {
        if (sectionSnap.exists()) {
          setSection({ id: sectionSnap.id, ...sectionSnap.data() });
        } else {
          setSection(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error listening to section:', error);
        setLoading(false);
      });
      unsubscribers.push(unsubSection);

      // 2. Real-time listener for Modules via sectionModules junction
      const junctionQuery = query(
        collection(db, 'sectionModules'),
        where('sectionId', '==', sectionId)
      );

      const unsubJunction = onSnapshot(junctionQuery, async (junctionSnap) => {
        if (junctionSnap.empty) {
          setModules([]);
          return;
        }

        const modulesData = [];
        for (const jDoc of junctionSnap.docs) {
          const jData = jDoc.data();
          const moduleRef = doc(db, 'modules', jData.moduleId);
          const moduleSnap = await getDoc(moduleRef);

          if (moduleSnap.exists()) {
            const moduleData = { id: moduleSnap.id, ...moduleSnap.data(), order: jData.order || 0 };

            // Fetch Groups
            const groupsQ = query(
              collection(db, 'groups'),
              where('moduleId', '==', moduleData.id),
              orderBy('order', 'asc')
            );
            const groupsSnap = await getDocs(groupsQ);
            const groups = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            // Fetch topics via moduleTopics junction
            const topicJunctionQuery = query(
              collection(db, 'moduleTopics'),
              where('moduleId', '==', moduleData.id)
            );
            const topicJunctionSnap = await getDocs(topicJunctionQuery);

            const topics = [];
            for (const tJDoc of topicJunctionSnap.docs) {
              const tJData = tJDoc.data();
              const topicRef = doc(db, 'topics', tJData.topicId);
              const topicSnap = await getDoc(topicRef);
              if (topicSnap.exists()) {
                topics.push({
                  id: topicSnap.id,
                  ...topicSnap.data(),
                  order: tJData.order || 0,
                  groupId: tJData.groupId || 'ungrouped'
                });
              }
            }

            topics.sort((a, b) => a.order - b.order);

            // Organize topics into groups
            const groupIds = new Set(groups.map(g => g.id));

            moduleData.groups = groups.map(group => ({
              ...group,
              topics: topics.filter(t => t.groupId === group.id)
            }));

            moduleData.ungroupedTopics = topics.filter(t => !t.groupId || t.groupId === 'ungrouped' || !groupIds.has(t.groupId));

            modulesData.push(moduleData);
          }
        }

        modulesData.sort((a, b) => a.order - b.order);
        setModules(modulesData);
        
        // Auto-open the first module if none are open
        if (modulesData.length > 0 && openModules.size === 0) {
          setOpenModules(new Set([modulesData[0].id]));
        }
        
        setModulesLoading(false);
      }, (error) => {
        console.error('Error listening to sectionModules:', error);
        setModulesLoading(false);
      });
      unsubscribers.push(unsubJunction);

      // 3. Real-time listener for user progress
      if (user) {
        const progressRef = doc(db, 'userProgress', user.uid);
        const unsubProgress = onSnapshot(progressRef, (progressSnap) => {
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

    } catch (err) {
      console.error('Error setting up listeners:', err);
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [sectionId, user, getUserProgress]);

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
          <div className="space-y-12 pb-20">
            {modules.map((module, mIdx) => {
              const isLockedToStudent = module.isLocked && !isAdmin && !isSuperAdmin;
              const isOpen = openModules.has(module.id);
              
              return (
                <div key={module.id} className="animate-fade-in-up bg-cyber-900/10 border border-cyber-800/30 rounded-3xl overflow-hidden transition-all duration-500" style={{ animationDelay: `${mIdx * 100}ms` }}>
                  {/* Module Header - Clickable for Toggle */}
                  <div 
                    onClick={() => toggleModule(module.id)}
                    className={`flex items-center justify-between p-6 cursor-pointer hover:bg-cyber-800/20 transition-colors
                      ${isOpen ? 'border-b border-cyber-800/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500
                        ${module.isLocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-cyber-900 border-cyber-800 text-cyber-primary'}
                      `}>
                        <span className="font-black text-lg italic">{mIdx + 1}</span>
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                          {module.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          {module.isLocked && (
                            <div className="flex items-center gap-1.5 text-[8px] font-black px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full tracking-widest">
                              <Lock size={8} /> {t('sections.locked').toUpperCase()}
                            </div>
                          )}
                          <span className="text-[10px] font-black text-cyber-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Layers size={10} /> {(module.groups?.reduce((acc, g) => acc + g.topics.length, 0) || 0) + (module.ungroupedTopics?.length || 0)} {t('sections.topicsCountLabel')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-10 h-10 rounded-full border border-cyber-800 flex items-center justify-center text-cyber-500 transition-all duration-300 ${isOpen ? 'rotate-180 text-cyber-primary border-cyber-primary/30' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {/* Module Content - Conditionally Rendered */}
                  <div className={`transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="p-6 space-y-8">
                      {module.description && (
                        <p className="text-sm text-cyber-400 font-medium leading-relaxed italic border-l-2 border-cyber-800 pl-4 py-1">
                          {module.description}
                        </p>
                      )}

                      {isLockedToStudent ? (
                        <div className="bg-cyber-950/50 border border-cyber-800/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                          <div className="w-16 h-16 rounded-2xl bg-cyber-900/80 border border-cyber-800 flex items-center justify-center mb-4 shadow-xl">
                            <Lock size={24} className="text-red-500/50" />
                          </div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-widest">{t('sections.restricted')}</h3>
                          <p className="text-cyber-500 text-sm max-w-sm mt-2 leading-relaxed font-medium">
                            {t('sections.restrictedDesc')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Groups */}
                          {module.groups && module.groups.map(group => (
                            group.topics.length > 0 && (
                              <div key={group.id} className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                  <div className="w-1 h-1 rounded-full bg-cyber-primary shadow-[0_0_8px_rgba(0,243,255,1)]"></div>
                                  <h3 className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.2em]">
                                    {group.title}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {group.topics.map(topic => (
                                    <TopicCard 
                                      key={topic.id} 
                                      topic={topic} 
                                      isCompleted={!!progressData[topic.id]} 
                                      sectionId={sectionId}
                                      isDisabled={topic.isLocked && !isAdmin && !isSuperAdmin}
                                    />
                                  ))}
                                </div>
                              </div>
                            )
                          ))}

                          {/* Ungrouped Topics */}
                          {module.ungroupedTopics && module.ungroupedTopics.length > 0 && (
                            <div className="space-y-3">
                               <div className="flex items-center gap-2 px-1">
                                  <div className="w-1 h-1 rounded-full bg-cyber-500"></div>
                                  <h3 className="text-[10px] font-black text-cyber-500 uppercase tracking-[0.2em]">
                                    {t('sections.generalIntel')}
                                  </h3>
                                </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {module.ungroupedTopics.map(topic => (
                                  <TopicCard 
                                    key={topic.id} 
                                    topic={topic} 
                                    isCompleted={!!progressData[topic.id]} 
                                    sectionId={sectionId} 
                                    isDisabled={topic.isLocked && !isAdmin && !isSuperAdmin}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {(!module.groups?.length && !module.ungroupedTopics?.length) && (
                            <div className="py-12 text-center flex flex-col items-center">
                              <p className="text-[10px] text-cyber-700 font-bold uppercase tracking-widest italic">{t('sections.emptySector')}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
