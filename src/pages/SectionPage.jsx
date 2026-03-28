import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { Box, ChevronRight, Lock, ShieldX, CheckCircle, Play, Trophy } from 'lucide-react';
import LeaderboardView from '../components/LeaderboardView';

// Helper Component
const TopicCard = ({ topic, isCompleted }) => (
  <Link
    to={`/topics/${topic.id}`}
    className={`border rounded-lg p-4 flex items-center justify-between transition-all group
      ${isCompleted 
        ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40' 
        : 'bg-cyber-900/50 border-cyber-700/50 hover:bg-cyber-800 hover:border-cyber-primary/50'}
    `}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded border transition-colors
        ${isCompleted 
          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
          : 'bg-cyber-800 border-cyber-700 text-cyber-primary group-hover:bg-cyber-primary/10'}
      `}>
        {isCompleted ? <CheckCircle size={20} /> : <Box size={20} />}
      </div>
      <span className={`text-lg font-medium transition-colors
        ${isCompleted ? 'text-emerald-100/70 line-through decoration-emerald-500/30' : 'text-cyber-200 group-hover:text-white'}
      `}>
        {topic.title}
      </span>
    </div>
    <div className="flex items-center gap-3">
      {isCompleted && <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest px-2">Passed</span>}
      <ChevronRight size={20} className={`${isCompleted ? 'text-emerald-500/50' : 'text-cyber-600 group-hover:text-cyber-primary p-0'} transition-all`} />
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
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <Link to="/sections" className="text-cyber-500 hover:text-cyber-300 mb-4 inline-block font-mono text-sm tracking-wide">&larr; Back to Sections</Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">{section.title}</h1>
            <p className="text-cyber-400/80 mt-3 text-lg max-w-3xl leading-relaxed">{section.description}</p>
          </div>
          
          {/* Progress Overview Card */}
          {totalTopics > 0 && (
            <div className="shrink-0 w-full md:w-72 bg-cyber-900/50 border border-cyber-700/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyber-300 uppercase tracking-widest">Progress</span>
                <span className="text-2xl font-black text-cyber-primary">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-cyber-800 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-primary to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-cyber-500 mb-5">
                <span>{completedTopics} / {totalTopics} Topics Passed</span>
              </div>
              
              <Link 
                to={firstUncompletedTopicId ? `/topics/${firstUncompletedTopicId}` : "#"}
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all
                  ${progressPercentage === 100 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                    : 'bg-cyber-primary text-black hover:bg-white active:scale-95 shadow-[0_0_15px_rgba(0,243,255,0.3)]'}
                `}
              >
                {progressPercentage === 100 ? (
                  <><CheckCircle size={16} /> Section Completed</>
                ) : (
                  <><Play size={16} className="fill-black" /> {completedTopics === 0 ? 'Start Section' : 'Resume Learning'}</>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-cyber-800/80 mb-8 pt-4">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-4 border-b-2 font-bold tracking-wider uppercase text-sm transition-all
            ${activeTab === 'content' ? 'border-cyber-primary text-cyber-primary' : 'border-transparent text-cyber-500 hover:text-cyber-300'}
          `}
        >
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-4 border-b-2 font-bold tracking-wider uppercase text-sm transition-all flex items-center gap-2
            ${activeTab === 'leaderboard' ? 'border-yellow-400 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'border-transparent text-cyber-500 hover:text-cyber-300'}
          `}
        >
          <Trophy size={18} className={activeTab === 'leaderboard' ? 'text-yellow-400' : ''} />
          Leaderboard
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-8 animate-fade-in">
          {modules.map((module) => {
            const isLockedToStudent = module.isLocked && !isAdmin && !isSuperAdmin;
            
            return (
            <div key={module.id} className={`animate-fade-in-up ${module.isLocked ? 'opacity-80' : ''}`}>
              <h2 className="text-2xl font-bold text-white mb-4 mt-8 flex items-center gap-2">
                <span className={`w-1.5 h-6 rounded-full inline-block ${module.isLocked ? 'bg-red-500' : 'bg-cyber-primary'}`}></span>
                {module.title}
                {module.isLocked && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full ml-2">
                    <Lock size={12} /> {isAdmin || isSuperAdmin ? 'Hidden from Students' : 'Locked'}
                  </span>
                )}
              </h2>

              {isLockedToStudent ? (
                <div className="bg-cyber-900/30 border border-cyber-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyber-800 border border-cyber-700 flex items-center justify-center mb-4">
                    <Lock size={24} className="text-cyber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-cyber-300">Module Locked</h3>
                  <p className="text-sm text-cyber-500 max-w-sm mt-2">
                    This module is currently locked. Complete previous assignments or wait for the instructor to unlock it.
                  </p>
                </div>
              ) : (
              <div className="space-y-6">
                {/* Groups */}
              {module.groups && module.groups.map(group => (
                group.topics.length > 0 && (
                  <div key={group.id} className="ml-4 border-l-2 border-cyber-800 pl-4 space-y-3">
                    <h3 className="text-lg font-bold text-cyber-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyber-500"></div>
                      {group.title}
                    </h3>
                    <div className="grid gap-3">
                      {group.topics.map(topic => (
                        <TopicCard 
                          key={topic.id} 
                          topic={topic} 
                          isCompleted={!!progressData[topic.id]} 
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* Ungrouped Topics */}
              <div className="grid gap-3">
                {module.ungroupedTopics && module.ungroupedTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>

              {(!module.groups?.length && !module.ungroupedTopics?.length) && (
                <p className="text-sm text-cyber-600 italic px-1">No topics yet.</p>
              )}
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
  );
};



export default SectionPage;
