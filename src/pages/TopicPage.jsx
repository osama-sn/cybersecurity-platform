import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext'; // We might need more specific fetching here
import { useMode } from '../context/ModeContext';
import { useLanguage } from '../context/LanguageContext';
import BlockRenderer from '../components/BlockRenderer'; // Ensure imports are correct
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isLearningMode } = useMode();
  const { t, isRTL } = useLanguage();

  const [topic, setTopic] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextTopicId, setNextTopicId] = useState(null);

  useEffect(() => {
    if (!topicId) return;

    setLoading(true);
    const unsubscribers = [];

    try {
      // 1. Real-time listener for Topic Details
      const topicRef = doc(db, 'topics', topicId);
      const unsubTopic = onSnapshot(topicRef, (topicSnap) => {
        if (topicSnap.exists()) {
          const topicData = topicSnap.data();
          setTopic({ id: topicSnap.id, ...topicData });
          console.log('✅ Topic updated in real-time:', topicData.title);
        } else {
          console.error("Topic not found");
          setTopic(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to topic:", error);
        setLoading(false);
      });
      unsubscribers.push(unsubTopic);

      // 2. Real-time listener for Content Blocks
      const blocksRef = collection(db, 'contentBlocks');

      // Try with orderBy first, fallback without it
      let blocksQuery;
      try {
        blocksQuery = query(blocksRef, where('topicId', '==', topicId), orderBy('order', 'asc'));
      } catch (orderError) {
        console.warn('OrderBy failed for blocks, using without order:', orderError);
        blocksQuery = query(blocksRef, where('topicId', '==', topicId));
      }

      const unsubBlocks = onSnapshot(blocksQuery, (blocksSnap) => {
        const blocksData = blocksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory if orderBy wasn't used
        blocksData.sort((a, b) => (a.order || 0) - (b.order || 0));

        setBlocks(blocksData);
        console.log(`✅ Content blocks updated in real-time: ${blocksData.length} blocks`);
      }, (error) => {
        console.error("Error listening to blocks:", error);
        // Fallback: try without orderBy
        const fallbackQuery = query(blocksRef, where('topicId', '==', topicId));
        const unsubBlocksFallback = onSnapshot(fallbackQuery, (blocksSnap) => {
          const blocksData = blocksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          blocksData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setBlocks(blocksData);
          console.log(`✅ Content blocks updated (fallback): ${blocksData.length} blocks`);
        });
        unsubscribers.push(unsubBlocksFallback);
      });
      unsubscribers.push(unsubBlocks);

      // 3. Find Next Topic (Simple placeholder logic)
      // In real app, we would query for the next topic with higher order in same module
      // or first topic of next module.

    } catch (err) {
      console.error("Error setting up real-time listeners:", err);
      setLoading(false);
    }

    // Cleanup function to unsubscribe from all listeners
    return () => {
      console.log('🔌 Unsubscribing from real-time listeners');
      unsubscribers.forEach(unsub => unsub());
    };
  }, [topicId]);

  const handleComplete = () => {
    // Mark completed in Firestore (UserProgress)
    // Navigate to next
    if (nextTopicId) {
      navigate(`/topics/${nextTopicId}`);
    } else {
      // Go back to module or section
      navigate(-1);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">{t('topic.loading')}</div>;
  if (!topic) return <div className="p-10 text-center text-red-500">{t('topic.notFound')}</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-cyber-500 mb-6 font-mono">
        <Link to="/sections" className="hover:text-cyber-primary">{t('topic.breadcrumb.sections')}</Link>
        {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        <span>{t('topic.breadcrumb.module')}</span>
        {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        <span className="text-cyber-primary">{topic.title}</span>
      </div>

      <div className="mb-10 border-b border-cyber-700 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{topic.title}</h1>
        {topic.description && <p className="text-cyber-400 text-lg">{topic.description}</p>}
      </div>

      <div className="space-y-2">
        {(() => {
          let listIndex = 0;
          return blocks.map((block, index) => {
            // Logic for numbered list grouping
            if (block.type === 'numbered') {
              listIndex++;
            } else {
              listIndex = 0;
            }

            // Handler for interactive blocks (like checkboxes)
            const handleUpdate = (blockId, newVal) => {
              setBlocks(prev => prev.map(b =>
                b.id === blockId ? { ...b, metadata: { ...b.metadata, checked: newVal } } : b
              ));
            };

            return (
              <BlockRenderer
                key={block.id}
                block={block}
                index={block.type === 'numbered' ? listIndex : undefined}
                onToggle={handleUpdate}
              />
            );
          });
        })()}

        {blocks.length === 0 && (
          <div className="p-6 border border-dashed border-cyber-700 rounded-lg text-center text-cyber-500">
            <p>{t('topic.noContent')}</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-20 flex items-center justify-between border-t border-cyber-700 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline flex items-center gap-2"
        >
          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {t('topic.prev')}
        </button>

        {isLearningMode && (
          <button
            onClick={handleComplete}
            className="btn btn-primary flex items-center gap-2 px-6"
          >
            {t('topic.next')}
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicPage;
