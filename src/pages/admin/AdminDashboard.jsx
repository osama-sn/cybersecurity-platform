import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Plus, Trash2, Edit, Folder, Layers, GripVertical, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { migrateToJunctionCollections } from '../../utils/migrateData';

const AdminDashboard = () => {
    const { sections } = useData();
    const [isMigrating, setIsMigrating] = useState(false);
    const [localSections, setLocalSections] = useState(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({ title: '', descriptionEn: '', descriptionAr: '' });

    const displaySections = localSections || sections;

    const openModal = (section = null) => {
        setEditingSection(section);
        if (section) {
            setFormData({
                title: section.title,
                descriptionEn: section.descriptionEn || '',
                descriptionAr: section.descriptionAr || ''
            });
        } else {
            setFormData({ title: '', descriptionEn: '', descriptionAr: '' });
        }
        setShowModal(true);
    };

    const handleSaveSection = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        try {
            if (editingSection) {
                // Update
                await updateDoc(doc(db, 'sections', editingSection.id), {
                    title: formData.title,
                    descriptionEn: formData.descriptionEn,
                    descriptionAr: formData.descriptionAr
                });
            } else {
                // Create
                await addDoc(collection(db, 'sections'), {
                    title: formData.title,
                    descriptionEn: formData.descriptionEn,
                    descriptionAr: formData.descriptionAr,
                    order: sections.length,
                    createdAt: serverTimestamp()
                });
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error saving section:", error);
            alert("Failed to save section: " + error.message);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("Delete this section and all its module links? This cannot be undone.")) return;
        try {
            const smSnap = await getDocs(query(collection(db, 'sectionModules'), where('sectionId', '==', id)));
            for (const d of smSnap.docs) await deleteDoc(doc(db, 'sectionModules', d.id));
            await deleteDoc(doc(db, 'sections', id));
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };

    // Drag and drop reorder logic (same as before)
    const handleDragStart = (index) => setDragIndex(index);
    const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
    const handleDrop = async (index) => {
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        const reordered = [...displaySections];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);
        setLocalSections(reordered);
        setDragIndex(null);
        setDragOverIndex(null);
        try {
            for (let i = 0; i < reordered.length; i++) {
                await updateDoc(doc(db, 'sections', reordered[i].id), { order: i });
            }
            setLocalSections(null);
        } catch (error) {
            console.error("Error reordering sections:", error);
            setLocalSections(null);
        }
    };

    const handleMigrate = async () => {
        if (!window.confirm("Run data migration? This will create junction collection documents from existing module/topic relationships.")) return;
        setIsMigrating(true);
        try {
            const results = await migrateToJunctionCollections();
            alert(`Migration complete!\n\nCreated ${results.sectionModules} sectionModules\nCreated ${results.moduleTopics} moduleTopics`);
        } catch (error) {
            alert("Migration failed: " + error.message);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Content Structure</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleMigrate}
                        disabled={isMigrating}
                        className="btn btn-outline flex items-center gap-2 text-sm"
                    >
                        <Database size={16} /> Data Migration
                    </button>
                    <button onClick={() => openModal()} className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Add Section
                    </button>
                </div>
            </div>

            <div className="bg-cyber-800 p-6 rounded-lg border border-cyber-700">
                <div className="space-y-4">
                    {displaySections.map((section, index) => (
                        <div
                            key={section.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                            className={`border rounded-lg p-4 bg-cyber-900/50 transition-all cursor-move
                                ${dragOverIndex === index ? 'border-cyber-primary bg-cyber-800 scale-[1.01]' : 'border-cyber-600'}
                                ${dragIndex === index ? 'opacity-50' : 'opacity-100'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="text-cyber-600 hover:text-cyber-400 cursor-grab active:cursor-grabbing" size={16} />
                                    <Layers className="text-cyber-primary" size={20} />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{section.title}</h3>
                                        <div className="flex gap-4 text-xs text-cyber-400 mt-1">
                                            <span>🇺🇸 {section.descriptionEn || 'No EN desc'}</span>
                                            <span>🇸🇦 {section.descriptionAr || 'No AR desc'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openModal(section)}
                                        className="p-1 hover:text-cyber-primary"
                                        title="Edit Section"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="p-1 hover:text-cyber-danger"
                                        title="Delete Section"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="pl-6 border-l border-cyber-700 ml-2 pt-2">
                                <Link to={`/admin/section/${section.id}`} className="text-xs text-cyber-primary hover:underline flex items-center gap-1">
                                    <Folder size={12} /> Manage Modules & Topics &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                    {displaySections.length === 0 && <p className="text-center text-cyber-500">No sections yet.</p>}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-cyber-800 border border-cyber-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">{editingSection ? 'Edit Section' : 'Add New Section'}</h3>
                        <form onSubmit={handleSaveSection} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-1">Title</label>
                                <input
                                    className="input w-full"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Section Title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-1">Description (English)</label>
                                <textarea
                                    className="input w-full h-20 resize-none"
                                    value={formData.descriptionEn}
                                    onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    placeholder="Short description in English..."
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-1">Description (Arabic)</label>
                                <textarea
                                    className="input w-full h-20 resize-none"
                                    value={formData.descriptionAr}
                                    onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                                    placeholder="وصف قصير بالعربية..."
                                    dir="rtl"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingSection ? 'Save Changes' : 'Create Section'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
