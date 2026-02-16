import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, FileText, ArrowLeft, GripVertical, Import, X, Search, Unlink } from 'lucide-react';

const AdminModule = () => {
    const { moduleId } = useParams();
    const [moduleData, setModuleData] = useState(null);
    const [topics, setTopics] = useState([]); // { junctionId, topicId, order, title }
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [allTopics, setAllTopics] = useState([]);
    const [importSearch, setImportSearch] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const fetchData = async () => {
        if (!moduleId) return;
        const docRef = doc(db, 'modules', moduleId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setModuleData({ id: snap.id, ...snap.data() });

        await fetchTopics();
    };

    const fetchTopics = async () => {
        const junctionQ = query(
            collection(db, 'moduleTopics'),
            where('moduleId', '==', moduleId),
            orderBy('order', 'asc')
        );

        let junctionSnap;
        try {
            junctionSnap = await getDocs(junctionQ);
        } catch {
            const fallbackQ = query(
                collection(db, 'moduleTopics'),
                where('moduleId', '==', moduleId)
            );
            junctionSnap = await getDocs(fallbackQ);
        }

        const topicsData = [];
        for (const jDoc of junctionSnap.docs) {
            const jData = jDoc.data();
            const topicRef = doc(db, 'topics', jData.topicId);
            const topicSnap = await getDoc(topicRef);
            if (topicSnap.exists()) {
                topicsData.push({
                    junctionId: jDoc.id,
                    topicId: topicSnap.id,
                    order: jData.order || 0,
                    title: topicSnap.data().title,
                    createdAt: topicSnap.data().createdAt,
                });
            }
        }

        topicsData.sort((a, b) => a.order - b.order);
        setTopics(topicsData);
    };

    useEffect(() => {
        fetchData();
    }, [moduleId]);

    // Create a brand new topic + link it to this module
    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            const topicRef = await addDoc(collection(db, 'topics'), {
                title: newTopicTitle,
                createdAt: serverTimestamp()
            });

            await addDoc(collection(db, 'moduleTopics'), {
                moduleId,
                topicId: topicRef.id,
                order: topics.length
            });

            setNewTopicTitle('');
            await fetchTopics();
        } catch (error) {
            console.error("Error adding topic:", error);
            alert("Failed to add topic: " + error.message);
        }
    };

    // Remove topic from this module only
    const handleUnlinkTopic = async (junctionId, topicTitle) => {
        if (!window.confirm(`Remove "${topicTitle}" from this module?\n\nThe topic will still exist in other modules where it's linked.`)) return;
        try {
            await deleteDoc(doc(db, 'moduleTopics', junctionId));
            await fetchTopics();
        } catch (error) {
            console.error("Error unlinking topic:", error);
        }
    };

    // Delete topic globally
    const handleDeleteTopicGlobally = async (topicId, topicTitle) => {
        if (!window.confirm(`⚠️ PERMANENTLY DELETE "${topicTitle}" from ALL modules?\n\nThis will also delete all content blocks for this topic. This cannot be undone.`)) return;
        try {
            // Delete all moduleTopics junctions for this topic
            const mtSnap = await getDocs(query(collection(db, 'moduleTopics'), where('topicId', '==', topicId)));
            for (const d of mtSnap.docs) await deleteDoc(doc(db, 'moduleTopics', d.id));

            // Delete all content blocks for this topic
            const cbSnap = await getDocs(query(collection(db, 'contentBlocks'), where('topicId', '==', topicId)));
            for (const d of cbSnap.docs) await deleteDoc(doc(db, 'contentBlocks', d.id));

            // Delete the topic itself
            await deleteDoc(doc(db, 'topics', topicId));
            await fetchTopics();
        } catch (error) {
            console.error("Error deleting topic globally:", error);
        }
    };

    // Import existing topic into this module
    const handleImportTopic = async (topicId) => {
        try {
            const existing = await getDocs(
                query(collection(db, 'moduleTopics'),
                    where('moduleId', '==', moduleId),
                    where('topicId', '==', topicId)
                )
            );
            if (!existing.empty) {
                alert("This topic is already in this module.");
                return;
            }

            await addDoc(collection(db, 'moduleTopics'), {
                moduleId,
                topicId,
                order: topics.length
            });

            setShowImportModal(false);
            setImportSearch('');
            await fetchTopics();
        } catch (error) {
            console.error("Error importing topic:", error);
        }
    };

    const openImportModal = async () => {
        const snap = await getDocs(collection(db, 'topics'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllTopics(all);
        setShowImportModal(true);
    };

    // Drag and drop
    const handleDragStart = (index) => setDragIndex(index);
    const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };

    const handleDrop = async (index) => {
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...topics];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);

        setTopics(reordered);
        setDragIndex(null);
        setDragOverIndex(null);

        try {
            for (let i = 0; i < reordered.length; i++) {
                await updateDoc(doc(db, 'moduleTopics', reordered[i].junctionId), { order: i });
            }
        } catch (error) {
            console.error("Error reordering:", error);
            await fetchTopics();
        }
    };

    const linkedTopicIds = new Set(topics.map(t => t.topicId));
    const availableTopics = allTopics
        .filter(t => !linkedTopicIds.has(t.id))
        .filter(t => t.title.toLowerCase().includes(importSearch.toLowerCase()));

    if (!moduleData) return <div className="text-center py-20 animate-pulse">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-cyber-400 hover:text-white mb-4">
                <ArrowLeft size={16} /> Back
            </button>

            <h1 className="text-3xl font-bold bg-cyber-800 p-4 rounded-lg border border-cyber-700">
                Module: {moduleData.title}
            </h1>

            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Topics</h3>
                    <button
                        onClick={openImportModal}
                        className="btn btn-outline flex items-center gap-2 text-sm"
                    >
                        <Import size={16} /> Import Existing Topic
                    </button>
                </div>

                <form onSubmit={handleAddTopic} className="flex gap-4 mb-6">
                    <input
                        className="input flex-1"
                        placeholder="New Topic Title..."
                        value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                    />
                    <button className="btn btn-primary flex items-center gap-2"><Plus size={16} /> Create New</button>
                </form>

                <div className="space-y-2">
                    {topics.map((topic, index) => (
                        <div
                            key={topic.junctionId}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                            className={`flex items-center justify-between p-3 bg-cyber-900 rounded border transition-all cursor-move
                                ${dragOverIndex === index ? 'border-cyber-primary bg-cyber-800 scale-[1.02]' : 'border-cyber-700'}
                                ${dragIndex === index ? 'opacity-50' : 'opacity-100'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical className="text-cyber-600 hover:text-cyber-400 cursor-grab active:cursor-grabbing" size={16} />
                                <FileText className="text-cyber-accent" size={20} />
                                <span className="font-medium text-white">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/admin/topics/${topic.topicId}`} className="text-sm text-cyber-primary hover:underline">
                                    Edit Content
                                </Link>
                                <button
                                    onClick={() => handleUnlinkTopic(topic.junctionId, topic.title)}
                                    className="text-cyber-warning hover:text-yellow-400 p-1"
                                    title="Remove from this module (keeps topic)"
                                >
                                    <Unlink size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTopicGlobally(topic.topicId, topic.title)}
                                    className="text-cyber-danger hover:text-red-400 p-1"
                                    title="Delete topic permanently from all modules"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {topics.length === 0 && <p className="text-cyber-500 text-center py-4">No topics yet. Create one or import an existing topic.</p>}
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-cyber-800 border border-cyber-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-cyber-700">
                            <h3 className="text-xl font-bold text-white">Import Topic</h3>
                            <button onClick={() => { setShowImportModal(false); setImportSearch(''); }} className="text-cyber-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-500" />
                                <input
                                    className="input pl-10 w-full"
                                    placeholder="Search topics..."
                                    value={importSearch}
                                    onChange={e => setImportSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4 pt-0 space-y-2">
                            {availableTopics.length === 0 ? (
                                <p className="text-cyber-500 text-center py-8">
                                    {allTopics.length === linkedTopicIds.size
                                        ? "All topics are already in this module."
                                        : "No matching topics found."}
                                </p>
                            ) : (
                                availableTopics.map(topic => (
                                    <button
                                        key={topic.id}
                                        onClick={() => handleImportTopic(topic.id)}
                                        className="w-full flex items-center gap-3 p-3 bg-cyber-900 rounded border border-cyber-700 hover:border-cyber-primary hover:bg-cyber-800 transition-all text-left"
                                    >
                                        <FileText className="text-cyber-accent" size={18} />
                                        <span className="text-white font-medium">{topic.title}</span>
                                        <span className="ml-auto text-xs text-cyber-500">Click to import</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminModule;
