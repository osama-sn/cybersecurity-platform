import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, FileText, ArrowLeft } from 'lucide-react';

const AdminModule = () => {
    const { moduleId } = useParams();
    const [moduleData, setModuleData] = useState(null); // 'module' is reserved keyword sometimes, safer to use moduleData
    const [topics, setTopics] = useState([]);
    const [newTopicTitle, setNewTopicTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!moduleId) return;
            const docRef = doc(db, 'modules', moduleId);
            const snap = await getDoc(docRef);
            if (snap.exists()) setModuleData({ id: snap.id, ...snap.data() });

            // Topics
            const q = query(collection(db, 'topics'), where('moduleId', '==', moduleId), orderBy('order', 'asc'));
            const topicSnap = await getDocs(q);
            setTopics(topicSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchData();
    }, [moduleId]);

    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim()) return;

        try {
            await addDoc(collection(db, 'topics'), {
                title: newTopicTitle,
                moduleId,
                order: topics.length,
                createdAt: serverTimestamp()
            });
            setNewTopicTitle('');
            window.location.reload();
        } catch (error) {
            console.error("Error adding topic:", error);
            alert("Failed to add topic: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete topic?")) return;
        await deleteDoc(doc(db, 'topics', id));
        window.location.reload();
    };

    if (!moduleData) return <div>Loading...</div>;

    // Use a link to go back to the section if we had the ID, but for now just back to admin dash or history
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => window.history.back()} className="flex items-center gap-2 text-cyber-400 hover:text-white mb-4">
                <ArrowLeft size={16} /> Back
            </button>

            <h1 className="text-3xl font-bold bg-cyber-800 p-4 rounded-lg border border-cyber-700">
                Module: {moduleData.title}
            </h1>

            <div className="card">
                <h3 className="text-xl font-bold mb-4">Topics</h3>

                <form onSubmit={handleAddTopic} className="flex gap-4 mb-6">
                    <input
                        className="input"
                        placeholder="New Topic Title..."
                        value={newTopicTitle}
                        onChange={e => setNewTopicTitle(e.target.value)}
                    />
                    <button className="btn btn-primary"><Plus /> Add</button>
                </form>

                <div className="space-y-2">
                    {topics.map(topic => (
                        <div key={topic.id} className="flex items-center justify-between p-3 bg-cyber-900 rounded border border-cyber-700">
                            <div className="flex items-center gap-3">
                                <FileText className="text-cyber-accent" size={20} />
                                <span className="font-medium text-white">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link to={`/admin/topics/${topic.id}`} className="text-sm text-cyber-primary hover:underline">Edit Content</Link>
                                <button onClick={() => handleDelete(topic.id)} className="text-cyber-danger hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {topics.length === 0 && <p className="text-cyber-500">No topics found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminModule;
