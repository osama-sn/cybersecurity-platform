import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { db } from '../../firebase/config';
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, Edit, Folder, FileText, Layers, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { sections } = useData();
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // Quick inline component for adding sections
    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionTitle.trim()) return;
        try {
            await addDoc(collection(db, 'sections'), {
                title: newSectionTitle,
                order: sections.length, // simple ordering
                createdAt: serverTimestamp()
            });
            setNewSectionTitle('');
        } catch (error) {
            console.error("Error adding section:", error);
            alert("Failed to add section: " + error.message);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm("Delete this section and all its contents? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'sections', id));
        } catch (error) {
            console.error("Error deleting section:", error);
        }
    };

    const handleEditSection = async (id, currentTitle) => {
        const newTitle = prompt("Enter new section title:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return;

        try {
            await updateDoc(doc(db, 'sections', id), {
                title: newTitle
            });
        } catch (error) {
            console.error("Error updating section:", error);
            alert("Failed to update section: " + error.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Content Structure</h2>
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
                    {sections.map(section => (
                        <SectionItem
                            key={section.id}
                            section={section}
                            onDelete={handleDeleteSection}
                            onEdit={handleEditSection}
                        />
                    ))}
                    {sections.length === 0 && <p className="text-center text-cyber-500">No sections yet.</p>}
                </div>
            </div>
        </div>
    );
};

const SectionItem = ({ section, onDelete, onEdit }) => {
    return (
        <div className="border border-cyber-600 rounded-lg p-4 bg-cyber-900/50">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Layers className="text-cyber-primary" size={20} />
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(section.id, section.title)}
                        className="p-1 hover:text-cyber-primary"
                        title="Edit Title"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(section.id)}
                        className="p-1 hover:text-cyber-danger"
                        title="Delete Section"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="pl-6 border-l border-cyber-700 ml-2 space-y-2">
                <div className="text-sm text-cyber-500 italic">
                    {/* Placeholder for stats or details */}
                </div>
                <Link to={`/admin/section/${section.id}`} className="text-xs text-cyber-primary hover:underline">
                    Manage Modules & Topics &rarr;
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
