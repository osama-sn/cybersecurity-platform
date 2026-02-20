import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Plus, Folder, ArrowLeft, GripVertical, Import, X, Search, Unlink, User } from 'lucide-react';

const AdminSection = () => {
    const { sectionId } = useParams();
    const { user, isAdmin, userData } = useAuth();
    const [section, setSection] = useState(null);
    const [modules, setModules] = useState([]); // { junctionId, moduleId, order, title, createdBy }
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [allModules, setAllModules] = useState([]);
    const [importSearch, setImportSearch] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const canManageSection = isAdmin || userData?.allowedSections?.includes(sectionId);

    const fetchData = async () => {
        if (!sectionId) return;

        // Fetch section
        const docRef = doc(db, 'sections', sectionId);
        const snap = await getDoc(docRef);
        if (snap.exists()) setSection({ id: snap.id, ...snap.data() });

        // Fetch modules via junction
        await fetchModules();
    };

    const fetchModules = async () => {
        const junctionQ = query(
            collection(db, 'sectionModules'),
            where('sectionId', '==', sectionId),
            orderBy('order', 'asc')
        );

        let junctionSnap;
        try {
            junctionSnap = await getDocs(junctionQ);
        } catch {
            // Fallback without orderBy if index not ready
            const fallbackQ = query(
                collection(db, 'sectionModules'),
                where('sectionId', '==', sectionId)
            );
            junctionSnap = await getDocs(fallbackQ);
        }

        const modulesData = [];
        for (const jDoc of junctionSnap.docs) {
            const jData = jDoc.data();
            const moduleRef = doc(db, 'modules', jData.moduleId);
            const moduleSnap = await getDoc(moduleRef);
            if (moduleSnap.exists()) {
                const modData = moduleSnap.data();
                modulesData.push({
                    junctionId: jDoc.id,
                    moduleId: moduleSnap.id,
                    order: jData.order || 0,
                    title: modData.title,
                    createdAt: modData.createdAt,
                    createdBy: modData.createdBy // { uid, email, displayName }
                });
            }
        }

        modulesData.sort((a, b) => a.order - b.order);
        setModules(modulesData);
    };

    useEffect(() => {
        fetchData();
    }, [sectionId, user]); // Re-fetch if user/permissions change (though unlikely to change mid-session)

    // Create a brand new module + link it to this section
    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;
        if (!canManageSection) return;

        try {
            const moduleRef = await addDoc(collection(db, 'modules'), {
                title: newModuleTitle,
                createdAt: serverTimestamp(),
                createdBy: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null
                }
            });

            await addDoc(collection(db, 'sectionModules'), {
                sectionId,
                moduleId: moduleRef.id,
                order: modules.length
            });

            setNewModuleTitle('');
            await fetchModules();
        } catch (error) {
            console.error("Error adding module:", error);
            alert("Failed to add module: " + error.message);
        }
    };

    // Remove module from this section only (unlink junction)
    const handleUnlinkModule = async (junctionId, moduleTitle) => {
        // Can unlink if admin or if they have access to this section (conceptually they can remove things from their section)
        if (!canManageSection) return;

        if (!window.confirm(`Remove "${moduleTitle}" from this section?\n\nThe module will still exist in other sections where it's linked.`)) return;
        try {
            await deleteDoc(doc(db, 'sectionModules', junctionId));
            await fetchModules();
        } catch (error) {
            console.error("Error unlinking module:", error);
        }
    };

    // Import existing module into this section
    const handleImportModule = async (moduleId) => {
        if (!canManageSection) return;

        try {
            // Check if already linked
            const existing = await getDocs(
                query(collection(db, 'sectionModules'),
                    where('sectionId', '==', sectionId),
                    where('moduleId', '==', moduleId)
                )
            );
            if (!existing.empty) {
                alert("This module is already in this section.");
                return;
            }

            await addDoc(collection(db, 'sectionModules'), {
                sectionId,
                moduleId,
                order: modules.length
            });

            setShowImportModal(false);
            setImportSearch('');
            await fetchModules();
        } catch (error) {
            console.error("Error importing module:", error);
        }
    };

    // Fetch all modules for import picker
    const openImportModal = async () => {
        const snap = await getDocs(collection(db, 'modules'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllModules(all);
        setShowImportModal(true);
    };

    // Drag and drop reorder
    const handleDragStart = (index) => {
        if (!canManageSection) return;
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (!canManageSection) return;
        setDragOverIndex(index);
    };

    const handleDrop = async (index) => {
        if (!canManageSection || dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...modules];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);

        // Update local state immediately for responsiveness
        setModules(reordered);
        setDragIndex(null);
        setDragOverIndex(null);

        // Persist new order to Firestore
        try {
            for (let i = 0; i < reordered.length; i++) {
                await updateDoc(doc(db, 'sectionModules', reordered[i].junctionId), { order: i });
            }
        } catch (error) {
            console.error("Error reordering:", error);
            await fetchModules(); // revert on error
        }
    };

    // Filter modules for import (exclude already linked)
    const linkedModuleIds = new Set(modules.map(m => m.moduleId));
    const availableModules = allModules
        .filter(m => !linkedModuleIds.has(m.id))
        .filter(m => m.title.toLowerCase().includes(importSearch.toLowerCase()));

    if (!section) return <div className="text-center py-20 animate-pulse">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/admin" className="flex items-center gap-2 text-cyber-400 hover:text-white mb-4">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold bg-cyber-800 p-4 rounded-lg border border-cyber-700">
                Section: {section.title}
            </h1>

            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Modules</h3>
                    {canManageSection && (
                        <button
                            onClick={openImportModal}
                            className="btn btn-outline flex items-center gap-2 text-sm"
                        >
                            <Import size={16} /> Import Existing Module
                        </button>
                    )}
                </div>

                {canManageSection && (
                    <form onSubmit={handleAddModule} className="flex gap-4 mb-6">
                        <input
                            className="input flex-1"
                            placeholder="New Module Title..."
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                        />
                        <button className="btn btn-primary flex items-center gap-2"><Plus size={16} /> Create New</button>
                    </form>
                )}

                <div className="space-y-2">
                    {modules.map((mod, index) => {
                        const isCreator = mod.createdBy?.uid === user?.uid;
                        const canEditModule = isAdmin || isCreator;

                        // Even if user can manage section, they can ONLY edit the module itself if they created it (or are admin)
                        // However, they *can* always Unlink it from their section if they can manage the section (handled in handleUnlinkModule)

                        return (
                            <div
                                key={mod.junctionId}
                                draggable={canManageSection}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                                className={`flex items-center justify-between p-3 bg-cyber-900 rounded border transition-all 
                                    ${canManageSection ? 'cursor-move' : ''}
                                    ${dragOverIndex === index ? 'border-cyber-primary bg-cyber-800 scale-[1.02]' : 'border-cyber-700'}
                                    ${dragIndex === index ? 'opacity-50' : 'opacity-100'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    {canManageSection && (
                                        <GripVertical className="text-cyber-600 hover:text-cyber-400 cursor-grab active:cursor-grabbing" size={16} />
                                    )}
                                    <Folder className="text-cyber-secondary" size={20} />
                                    <div>
                                        <div className="font-medium text-white">{mod.title}</div>
                                        {mod.createdBy && (
                                            <div className="text-[10px] text-cyber-500 flex items-center gap-1">
                                                <User size={10} /> {mod.createdBy.displayName || mod.createdBy.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {canEditModule ? (
                                        <Link to={`/admin/modules/${mod.moduleId}`} className="text-sm text-cyber-primary hover:underline">
                                            Manage Topics
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-cyber-600 italic">Read Only</span>
                                    )}

                                    {canManageSection && (
                                        <button
                                            onClick={() => handleUnlinkModule(mod.junctionId, mod.title)}
                                            className="text-cyber-warning hover:text-yellow-400 p-1 transition-colors"
                                            title="Remove from this section (module is preserved)"
                                        >
                                            <Unlink size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {modules.length === 0 && <p className="text-cyber-500 text-center py-4">No modules yet.</p>}
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-cyber-800 border border-cyber-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-cyber-700">
                            <h3 className="text-xl font-bold text-white">Import Module</h3>
                            <button onClick={() => { setShowImportModal(false); setImportSearch(''); }} className="text-cyber-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-500" />
                                <input
                                    className="input pl-10 w-full"
                                    placeholder="Search modules..."
                                    value={importSearch}
                                    onChange={e => setImportSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-4 pt-0 space-y-2">
                            {availableModules.length === 0 ? (
                                <p className="text-cyber-500 text-center py-8">
                                    {allModules.length === linkedModuleIds.size
                                        ? "All modules are already in this section."
                                        : "No matching modules found."}
                                </p>
                            ) : (
                                availableModules.map(mod => (
                                    <button
                                        key={mod.id}
                                        onClick={() => handleImportModule(mod.id)}
                                        className="w-full flex items-center gap-3 p-3 bg-cyber-900 rounded border border-cyber-700 hover:border-cyber-primary hover:bg-cyber-800 transition-all text-left"
                                    >
                                        <Folder className="text-cyber-secondary" size={18} />
                                        <span className="text-white font-medium">{mod.title}</span>
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

export default AdminSection;
