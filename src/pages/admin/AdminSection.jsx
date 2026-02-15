import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, Folder, ArrowLeft } from 'lucide-react';

const AdminSection = () => {
    const { sectionId } = useParams();
    const [section, setSection] = useState(null);
    const [modules, setModules] = useState([]);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!sectionId) return;
            const docRef = doc(db, 'sections', sectionId);
            const snap = await getDoc(docRef);
            if (snap.exists()) setSection({ id: snap.id, ...snap.data() });

            // Modules
            const q = query(collection(db, 'modules'), where('sectionId', '==', sectionId), orderBy('order', 'asc'));
            const modSnap = await getDocs(q);
            setModules(modSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchData();
    }, [sectionId]);

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;

        try {
            await addDoc(collection(db, 'modules'), {
                title: newModuleTitle,
                sectionId,
                order: modules.length,
                createdAt: serverTimestamp()
            });
            setNewModuleTitle('');
            window.location.reload();
        } catch (error) {
            console.error("Error adding module:", error);
            alert("Failed to add module: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete module?")) return;
        await deleteDoc(doc(db, 'modules', id));
        window.location.reload();
    };

    if (!section) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link to="/admin" className="flex items-center gap-2 text-cyber-400 hover:text-white mb-4">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold bg-cyber-800 p-4 rounded-lg border border-cyber-700">
                Section: {section.title}
            </h1>

            <div className="card">
                <h3 className="text-xl font-bold mb-4">Modules</h3>

                <form onSubmit={handleAddModule} className="flex gap-4 mb-6">
                    <input
                        className="input"
                        placeholder="New Module Title..."
                        value={newModuleTitle}
                        onChange={e => setNewModuleTitle(e.target.value)}
                    />
                    <button className="btn btn-primary"><Plus /> Add</button>
                </form>

                <div className="space-y-2">
                    {modules.map(mod => (
                        <div key={mod.id} className="flex items-center justify-between p-3 bg-cyber-900 rounded border border-cyber-700">
                            <div className="flex items-center gap-3">
                                <Folder className="text-cyber-secondary" size={20} />
                                <span className="font-medium text-white">{mod.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/admin/modules/${mod.id}`} className="text-sm text-cyber-primary hover:underline">Manage Topics</Link>
                                <button onClick={() => handleDelete(mod.id)} className="text-cyber-danger hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {modules.length === 0 && <p className="text-cyber-500">No modules found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminSection;
