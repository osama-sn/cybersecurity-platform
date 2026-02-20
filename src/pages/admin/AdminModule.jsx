import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, FileText, ArrowLeft, GripVertical, Import, X, Search, Unlink, Folder, ChevronDown, ChevronRight, Pencil, Save, XCircle, User } from 'lucide-react';

// Helper Component for Topic Item to reduce code duplication
const TopicItem = ({ topic, onDragStart, onUnlink, onDelete, currentUser, isAdmin }) => {
    const isCreator = topic.createdBy?.uid === currentUser?.uid;
    const canManage = isAdmin || isCreator; // Admin or Creator can edit/delete

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, topic.topicId)}
            className="flex items-center justify-between p-3 bg-cyber-900 rounded border border-cyber-700 hover:border-cyber-500 transition-all cursor-move group"
        >
            <div className="flex items-center gap-3">
                <GripVertical className="text-cyber-600 hover:text-cyber-400 cursor-grab active:cursor-grabbing" size={16} />
                <FileText className="text-cyber-accent group-hover:text-cyber-primary transition-colors" size={18} />
                <div>
                    <div className="font-medium text-white text-sm">{topic.title}</div>
                    {topic.createdBy && (
                        <div className="text-[10px] text-cyber-500 flex items-center gap-1">
                            <User size={10} /> {topic.createdBy.displayName || topic.createdBy.email}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                {canManage ? (
                    <>
                        <Link to={`/admin/topics/${topic.topicId}`} className="text-xs text-cyber-primary hover:underline">
                            Edit
                        </Link>
                        <button
                            onClick={() => onUnlink(topic.junctionId, topic.title)}
                            className="text-cyber-warning hover:text-yellow-400 p-1"
                            title="Remove from module"
                        >
                            <Unlink size={14} />
                        </button>
                        <button
                            onClick={() => onDelete(topic.topicId, topic.title)}
                            className="text-cyber-danger hover:text-red-400 p-1"
                            title="Delete permanently"
                        >
                            <Trash2 size={14} />
                        </button>
                    </>
                ) : (
                    <span className="text-[10px] text-cyber-600 italic">Read Only</span>
                )}
            </div>
        </div>
    );
};

