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
    getUserProgress,
    loading,
    error
  };
};
