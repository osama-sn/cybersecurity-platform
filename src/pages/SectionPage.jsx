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
          const sectionData = { id: sectionSnap.id, ...sectionSnap.data() };
          console.log('✅ Section updated in real-time:', sectionData.title);
          setSection(sectionData);
        } else {
          console.error('Section not found:', sectionId);
          setSection(null);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error listening to section:', error);
        setLoading(false);
      });
      unsubscribers.push(unsubSection);

      // 2. Real-time listener for Modules
      const modulesRef = collection(db, 'modules');

      // First, let's see ALL modules in the database for debugging
      getDocs(modulesRef).then(allModulesSnap => {
        console.log('=== ALL MODULES IN DATABASE ===');
        allModulesSnap.docs.forEach(doc => {
          const data = doc.data();
          console.log(`Module: "${data.title}" | ID: ${doc.id} | sectionId: "${data.sectionId}"`);
        });
        console.log(`Current Section ID we're looking for: "${sectionId}"`);
        console.log('================================');
      });

      // Set up real-time listener for modules
      let modulesQuery;
      try {
        modulesQuery = query(modulesRef, where('sectionId', '==', sectionId), orderBy('order', 'asc'));
      } catch (orderError) {
        console.warn('OrderBy failed, using without order:', orderError);
        modulesQuery = query(modulesRef, where('sectionId', '==', sectionId));
      }

      const unsubModules = onSnapshot(modulesQuery, async (modulesSnap) => {
        console.log('Modules snapshot received:', modulesSnap.size);

        if (modulesSnap.size === 0) {
          console.error('❌ NO MODULES FOUND for sectionId:', sectionId);
          console.log('💡 TIP: Check if the sectionId in your modules matches the section ID in the URL');
          setModules([]);
          return;
        }

        const modulesData = await Promise.all(modulesSnap.docs.map(async (docSnap) => {
          const module = { id: docSnap.id, ...docSnap.data() };
          console.log('Processing module:', module.title);

          // Fetch Topics for this module
          const topicsRef = collection(db, 'topics');
          let topicsQuery;

          try {
            topicsQuery = query(topicsRef, where('moduleId', '==', module.id), orderBy('order', 'asc'));
          } catch (topicOrderError) {
            console.warn('Topic orderBy failed, fetching without order:', topicOrderError);
            topicsQuery = query(topicsRef, where('moduleId', '==', module.id));
          }

          const topicsSnap = await getDocs(topicsQuery);
          module.topics = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));

          // Sort topics in memory
          module.topics.sort((a, b) => (a.order || 0) - (b.order || 0));

          console.log(`Module "${module.title}" has ${module.topics.length} topics`);
          return module;
        }));

        // Sort modules in memory
        modulesData.sort((a, b) => (a.order || 0) - (b.order || 0));

        console.log('✅ Total modules loaded in real-time:', modulesData.length);
        setModules(modulesData);
      }, (error) => {
        console.error('Error listening to modules:', error);
        console.error('Error details:', error.message, error.code);
        // Fallback without orderBy
        const fallbackQuery = query(modulesRef, where('sectionId', '==', sectionId));
        const unsubModulesFallback = onSnapshot(fallbackQuery, async (modulesSnap) => {
          const modulesData = await Promise.all(modulesSnap.docs.map(async (docSnap) => {
            const module = { id: docSnap.id, ...docSnap.data() };
            const topicsRef = collection(db, 'topics');
            const tq = query(topicsRef, where('moduleId', '==', module.id));
            const topicsSnap = await getDocs(tq);
            module.topics = topicsSnap.docs.map(t => ({ id: t.id, ...t.data() }));
            module.topics.sort((a, b) => (a.order || 0) - (b.order || 0));
            return module;
          }));
          modulesData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setModules(modulesData);
          console.log('✅ Modules loaded (fallback):', modulesData.length);
        });
        unsubscribers.push(unsubModulesFallback);
      });
      unsubscribers.push(unsubModules);

    } catch (err) {
      console.error('Error setting up real-time listeners:', err);
      console.error('Error details:', err.message, err.code);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('🔌 Unsubscribing from Section page listeners');
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