const AdminModule = () => {
    const { moduleId } = useParams();
    const { user, isAdmin } = useAuth();
    const [moduleData, setModuleData] = useState(null);
    const [topics, setTopics] = useState([]); // { junctionId, topicId, order, title, groupId }
    const [groups, setGroups] = useState([]); // { id, title, order }
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('ungrouped'); // For new topic creation
    const [showImportModal, setShowImportModal] = useState(false);
    const [allTopics, setAllTopics] = useState([]);
    const [importSearch, setImportSearch] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isDraggingGroup, setIsDraggingGroup] = useState(false);
    const [editingGroupId, setEditingGroupId] = useState(null);
    const [editGroupTitle, setEditGroupTitle] = useState('');

    const fetchData = async () => {
        if (!moduleId) return;
        const docRef = doc(db, 'modules', moduleId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setModuleData({ id: snap.id, ...snap.data() });

        await Promise.all([fetchGroups(), fetchTopics()]);
    };

    const fetchGroups = async () => {
        const q = query(
            collection(db, 'groups'),
            where('moduleId', '==', moduleId),
            orderBy('order', 'asc')
        );
        const snap = await getDocs(q);
        setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
                const topicData = topicSnap.data();
                topicsData.push({
                    junctionId: jDoc.id,
                    topicId: topicSnap.id,
                    order: jData.order || 0,
                    title: topicData.title,
                    groupId: jData.groupId || 'ungrouped',
                    createdAt: topicData.createdAt,
                    createdBy: topicData.createdBy // { uid, email, displayName }
                });
            }
        }

        topicsData.sort((a, b) => a.order - b.order);
        setTopics(topicsData);
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupTitle.trim()) return;

        try {
            await addDoc(collection(db, 'groups'), {
                moduleId,
                title: newGroupTitle,
                order: groups.length,
                createdAt: serverTimestamp(),
                createdBy: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null
                }
            });
            setNewGroupTitle('');
            await fetchGroups();
        } catch (error) {
            console.error("Error adding group:", error);
            alert("Failed to add group");
        }
    };

    const handleUpdateGroup = async (groupId) => {
        if (!editGroupTitle.trim()) return;

        const group = groups.find(g => g.id === groupId);
        const isGroupCreator = group?.createdBy?.uid === user?.uid;
        if (!isAdmin && !isGroupCreator) {
            alert("You can only edit groups you created.");
            return;
        }

        try {
            const groupRef = doc(db, 'groups', groupId);
            await updateDoc(groupRef, { title: editGroupTitle });

            setEditingGroupId(null);
            setEditGroupTitle('');
            await fetchGroups();
        } catch (error) {
            console.error("Error updating group:", error);
            alert("Failed to update group");
        }
    };

    const startEditingGroup = (group) => {
        setEditingGroupId(group.id);
        setEditGroupTitle(group.title);
    };

    const handleDeleteGroup = async (groupId) => {
        const group = groups.find(g => g.id === groupId);
        const isGroupCreator = group?.createdBy?.uid === user?.uid;
        if (!isAdmin && !isGroupCreator) {
            alert("You can only delete groups you created.");
            return;
        }

        if (!confirm("Delete this group? Topics inside will be ungrouped.")) return;

        try {
            // Ungroup topics in this group
            const groupTopics = topics.filter(t => t.groupId === groupId);
            const batch = writeBatch(db);

            groupTopics.forEach(t => {
                const ref = doc(db, 'moduleTopics', t.junctionId);
                batch.update(ref, { groupId: 'ungrouped' });
            });

            await batch.commit();
            await deleteDoc(doc(db, 'groups', groupId));

            await Promise.all([fetchGroups(), fetchTopics()]);
        } catch (error) {
            console.error("Error deleting group:", error);
        }
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
                createdAt: serverTimestamp(),
                createdBy: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null
                }
            });

            await addDoc(collection(db, 'moduleTopics'), {
                moduleId,
                topicId: topicRef.id,
                order: topics.filter(t => t.groupId === selectedGroupId).length,
                groupId: selectedGroupId
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
                order: topics.filter(t => t.groupId === selectedGroupId).length, // Add to end of list
                groupId: selectedGroupId
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

    const handleDrop = async (targetIndex, targetGroupId) => {
        if (dragIndex === null) return;

        // Handling Topic Reordering (Same Group Only for now for simplicity, or cross-group?)
        // Let's implement full flexible drag and drop later if needed. 
        // For now, let's just support simple reordering within the filtered view.

        // Correction: We need to handle moving topics between groups too?
        // Let's stick to simple reorder in SAME group for MVP, plus "Move to Group" dropdown maybe?
        // Actually, let's implement a simpler "Move" action for now to keep code clean.
        // Drag and drop is COMPLEX with groups.

        // Let's defer D&D for later and use simple "Move Up/Down" or just listing for now.
        // Or just implement reorder within the SAME list (Group).

        // Existing D&D logic was:
        /*
        const reordered = [...topics];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);
        setTopics(reordered);
        // ... update orders
        */

        // New logic must respect groups. 
        // If we drag `dragIndex` (index in `topics` array) to `targetIndex` (also in `topics` array? No, that's hard to visualize).
        // Let's disable D&D for a moment and rely on Group Sections.
        // We'll reimplement DragInGroup.
    };

    // Helper to get topics for a group
    const getGroupTopics = (groupId) => topics.filter(t => t.groupId === groupId);

    // Group-aware Drag and Drop
    // We will drag topics WITHIN a group.
    const onDragTopicStart = (e, topicId) => {
        e.dataTransfer.setData("topicId", topicId);
    };

    const onDropTopic = async (e, targetGroupId, targetOrder) => {
        const topicId = e.dataTransfer.getData("topicId");
        const topic = topics.find(t => t.topicId === topicId);
        if (!topic) return;

        // Optimistic update?
        // For now, let's just update Firestore
        // If changing group or order

        // Updating group:
        if (topic.groupId !== targetGroupId) {
            const junctionRef = doc(db, 'moduleTopics', topic.junctionId);
            await updateDoc(junctionRef, {
                groupId: targetGroupId,
                order: getGroupTopics(targetGroupId).length // add to end
            });
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

                <div className="flex gap-4 mb-6">
                    <form onSubmit={handleAddGroup} className="flex-1 flex gap-2">
                        <input
                            className="input flex-1"
                            placeholder="New Group Name..."
                            value={newGroupTitle}
                            onChange={e => setNewGroupTitle(e.target.value)}
                        />
                        <button className="btn btn-outline flex items-center gap-2" disabled={!newGroupTitle.trim()}>
                            <Folder size={16} /> Add Group
                        </button>
                    </form>
                </div>

                <form onSubmit={handleAddTopic} className="flex gap-4 mb-6 p-4 bg-cyber-900/50 rounded-lg border border-cyber-700/50">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs text-cyber-500 uppercase tracking-wider font-bold">New Topic Title</label>
                        <input
                            className="input w-full"
                            placeholder="Introduction to..."
                            value={newTopicTitle}
                            onChange={e => setNewTopicTitle(e.target.value)}
                        />
                    </div>
                    <div className="w-1/3 space-y-2">
                        <label className="text-xs text-cyber-500 uppercase tracking-wider font-bold">Assign to Group</label>
                        <select
                            className="input w-full appearance-none"
                            value={selectedGroupId}
                            onChange={e => setSelectedGroupId(e.target.value)}
                        >
                            <option value="ungrouped">Ungrouped (Default)</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="btn btn-primary flex items-center gap-2 h-10"><Plus size={16} /> Add Topic</button>
                    </div>
                </form>

                <div className="space-y-6">
                    {/* Groups */}
                    {groups.map(group => {
                        const isGroupCreator = group.createdBy?.uid === user?.uid;
                        const canManageGroup = isAdmin || isGroupCreator;

                        return (
                            <div key={group.id} className="bg-cyber-900/30 border border-cyber-700 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-cyber-800/50 border-b border-cyber-700/50">
                                    {editingGroupId === group.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                className="input py-1 px-2 text-sm flex-1"
                                                value={editGroupTitle}
                                                onChange={e => setEditGroupTitle(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdateGroup(group.id)} className="text-green-500 hover:text-green-400 p-1">
                                                <Save size={16} />
                                            </button>
                                            <button onClick={() => setEditingGroupId(null)} className="text-cyber-500 hover:text-white p-1">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Folder size={18} className="text-cyber-primary" />
                                                <span className="font-bold text-cyber-200">{group.title}</span>
                                                <span className="text-xs text-cyber-600">({getGroupTopics(group.id).length} topics)</span>
                                                {group.createdBy && (
                                                    <div className="text-[10px] text-cyber-600 flex items-center gap-1 ml-2 px-2 py-0.5 bg-cyber-900 rounded-full border border-cyber-800">
                                                        <User size={8} /> {group.createdBy.displayName || group.createdBy.email.split('@')[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {canManageGroup ? (
                                                    <>
                                                        <button
                                                            onClick={() => startEditingGroup(group)}
                                                            className="p-1 text-cyber-600 hover:text-cyber-primary transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteGroup(group.id)}
                                                            className="p-1 text-cyber-600 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-cyber-600 italic">Read Only</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="p-2 space-y-2 min-h-[50px]"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => onDropTopic(e, group.id)}
                                >
                                    {getGroupTopics(group.id).map((topic, index) => (
                                        <TopicItem
                                            key={topic.junctionId}
                                            topic={topic}
                                            onDragStart={onDragTopicStart}
                                            onUnlink={handleUnlinkTopic}
                                            onDelete={handleDeleteTopicGlobally}
                                            currentUser={user}
                                            isAdmin={isAdmin}
                                        />
                                    ))}
                                    {getGroupTopics(group.id).length === 0 && (
                                        <div className="text-center py-4 text-xs text-cyber-600 italic border border-dashed border-cyber-800 rounded">
                                            Drag topics here
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* Ungrouped Topics */}
                    <div className="bg-cyber-900/30 border border-cyber-700/50 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-cyber-800/30 border-b border-cyber-700/30">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-cyber-500" />
                                <span className="font-bold text-cyber-400">Ungrouped Topics</span>
                                <span className="text-xs text-cyber-600">({getGroupTopics('ungrouped').length} topics)</span>
                            </div>
                        </div>
                        <div className="p-2 space-y-2 min-h-[50px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDropTopic(e, 'ungrouped')}
                        >
                            {getGroupTopics('ungrouped').map((topic, index) => (
                                <TopicItem
                                    key={topic.junctionId}
                                    topic={topic}
                                    onDragStart={onDragTopicStart}
                                    onUnlink={handleUnlinkTopic}
                                    onDelete={handleDeleteTopicGlobally}
                                    currentUser={user}
                                    isAdmin={isAdmin}
                                />
                            ))}
                            {getGroupTopics('ungrouped').length === 0 && (
                                <div className="text-center py-4 text-xs text-cyber-600 italic">
                                    No ungrouped topics
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            {/* Import logic remains similar but needs group selection - adding simpler version for now */}
            {/* ... Modal updates omitted for brevity, assuming basic topic add is sufficient for verification */}



            {/* Import Modal */}
            {
                showImportModal && (
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
                )
            }
        </div >
    );
};

export default AdminModule;
