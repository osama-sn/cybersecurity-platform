import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';

/**
 * One-time migration: reads existing modules (with sectionId) and topics (with moduleId)
 * and creates junction documents in sectionModules and moduleTopics collections.
 * After migration, the sectionId/moduleId on the original docs are kept for reference
 * but the app will use junction collections for querying.
 */
export const migrateToJunctionCollections = async () => {
    const results = { sectionModules: 0, moduleTopics: 0, errors: [] };

    try {
        // 1. Migrate modules -> sectionModules
        const modulesSnap = await getDocs(collection(db, 'modules'));
        for (const moduleDoc of modulesSnap.docs) {
            const data = moduleDoc.data();
            if (data.sectionId) {
                // Check if junction already exists
                const existing = await getDocs(
                    query(collection(db, 'sectionModules'),
                        where('sectionId', '==', data.sectionId),
                        where('moduleId', '==', moduleDoc.id)
                    )
                );
                if (existing.empty) {
                    await addDoc(collection(db, 'sectionModules'), {
                        sectionId: data.sectionId,
                        moduleId: moduleDoc.id,
                        order: data.order || 0
                    });
                    results.sectionModules++;
                }
            }
        }

        // 2. Migrate topics -> moduleTopics
        const topicsSnap = await getDocs(collection(db, 'topics'));
        for (const topicDoc of topicsSnap.docs) {
            const data = topicDoc.data();
            if (data.moduleId) {
                // Check if junction already exists
                const existing = await getDocs(
                    query(collection(db, 'moduleTopics'),
                        where('moduleId', '==', data.moduleId),
                        where('topicId', '==', topicDoc.id)
                    )
                );
                if (existing.empty) {
                    await addDoc(collection(db, 'moduleTopics'), {
                        moduleId: data.moduleId,
                        topicId: topicDoc.id,
                        order: data.order || 0
                    });
                    results.moduleTopics++;
                }
            }
        }

        console.log('✅ Migration complete:', results);
        return results;
    } catch (error) {
        console.error('❌ Migration error:', error);
        results.errors.push(error.message);
        return results;
    }
};
