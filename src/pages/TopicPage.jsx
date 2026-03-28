import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useMode } from '../context/ModeContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgress } from '../hooks/useProgress';
import BlockRenderer from '../components/BlockRenderer';
import { ChevronRight, ChevronLeft, CheckCircle, User, Award } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { isLearningMode } = useMode();
  const { t, isRTL } = useLanguage();
  const { markTopicComplete, updateLastAccessed, getUserProgress, awardPoints } = useProgress();
  const contentRef = useRef(null);

  const [topic, setTopic] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextTopicId, setNextTopicId] = useState(null);
  
  // Progress state
  const [passedChallenges, setPassedChallenges] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const quizBlocks = blocks.filter(b => b.type === 'quiz');
  const totalChallenges = quizBlocks.length;
  const allPassed = totalChallenges > 0 && passedChallenges.size === totalChallenges;

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

  // Check if topic is already completed
  useEffect(() => {
    const checkProgress = async () => {
      const progress = await getUserProgress();
      if (progress?.completedTopics?.[topicId]) {
        setIsCompleted(true);
      }
    };
    checkProgress();
  }, [topicId, getUserProgress]);

  // Update last accessed
  useEffect(() => {
    if (topic && topic.sectionId) {
      updateLastAccessed(topic.sectionId, topicId);
    }
  }, [topic, topicId, updateLastAccessed]);

  // Handle challenge success
  const handleChallengeSuccess = useCallback((blockId, points = 0) => {
    setPassedChallenges(prev => {
      if (prev.has(blockId)) return prev; // Already handled

      const newSet = new Set(prev);
      newSet.add(blockId);

      // Award points in the background
      if (points > 0 && topic?.sectionId) {
        // Fire and forget, useProgress handles double-point prevention via Firestore
        awardPoints(topic.sectionId, blockId, points).catch(console.error);
      }

      return newSet;
    });
  }, [awardPoints, topic?.sectionId]);

  // Auto-complete if all challenges passed
  useEffect(() => {
    const completeTopic = async () => {
      if (allPassed && !isCompleted && topic?.sectionId) {
        const success = await markTopicComplete(topic.sectionId, topicId);
        if (success) {
          setIsCompleted(true);
        }
      }
    };
    completeTopic();
  }, [allPassed, isCompleted, topic, topicId, markTopicComplete]);

  const handleManualComplete = async () => {
    if (topic?.sectionId && !isCompleted) {
      await markTopicComplete(topic.sectionId, topicId);
    }
    
    if (nextTopicId) {
      navigate(`/topics/${nextTopicId}`);
    } else {
      navigate(-1);
    }
  };

  // Ctrl+A selects only the topic content, not the whole page
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (contentRef.current) {
          e.preventDefault();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(contentRef.current);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) return <div className="p-10 text-center animate-pulse">{t('topic.loading')}</div>;
  if (!topic) return <div className="p-10 text-center text-red-500">{t('topic.notFound')}</div>;

  return (
    <div ref={contentRef} className="max-w-3xl mx-auto pb-20 animate-fade-in select-text">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-cyber-500 mb-6 font-mono">
        <Link to="/sections" className="hover:text-cyber-primary">{t('topic.breadcrumb.sections')}</Link>
        {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        <span>{t('topic.breadcrumb.module')}</span>
        {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        <span className="text-cyber-primary">{topic.title}</span>
      </div>

      <div className="mb-10 border-b border-cyber-700 pb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{topic.title}</h1>
          {isCompleted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full shrink-0">
              <CheckCircle size={16} />
              <span className="text-xs font-bold tracking-wider uppercase">Passed</span>
            </div>
          )}
        </div>

        {topic.createdBy && (
          <div className="flex items-center gap-2 text-sm text-cyber-500 mb-4 font-mono">
            <User size={14} />
            <span>{isRTL ? 'بواسطة:' : 'Created by:'}</span>
            <span className="text-cyber-300">{topic.createdBy.displayName || topic.createdBy.email}</span>
          </div>
        )}

        {topic.description && <p className="text-cyber-400 text-lg">{topic.description}</p>}
      </div>

      <div className="space-y-2 select-text">
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
                onChallengeSuccess={handleChallengeSuccess}
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

      {/* Success Banner if All Challenges Passed */}
      {allPassed && !isCompleted && (
        <div className="mt-8 p-6 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg">Topic Passed!</h3>
              <p className="text-emerald-500/80 text-sm">You have successfully completed all challenges in this topic.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="mt-12 flex items-center justify-between border-t border-cyber-700 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline flex items-center gap-2 px-6"
        >
          {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          Back
        </button>

        {isLearningMode && (
          <button
            onClick={handleManualComplete}
            className={`btn flex items-center gap-2 px-8 ${isCompleted || allPassed ? 'btn-primary' : 'btn-outline border-cyber-700 text-cyber-400'}`}
          >
            {isCompleted || allPassed ? 'Next Topic' : 'Mark as Complete'}
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicPage;
