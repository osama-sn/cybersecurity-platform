import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { Box, ChevronRight, Lock, ShieldX, CheckCircle, Play, Trophy, Shield, Award } from 'lucide-react';
import LeaderboardView from '../components/LeaderboardView';

// Helper Component
// Helper Component: TopicCard with premium styling
const TopicCard = ({ topic, isCompleted, sectionId }) => (
  <Link
    to={`/sections/${sectionId}/topics/${topic.id}`}
    className={`relative group overflow-hidden border rounded-2xl p-5 flex items-center justify-between transition-all duration-300
      ${isCompleted 
        ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
        : 'bg-cyber-900/40 border-cyber-700/50 hover:bg-cyber-800/60 hover:border-cyber-primary/50 hover:shadow-[0_0_20px_rgba(0,243,255,0.05)]'}
    `}
  >
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

    <div className="flex items-center gap-5 relative z-10">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 shadow-inner
        ${isCompleted 
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 group-hover:scale-110' 
          : 'bg-cyber-800/80 border-cyber-700 text-cyber-primary group-hover:border-cyber-primary group-hover:shadow-[0_0_10px_rgba(0,243,255,0.2)]'}
      `}>
        {isCompleted ? <CheckCircle size={22} strokeWidth={2.5} /> : <Box size={22} />}
      </div>
      <div className="flex flex-col">
        <span className={`text-[17px] font-bold tracking-tight transition-colors
          ${isCompleted ? 'text-emerald-100/60' : 'text-white group-hover:text-cyber-primary'}
        `}>
          {topic.title}
        </span>
        {isCompleted ? (
          <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em] mt-1">Status: Completed</span>
        ) : (
          <span className="text-[10px] font-bold text-cyber-500 uppercase tracking-[0.2em] mt-1">Status: Available</span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-4 relative z-10">
      {isCompleted && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Award size={12} className="text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Passed</span>
        </div>
      )}
      <div className={`p-2 rounded-lg transition-all duration-300
        ${isCompleted ? 'text-emerald-500/40' : 'text-cyber-700 group-hover:text-cyber-primary group-hover:bg-cyber-primary/10'}
      `}>
        <ChevronRight size={20} />
      </div>
    </div>
  </Link>
);

const SectionPage = () => {
  const { sectionId } = useParams();
  const { user, userData, isAdmin, isSuperAdmin } = useAuth();
  const { getUserProgress } = useProgress();
  
  const [section, setSection] = useState(null);
  const [modules, setModules] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (!sectionId) return;

    setLoading(true);
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
      }, (error) => {
        console.error('Error listening to sectionModules:', error);
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

  if (loading) return <div>Loading...</div>;
  if (!section) return <div>Section not found</div>;

  // Access check
  const hasAccess = () => {
    if (!user) return false;
    if (isAdmin || isSuperAdmin) return true;
    if (!userData?.allowedSections || userData.allowedSections.length === 0) return true;
    return userData.allowedSections.includes(sectionId);
  };

  if (!hasAccess()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-fade-in">
        <div className="p-6 bg-red-500/10 rounded-full border border-red-500/30">
          <ShieldX size={48} className="text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-cyber-400 max-w-md">You do not have permission to view this section. Contact the administrator to request access.</p>
        </div>
        <Link to="/sections" className="btn btn-outline flex items-center gap-2">
          &larr; Back to Sections
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
          Dashboard / Sections
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-cyber-900/40 border border-cyber-800/50 p-8 md:p-12 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyber-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary text-[10px] font-black tracking-widest uppercase mb-6">
              <Shield size={12} /> SECURED_PATH // {section.id.substring(0, 8)}
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
                    <span className="text-[10px] font-black text-cyber-500 uppercase tracking-widest">Section Pulse</span>
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
                    <span>{completedTopics} PASSED</span>
                    <span className="opacity-50">/</span>
                    <span>{totalTopics} TOTAL</span>
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
                      <><CheckCircle size={18} /> MISSION_ACCOMPLISHED</>
                    ) : (
                      <><Play size={18} className="fill-current" /> {completedTopics === 0 ? 'COMMENCE_MISSION' : 'RESUME_MISSION'}</>
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
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-5 border-b-2 font-black tracking-[0.2em] uppercase text-xs transition-all duration-300 flex items-center gap-3 relative
            ${activeTab === 'leaderboard' ? 'border-amber-400 text-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'border-transparent text-cyber-600 hover:text-white'}
          `}
        >
          <Trophy size={16} />
          {activeTab === 'leaderboard' && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full blur-[2px]"></div>}
          Leaderboard
        </button>
      </div>

      <div className="px-4 md:px-0">
        {activeTab === 'content' ? (
          <div className="space-y-12 pb-20">
            {modules.map((module, mIdx) => {
              const isLockedToStudent = module.isLocked && !isAdmin && !isSuperAdmin;
              
              return (
              <div key={module.id} className="animate-fade-in-up" style={{ animationDelay: `${mIdx * 100}ms` }}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl transition-all duration-500
                      ${module.isLocked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-cyber-900/80 border-cyber-800 text-cyber-primary group-hover:scale-110'}
                    `}>
                      <span className="font-black text-xl italic">{mIdx + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                        {module.title}
                      </h2>
                      {module.isLocked && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full tracking-widest mt-1">
                          <Lock size={10} /> {isAdmin || isSuperAdmin ? 'HIDDEN_FROM_STUDENTS' : 'LOCKED_BY_ADMIN'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isLockedToStudent ? (
                  <div className="bg-cyber-900/20 border border-cyber-800/50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-500/2 blur-3xl group-hover:bg-red-500/5 transition-all duration-700"></div>
                    <div className="w-24 h-24 rounded-3xl bg-cyber-950/80 border border-cyber-800 flex items-center justify-center mb-6 shadow-2xl relative z-10">
                      <Lock size={40} className="text-red-500/50" />
                    </div>
                    <h3 className="text-xl font-bold text-white relative z-10 uppercase tracking-widest">Access Restricted</h3>
                    <p className="text-cyber-500 max-w-sm mt-3 relative z-10 leading-relaxed font-medium">
                      This path is currently encrypted. Reach out to your instructor or complete prerequisite modules to unlock this sector.
                    </p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
                  {/* Module Cards Wrapper */}
                  <div className="bg-cyber-900/20 border border-cyber-800/40 rounded-[2.5rem] p-8 md:p-10 shadow-inner">
                    <div className="space-y-12">
                      {/* Groups */}
                      {module.groups && module.groups.map(group => (
                        group.topics.length > 0 && (
                          <div key={group.id} className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary shadow-[0_0_10px_rgba(0,243,255,1)]"></div>
                              <h3 className="text-[13px] font-black text-cyber-500 uppercase tracking-[0.3em]">
                                {group.title}
                              </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {group.topics.map(topic => (
                                <TopicCard 
                                  key={topic.id} 
                                  topic={topic} 
                                  isCompleted={!!progressData[topic.id]} 
                                  sectionId={sectionId}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      ))}

                      {/* Ungrouped Topics */}
                      {module.ungroupedTopics && module.ungroupedTopics.length > 0 && (
                        <div className="space-y-6">
                           <div className="flex items-center gap-3 px-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyber-500"></div>
                              <h3 className="text-[13px] font-black text-cyber-500 uppercase tracking-[0.3em]">
                                General Intel
                              </h3>
                            </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {module.ungroupedTopics.map(topic => (
                              <TopicCard key={topic.id} topic={topic} isCompleted={!!progressData[topic.id]} sectionId={sectionId} />
                            ))}
                          </div>
                        </div>
                      )}

                      {(!module.groups?.length && !module.ungroupedTopics?.length) && (
                        <div className="py-20 text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border border-cyber-800 flex items-center justify-center text-cyber-700 mb-4 opacity-30">
                            <Box size={24} />
                          </div>
                          <p className="text-sm text-cyber-700 font-bold uppercase tracking-widest italic">Sector is empty.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
