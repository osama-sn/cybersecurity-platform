import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export const useProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Marks a specific topic as completed by the current user.
   * Creates or updates the progress document for the user.
   */
  const markTopicComplete = useCallback(async (sectionId, topicId) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);

      const now = serverTimestamp();
      
      if (!progressSnap.exists()) {
        // Create new progress document
        await setDoc(progressRef, {
          completedTopics: {
            [topicId]: {
              sectionId,
              completedAt: now
            }
          },
          lastActiveSection: sectionId,
          lastActiveTopic: topicId,
          updatedAt: now
        });
      } else {
        // Update existing document
        const currentData = progressSnap.data();
        const isAlreadyCompleted = currentData.completedTopics?.[topicId];

        if (!isAlreadyCompleted) {
          await updateDoc(progressRef, {
            [`completedTopics.${topicId}`]: {
              sectionId,
              completedAt: now
            },
            lastActiveSection: sectionId,
            lastActiveTopic: topicId,
            updatedAt: now
          });
        } else {
          // Just update the last active pointers
          await updateDoc(progressRef, {
            lastActiveSection: sectionId,
            lastActiveTopic: topicId,
            updatedAt: now
          });
        }
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error marking topic complete:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  }, [user]);

  /**
   * Updates the last accessed topic without marking it complete.
   * Useful for the "Resume" functionality.
   */
  const updateLastAccessed = useCallback(async (sectionId, topicId) => {
      if (!user) return;
      try {
          const progressRef = doc(db, 'userProgress', user.uid);
          const progressSnap = await getDoc(progressRef);
          
          if (!progressSnap.exists()) {
            await setDoc(progressRef, {
                completedTopics: {},
                lastActiveSection: sectionId,
                lastActiveTopic: topicId,
                updatedAt: serverTimestamp()
            });
          } else {
            await updateDoc(progressRef, {
                lastActiveSection: sectionId,
                lastActiveTopic: topicId,
                updatedAt: serverTimestamp()
            });
          }
      } catch (err) {
          console.error("Error updating last accessed:", err);
      }
  }, [user]);

  /**
   * Awards points to a user for a specific challenge block.
   * Ensures points are only awarded once per block.
   * Updates the `leaderboards` collection for the corresponding section.
   */
  const awardPoints = useCallback(async (sectionId, blockId, points) => {
    if (!user || !points || points <= 0) return false;

    // We don't set loading here to avoid UI flickering during background point updates
    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);
      
      let isAlreadyScored = false;
      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data.scoredBlocks?.[blockId]) {
          isAlreadyScored = true;
        }
      }

      if (!isAlreadyScored) {
        // 1. Mark as scored to prevent farming
        if (!progressSnap.exists()) {
          await setDoc(progressRef, {
            scoredBlocks: { [blockId]: true },
            updatedAt: serverTimestamp()
          }, { merge: true });
        } else {
          await updateDoc(progressRef, {
            [`scoredBlocks.${blockId}`]: true,
            updatedAt: serverTimestamp()
          });
        }

        // 2. Update Leaderboard Entry for this Section
        const leaderboardRef = doc(db, 'leaderboards', `${sectionId}_${user.uid}`);
        const lbSnap = await getDoc(leaderboardRef);

        const profileData = {
          displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
          photoURL: user.photoURL || '',
          email: user.email || ''
        };

        if (!lbSnap.exists()) {
          await setDoc(leaderboardRef, {
            userId: user.uid,
            sectionId: sectionId,
            score: points,
            ...profileData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          await updateDoc(leaderboardRef, {
            score: increment(points),
            ...profileData, // update their display info just in case
            updatedAt: serverTimestamp()
          });
        }
        
        return { success: true, pointsAwarded: points };
      }
      
      return { success: false, reason: 'already_scored' };
    } catch (err) {
      console.error('Error awarding points:', err);
      return { success: false, reason: 'error', error: err };
    }
  }, [user]);

  /**
   * Fetches the user's progress.
   */
  const getUserProgress = useCallback(async () => {
    if (!user) return null;

    try {
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        return progressSnap.data();
      }
      return { completedTopics: {} };
    } catch (err) {
      console.error('Error fetching progress:', err);
      return null;
    }
  }, [user]);

  return {
    markTopicComplete,
    updateLastAccessed,
    awardPoints,
    getUserProgress,
    loading,
    error
  };
};
