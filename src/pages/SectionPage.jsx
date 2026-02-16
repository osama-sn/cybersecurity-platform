import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Folder, FileText, ChevronRight, Lock } from 'lucide-react';

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
                topics.push({ id: topicSnap.id, ...topicSnap.data(), order: tJData.order || 0 });
              }
            }

            topics.sort((a, b) => a.order - b.order);
            moduleData.topics = topics;
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

      <div className="space-y-6">
        {modules.map((module) => (
          <div key={module.id} className="card bg-cyber-900 border border-cyber-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Folder className="text-cyber-secondary" size={20} />
              <h2 className="text-xl font-bold text-white">{module.title}</h2>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-cyber-700 ml-2">
              {module.topics && module.topics.map(topic => (
                <Link
                  key={topic.id}
                  to={`/topics/${topic.id}`}
                  className="flex items-center justify-between p-3 rounded hover:bg-cyber-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-cyber-500 group-hover:text-cyber-primary transition-colors" />
                    <span className="text-cyber-300 group-hover:text-white transition-colors">{topic.title}</span>
                  </div>
                  <ChevronRight size={16} className="text-cyber-600 group-hover:text-cyber-300" />
                </Link>
              ))}
              {(!module.topics || module.topics.length === 0) && (
                <p className="text-sm text-cyber-600 italic px-3">No topics yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionPage;
