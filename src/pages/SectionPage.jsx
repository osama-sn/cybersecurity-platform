import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Box, ChevronRight, Lock } from 'lucide-react';

// Helper Component
const TopicCard = ({ topic }) => (
  <Link
    to={`/topics/${topic.id}`}
    className="bg-cyber-900/50 border border-cyber-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-cyber-800 hover:border-cyber-primary/50 transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-cyber-800 rounded border border-cyber-700 text-cyber-primary group-hover:bg-cyber-primary/10 transition-colors">
        <Box size={20} />
      </div>
      <span className="text-lg font-medium text-cyber-200 group-hover:text-white transition-colors">
        {topic.title}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <ChevronRight size={20} className="text-cyber-600 group-hover:text-cyber-primary group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

const SectionPage = () => {
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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

    } catch (err) {
      console.error('Error setting up listeners:', err);
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [sectionId]);

  if (loading) return <div>Loading...</div>;
  if (!section) return <div>Section not found</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Link to="/sections" className="text-cyber-500 hover:text-cyber-300 mb-2 inline-block">&larr; Back to Sections</Link>
        <h1 className="text-3xl font-bold text-white">{section.title}</h1>
        <p className="text-cyber-400 mt-2">{section.description}</p>
      </div>

      <div className="space-y-8">
        {modules.map((module) => (
          <div key={module.id} className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-4 mt-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cyber-primary rounded-full inline-block"></span>
              {module.title}
            </h2>

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
                        <TopicCard key={topic.id} topic={topic} />
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
          </div>
        ))}
      </div>
    </div>
  );
};



export default SectionPage;
