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
    const [formData, setFormData] = useState({ title: '', descriptionEn: '', descriptionAr: '', themeColor: 'primary' });

    const displaySections = localSections || sections;

    const THEME_COLORS = [
        { id: 'primary', bg: 'bg-cyber-primary', border: 'border-cyber-primary', label: 'Green' },
        { id: 'secondary', bg: 'bg-cyber-secondary', border: 'border-cyber-secondary', label: 'Blue' },
        { id: 'accent', bg: 'bg-cyber-accent', border: 'border-cyber-accent', label: 'Cyan' },
        { id: 'danger', bg: 'bg-cyber-danger', border: 'border-cyber-danger', label: 'Red' },
        { id: 'warning', bg: 'bg-cyber-warning', border: 'border-cyber-warning', label: 'Orange' },
        { id: 'purple', bg: 'bg-indigo-500', border: 'border-indigo-500', label: 'Purple' },
    ];

    const openModal = (section = null) => {
        setEditingSection(section);
        if (section) {
            setFormData({
                title: section.title,
                descriptionEn: section.descriptionEn || '',
                descriptionAr: section.descriptionAr || '',
                themeColor: section.themeColor || 'primary'
            });
        } else {
            setFormData({ title: '', descriptionEn: '', descriptionAr: '', themeColor: 'primary' });
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
                    descriptionAr: formData.descriptionAr,
                    themeColor: formData.themeColor
                });
            } else {
                // Create
                await addDoc(collection(db, 'sections'), {
                    title: formData.title,
                    descriptionEn: formData.descriptionEn,
                    descriptionAr: formData.descriptionAr,
                    themeColor: formData.themeColor,
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

            <div className="bg-cyber-800 p-6 rounded-lg border border-cyber-700 min-h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displaySections.map((section, index) => {
                        const themeColorObj = THEME_COLORS.find(c => c.id === (section.themeColor || 'primary')) || THEME_COLORS[0];

                        return (
                            <div
                                key={section.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                                className={`
                                relative group flex flex-col bg-cyber-900 rounded-xl border-t-4 shadow-lg transition-all cursor-move overflow-hidden
                                ${dragOverIndex === index ? 'scale-[1.02] z-10' : ''}
                                ${dragIndex === index ? 'opacity-50' : 'opacity-100'}
                                hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]
                            `}
                                style={{ borderColor: themeColorObj.id === 'white' ? '#fff' : undefined }} // Fallback if needed, but classes handle it mostly
                            >
                                {/* Theme Color Indicator Border */}
                                <div className={`absolute top-0 left-0 right-0 h-1 ${themeColorObj.bg}`} />

                                <div className="p-5 flex-1 flex flex-col space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-cyber-950 border border-cyber-800 group-hover:border-cyber-700 transition-colors`}>
                                                <Layers className={`text-cyber-400`} size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight">{section.title}</h3>
                                                <span className={`text-[10px] uppercase font-bold tracking-wider opacity-60 ${themeColorObj.id === 'danger' ? 'text-red-400' : 'text-cyber-400'}`}>
                                                    {themeColorObj.label} Theme
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-cyber-950/50 rounded-lg p-1 border border-cyber-800">
                                            <button
                                                onClick={() => openModal(section)}
                                                className="p-1.5 text-cyber-400 hover:text-white hover:bg-cyber-800 rounded-md transition-colors"
                                                title="Edit Section"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="p-1.5 text-cyber-400 hover:text-red-400 hover:bg-cyber-800 rounded-md transition-colors"
                                                title="Delete Section"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="w-px h-4 bg-cyber-700 mx-1"></div>
                                            <div className="cursor-grab active:cursor-grabbing p-1.5 text-cyber-500 hover:text-cyber-300">
                                                <GripVertical size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-3 bg-cyber-950/30 rounded-lg p-3 border border-cyber-800/50">
                                        <div className="flex gap-3 items-start">
                                            <span className="text-sm select-none grayscale opacity-70">🇺🇸</span>
                                            <p className="text-sm text-cyber-300 line-clamp-2 leading-relaxed">
                                                {section.descriptionEn || <span className="text-cyber-600 italic">No English description</span>}
                                            </p>
                                        </div>
                                        <div className="w-full h-px bg-cyber-800/50"></div>
                                        <div className="flex gap-3 items-start" dir="rtl">
                                            <span className="text-sm select-none grayscale opacity-70">🇸🇦</span>
                                            <p className="text-sm text-cyber-300 line-clamp-2 leading-relaxed font-arabic">
                                                {section.descriptionAr || <span className="text-cyber-600 italic">لا يوجد وصف عربي</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-3 bg-cyber-950 border-t border-cyber-800 flex justify-between items-center group-hover:bg-cyber-900/80 transition-colors">
                                    <span className="text-[10px] text-cyber-600 font-mono">ID: {section.order + 1}</span>
                                    <Link
                                        to={`/admin/section/${section.id}`}
                                        className={`text-xs font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                                        hover:bg-cyber-800 ${themeColorObj.id === 'danger' ? 'text-red-400' : 'text-cyber-primary'}
                                    `}
                                    >
                                        <Folder size={14} />
                                        Manage Content
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                    {displaySections.length === 0 && <p className="col-span-full text-center text-cyber-500 py-12">No sections yet.</p>}
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
                            <div>
                                <label className="block text-sm font-medium text-cyber-300 mb-2">Theme Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {THEME_COLORS.map(color => (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, themeColor: color.id })}
                                            className={`
                                                w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center
                                                ${color.bg}
                                                ${formData.themeColor === color.id ? 'border-white ring-2 ring-white/20 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}
                                            `}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
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
