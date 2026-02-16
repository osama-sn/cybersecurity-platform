import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Plus, Trash2, Edit, Folder, Layers, GripVertical, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { migrateToJunctionCollections } from '../../utils/migrateData';

const AdminDashboard = () => {
    const { sections } = useData();
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isMigrating, setIsMigrating] = useState(false);
    const [localSections, setLocalSections] = useState(null);

    const displaySections = localSections || sections;

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionTitle.trim()) return;
        try {
            await addDoc(collection(db, 'sections'), {
                title: newSectionTitle,
                order: sections.length,
                createdAt: serverTimestamp()
            });
            setNewSectionTitle('');
        } catch (error) {
            console.error("Error adding section:", error);
            alert("Failed to add section: " + error.message);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("Delete this section and all its module links? This cannot be undone.")) return;
        try {
            // Delete all sectionModules junctions for this section
            const smSnap = await getDocs(query(collection(db, 'sectionModules'), where('sectionId', '==', id)));
            for (const d of smSnap.docs) await deleteDoc(doc(db, 'sectionModules', d.id));

            await deleteDoc(doc(db, 'sections', id));
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };

    const handleEditSection = async (id, currentTitle) => {
        const newTitle = prompt("Enter new section title:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return;
        try {
            await updateDoc(doc(db, 'sections', id), { title: newTitle });
        } catch (error) {
            console.error("Error updating section:", error);
            alert("Failed to update section: " + error.message);
        }
    };

    // Drag and drop reorder
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
            setLocalSections(null); // Let DataContext take over again
        } catch (error) {
            console.error("Error reordering sections:", error);
            setLocalSections(null);
        }
    };

    const handleMigrate = async () => {
        if (!window.confirm("Run data migration? This will create junction collection documents from existing module/topic relationships. This is safe to run multiple times.")) return;
        setIsMigrating(true);
        try {
            const results = await migrateToJunctionCollections();
            alert(`Migration complete!\n\nCreated ${results.sectionModules} sectionModules junctions\nCreated ${results.moduleTopics} moduleTopics junctions\n${results.errors.length > 0 ? '\nErrors: ' + results.errors.join(', ') : ''}`);
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
                <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="btn btn-outline flex items-center gap-2 text-sm"
                >
                    <Database size={16} />
                    {isMigrating ? 'Migrating...' : 'Run Data Migration'}
                </button>
            </div>

            <div className="bg-cyber-800 p-6 rounded-lg border border-cyber-700">
                <form onSubmit={handleAddSection} className="flex gap-4 mb-8">
                    <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="New Section Title..."
                        className="input flex-1"
                    />
                    <button type="submit" className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Add Section
                    </button>
                </form>

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
                                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditSection(section.id, section.title)}
                                        className="p-1 hover:text-cyber-primary"
                                        title="Edit Title"
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

                            <div className="pl-6 border-l border-cyber-700 ml-2 space-y-2">
                                <Link to={`/admin/section/${section.id}`} className="text-xs text-cyber-primary hover:underline">
                                    Manage Modules & Topics &rarr;
                                </Link>
                            </div>
                        </div>
                    ))}
                    {displaySections.length === 0 && <p className="text-center text-cyber-500">No sections yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
