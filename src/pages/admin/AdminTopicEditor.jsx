import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Trash2, ArrowLeft, Move, Save, Type, Heading1, Code, Video, HelpCircle, Minus, Key, Lightbulb, CheckSquare, Hash, Play } from 'lucide-react';
import BlockRenderer from '../../components/BlockRenderer';

const AdminTopicEditor = () => {
    const { topicId } = useParams();
    const [topic, setTopic] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [newBlockType, setNewBlockType] = useState('text');
    const [newBlockContent, setNewBlockContent] = useState('');
    const [metadata, setMetadata] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!topicId) return;

        // 1. Fetch Topic
        const fetchTopic = async () => {
            const docRef = doc(db, 'topics', topicId);
            const snap = await getDoc(docRef);
            if (snap.exists()) setTopic({ id: snap.id, ...snap.data() });
        };
        fetchTopic();

        // 2. Real-time Blocks Listener
        const q = query(collection(db, 'contentBlocks'), where('topicId', '==', topicId), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBlocks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => {
            console.error("Blocks listener error:", err);
        });

        return () => unsubscribe();
    }, [topicId]);

    const handleAddBlock = async () => {
        const isContentRequired = newBlockType !== 'divider' && newBlockType !== 'quiz';
        if (isContentRequired && !newBlockContent) return;
        setIsSaving(true);

        let content = newBlockContent;
        let meta = { ...metadata };

        if (newBlockType === 'quiz') {
            meta = {
                challengeType: metadata.challengeType || 'multiple_choice',
                question: metadata.question || newBlockContent,
                hint: metadata.hint || "",
                explanation: metadata.explanation || "",
                ...(metadata.challengeType === 'flag' ? {
                    correctFlag: metadata.correctFlag || "",
                    flagPattern: metadata.flagPattern || "FLAG{...}"
                } : {
                    options: metadata.options || [],
                    correctAnswer: parseInt(metadata.correctAnswer) || 0
                })
            };
            content = "Challenge Block";
        }

        try {
            await addDoc(collection(db, 'contentBlocks'), {
                topicId,
                type: newBlockType,
                content,
                metadata: meta,
                order: blocks.length,
                createdAt: serverTimestamp()
            });

            setNewBlockContent('');
            setMetadata({});
        } catch (error) {
            console.error("Error adding block:", error);
            alert("Failed to add block: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete block?")) return;
        try {
            await deleteDoc(doc(db, 'contentBlocks', id));
        } catch (error) {
            console.error("Error deleting block:", error);
        }
    };

    const [showBlockSelector, setShowBlockSelector] = useState(false);

    if (!topic) return <div className="text-center py-20 animate-pulse">Establishing secure connection...</div>;

    const blockTypes = [
        { id: 'text', label: 'Rich Text', icon: <Type size={18} />, color: 'text-blue-400' },
        { id: 'heading', label: 'Heading', icon: <Heading1 size={18} />, color: 'text-purple-400' },
        { id: 'code', label: 'Code', icon: <Code size={18} />, color: 'text-green-400' },
        { id: 'youtube', label: 'Video', icon: <Video size={18} />, color: 'text-red-400' },
        { id: 'quiz', label: 'Challenge', icon: <Key size={18} />, color: 'text-yellow-400' },
        { id: 'tip', label: 'Tip', icon: <Plus size={18} />, color: 'text-cyber-primary' },
        { id: 'divider', label: 'Line', icon: <Minus size={18} />, color: 'text-cyber-500' },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-40 space-y-12 animate-fade-in px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cyber-700/50 pb-6">
                <div className="space-y-2">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-cyber-500 hover:text-cyber-primary transition-colors text-sm font-mono uppercase tracking-wider">
                        <ArrowLeft size={14} /> Back to Terminal
                    </button>
                    <h1 className="text-4xl font-bold text-white">Edit Topic: <span className="text-cyber-primary">{topic.title}</span></h1>
                    <p className="text-cyber-500 font-mono text-xs opacity-60">SEC-ID: {topicId}</p>
                </div>
            </div>

            {/* Content Pipeline */}
            <div className="space-y-4">
                <h2 className="text-cyber-500 uppercase tracking-[0.3em] text-[10px] font-bold opacity-70 ml-2">Secure Content Pipeline</h2>
                <div className="bg-cyber-900/30 border border-cyber-700/40 rounded-2xl p-4 md:p-8 min-h-[300px] shadow-2xl backdrop-blur-sm relative">
                    {blocks.map((block, idx) => (
                        <div key={block.id} className="relative group border-y border-transparent hover:border-cyber-700/20 transition-all py-4 first:pt-0 last:pb-0">
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col items-center gap-2 transition-all">
                                <span className="text-[10px] font-mono text-cyber-600">#{idx + 1}</span>
                                <button onClick={() => handleDelete(block.id)} className="p-2 bg-cyber-800/80 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg border border-red-500/20">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <BlockRenderer block={block} />
                        </div>
                    ))}

                    {/* The Interactive (+) Wizard Layer */}
                    <div className="mt-12 flex flex-col items-center gap-6">
                        {!showBlockSelector ? (
                            <button
                                onClick={() => {
                                    setShowBlockSelector(true);
                                    setNewBlockType(null); // Reset for new selection
                                }}
                                className="group flex items-center gap-3 px-6 py-3 rounded-full bg-cyber-800 border border-cyber-700 hover:border-cyber-primary transition-all shadow-xl hover:shadow-cyber-primary/10 active:scale-95"
                            >
                                <div className="w-8 h-8 rounded-full bg-cyber-900 flex items-center justify-center border border-cyber-700 group-hover:border-cyber-primary transition-all">
                                    <Plus size={18} className="text-cyber-500 group-hover:text-cyber-primary group-hover:rotate-180 transition-all duration-500" />
                                </div>
                                <span className="text-xs font-bold text-cyber-400 group-hover:text-white uppercase tracking-[0.2em]">Add Document Segment</span>
                            </button>
                        ) : (
                            <div className="w-full max-w-4xl animate-in zoom-in-95 fade-in duration-300">
                                <div className="bg-cyber-800 border-2 border-cyber-700 rounded-3xl p-6 md:p-10 space-y-10 shadow-2xl relative overflow-hidden min-h-[400px]">
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] animate-scanline"></div>

                                    <button
                                        onClick={() => setShowBlockSelector(false)}
                                        className="absolute top-6 right-6 text-cyber-500 hover:text-white transition-all hover:rotate-90 z-10"
                                    >
                                        <Plus size={24} className="rotate-45" />
                                    </button>

                                    {!newBlockType ? (
                                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="text-center relative">
                                                <h3 className="text-2xl font-bold text-white mb-2 italic">INITIALIZE SECURE SEGMENT</h3>
                                                <p className="text-[10px] text-cyber-500 uppercase tracking-[0.3em]">Select the structural protocol for this data injection</p>
                                            </div>

                                            {/* Step 1: Block Type Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 relative">
                                                {blockTypes.map(type => (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => {
                                                            setNewBlockType(type.id);
                                                            if (type.id === 'divider') {
                                                                // Special case for divider, maybe add instantly?
                                                            }
                                                        }}
                                                        className="flex flex-col items-center gap-4 p-5 rounded-2xl border-2 border-cyber-700 bg-cyber-900/40 hover:bg-cyber-primary/5 hover:border-cyber-primary transition-all group/btn shadow-lg"
                                                    >
                                                        <div className={`transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-6 ${type.color}`}>
                                                            {type.icon}
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyber-500 group-hover/btn:text-white">
                                                            {type.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {/* Header with Back Navigation */}
                                            <div className="flex items-center justify-between border-b border-cyber-700/50 pb-6 relative">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl bg-cyber-900 border border-cyber-700 shadow-inner ${blockTypes.find(t => t.id === newBlockType)?.color}`}>
                                                        {blockTypes.find(t => t.id === newBlockType)?.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">{newBlockType} Configuration</h3>
                                                        <button
                                                            onClick={() => setNewBlockType(null)}
                                                            className="text-[9px] text-cyber-500 hover:text-cyber-primary transition-colors uppercase tracking-widest flex items-center gap-1 mt-1 group-hover:translate-x-1"
                                                        >
                                                            <ArrowLeft size={10} /> Change Component Type
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Configuration Form */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                <div className="lg:col-span-2 space-y-8">
                                                    {newBlockType === 'code' && (
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Environment / Strategy</label>
                                                            <input
                                                                className="input bg-cyber-900 border-2 border-cyber-700 focus:border-green-500/50 transition-all font-mono text-sm py-4"
                                                                placeholder="bash, python, js, csharp..."
                                                                onChange={e => setMetadata({ ...metadata, language: e.target.value })}
                                                            />
                                                        </div>
                                                    )}

                                                    {newBlockType === 'heading' && (
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Hierarchy Level</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[1, 2, 3, 4, 5, 6].map(level => (
                                                                    <button
                                                                        key={level}
                                                                        onClick={() => setMetadata({ ...metadata, level })}
                                                                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all
                                                                            ${metadata.level === level ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-cyber-900 border-cyber-700 text-cyber-500 hover:border-cyber-500'}
                                                                        `}
                                                                    >
                                                                        H{level}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {newBlockType === 'quiz' && (
                                                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                                            {/* Challenge Type Selector */}
                                                            <div className="flex gap-4 p-1 bg-cyber-900 rounded-xl border border-cyber-700">
                                                                <button
                                                                    onClick={() => setMetadata({ ...metadata, challengeType: 'multiple_choice' })}
                                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                                                        ${(metadata.challengeType || 'multiple_choice') === 'multiple_choice' ? 'bg-cyber-primary text-black shadow-lg' : 'text-cyber-500 hover:text-white'}
                                                                    `}
                                                                >
                                                                    <CheckSquare size={14} /> Multiple Choice
                                                                </button>
                                                                <button
                                                                    onClick={() => setMetadata({ ...metadata, challengeType: 'flag' })}
                                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                                                        ${metadata.challengeType === 'flag' ? 'bg-cyber-primary text-black shadow-lg' : 'text-cyber-500 hover:text-white'}
                                                                    `}
                                                                >
                                                                    <Hash size={14} /> Flag Submission
                                                                </button>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Challenge Question</label>
                                                                <textarea
                                                                    className="input bg-cyber-900 border-2 border-cyber-700 h-24 font-mono text-sm leading-relaxed resize-none focus:border-cyber-primary transition-all p-4"
                                                                    placeholder="Describe the challenge or ask the question..."
                                                                    value={metadata.question || ''}
                                                                    onChange={e => setMetadata({ ...metadata, question: e.target.value })}
                                                                />
                                                            </div>

                                                            {metadata.challengeType === 'flag' ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Correct Flag</label>
                                                                        <input
                                                                            className="input bg-cyber-900 border-2 border-cyber-700 focus:border-cyber-primary transition-all font-mono text-sm py-4"
                                                                            placeholder="e.g. FLAG{s3cur3_p4y1o4d}"
                                                                            value={metadata.correctFlag || ''}
                                                                            onChange={e => setMetadata({ ...metadata, correctFlag: e.target.value })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Flag Hint/Pattern</label>
                                                                        <input
                                                                            className="input bg-cyber-900 border-2 border-cyber-700 focus:border-cyber-primary transition-all font-mono text-sm py-4"
                                                                            placeholder="e.g. FLAG{********}"
                                                                            value={metadata.flagPattern || ''}
                                                                            onChange={e => setMetadata({ ...metadata, flagPattern: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-6">
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Success Criteria (Options - comma separated)</label>
                                                                        <input
                                                                            className="input bg-cyber-900 border-2 border-cyber-700 focus:border-cyber-primary transition-all font-mono text-sm py-4"
                                                                            placeholder="Option A, Option B, Option C..."
                                                                            value={(metadata.options || []).join(', ')}
                                                                            onChange={e => setMetadata({ ...metadata, options: e.target.value.split(',').map(s => s.trim()) })}
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Correct Key Index (0-based)</label>
                                                                        <input
                                                                            type="number"
                                                                            className="input bg-cyber-900 border-2 border-cyber-700 focus:border-cyber-primary transition-all font-mono text-sm py-4"
                                                                            placeholder="0, 1, 2..."
                                                                            value={metadata.correctAnswer || ''}
                                                                            onChange={e => setMetadata({ ...metadata, correctAnswer: e.target.value })}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cyber-700/50">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 ml-1">
                                                                        <Lightbulb size={12} className="text-amber-500" />
                                                                        <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest">Initial Hint (Internal)</label>
                                                                    </div>
                                                                    <input
                                                                        className="input bg-cyber-900 border-2 border-cyber-700 focus:border-amber-500/50 transition-all font-mono text-sm py-4"
                                                                        placeholder="Optional hint for users..."
                                                                        value={metadata.hint || ''}
                                                                        onChange={e => setMetadata({ ...metadata, hint: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest ml-1">Debriefing (Explanation)</label>
                                                                    <input
                                                                        className="input bg-cyber-900 border-2 border-cyber-700 focus:border-cyber-primary transition-all font-mono text-sm py-4"
                                                                        placeholder="Shown after success..."
                                                                        value={metadata.explanation || ''}
                                                                        onChange={e => setMetadata({ ...metadata, explanation: e.target.value })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {newBlockType !== 'quiz' && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between ml-1">
                                                                <label className="text-[10px] font-bold text-cyber-400 uppercase tracking-widest">Payload Content</label>
                                                                {newBlockType === 'text' && (
                                                                    <div className="flex gap-2 bg-cyber-900 p-1 rounded-lg border border-cyber-700">
                                                                        <button onClick={() => setNewBlockContent(prev => prev + '<strong></strong>')} className="w-7 h-7 flex items-center justify-center text-xs hover:text-white hover:bg-cyber-800 rounded transition-all font-bold">B</button>
                                                                        <button onClick={() => setNewBlockContent(prev => prev + '<em></em>')} className="w-7 h-7 flex items-center justify-center text-xs hover:text-white hover:bg-cyber-800 rounded transition-all italic">I</button>
                                                                        <button onClick={() => setNewBlockContent(prev => prev + '<code></code>')} className="w-7 h-7 flex items-center justify-center text-xs hover:text-white hover:bg-cyber-800 rounded transition-all font-mono">/</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <textarea
                                                                className="input bg-cyber-900 border-2 border-cyber-700 h-48 font-mono text-sm leading-relaxed resize-none focus:border-cyber-primary transition-all p-6 shadow-inner"
                                                                placeholder={
                                                                    newBlockType === 'text' ? "Enter technical documentation content..." :
                                                                        "Awaiting data stream..."
                                                                }
                                                                value={newBlockContent}
                                                                onChange={e => setNewBlockContent(e.target.value)}
                                                            />
                                                            {newBlockType === 'text' && (
                                                                <p className="text-[9px] text-cyber-600 italic ml-1 flex items-center gap-2">
                                                                    <Play size={8} /> HTML formatting supported for advanced layouts.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions Control */}
                                                <div className="flex flex-col justify-end bg-cyber-900/80 rounded-2xl p-6 border-2 border-cyber-700/50">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3 text-cyber-primary border-b border-cyber-700/50 pb-4">
                                                            <div className="w-8 h-8 rounded-lg bg-cyber-primary/10 flex items-center justify-center border border-cyber-primary/20">
                                                                <Save size={14} />
                                                            </div>
                                                            <span className="font-bold uppercase tracking-widest text-xs">Injection Log</span>
                                                        </div>

                                                        <div className="space-y-3 font-mono text-[10px] py-4 bg-black/20 p-3 rounded-lg border border-cyber-800 shadow-inner">
                                                            <div className="flex justify-between border-b border-cyber-800/50 pb-2">
                                                                <span className="text-cyber-600">TARGET</span>
                                                                <span className="text-cyber-400 font-bold truncate max-w-[100px]">{topic.title}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-cyber-800/50 pb-2">
                                                                <span className="text-cyber-600">PROTOCOL</span>
                                                                <span className="text-cyber-400 font-bold">{newBlockType.toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-cyber-600">CHECKSUM</span>
                                                                <span className="text-green-500 font-bold">READY</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                onClick={async () => {
                                                                    await handleAddBlock();
                                                                    setShowBlockSelector(false);
                                                                    setNewBlockType(null);
                                                                }}
                                                                disabled={isSaving || (newBlockType !== 'divider' && newBlockType !== 'quiz' && !newBlockContent)}
                                                                className="btn btn-primary h-14 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.15)] hover:bg-cyber-primary transition-all active:scale-95"
                                                            >
                                                                {isSaving ? (
                                                                    <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <><Plus size={20} className="stroke-[3]" /> DEPLOY BLOCK</>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowBlockSelector(false);
                                                                    setNewBlockType(null);
                                                                    setNewBlockContent('');
                                                                }}
                                                                className="py-3 px-4 text-[10px] font-bold text-cyber-500 hover:text-red-400 transition-all uppercase tracking-[0.3em]"
                                                            >
                                                                Abort Protocol
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {blocks.length === 0 && !showBlockSelector && (
                        <div className="py-20 text-center space-y-6 animate-pulse">
                            <div className="mx-auto w-16 h-16 rounded-3xl border-2 border-dashed border-cyber-700 flex items-center justify-center">
                                <Plus className="text-cyber-800" size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-cyber-500 font-mono italic text-sm">Awaiting initial documentation stream...</p>
                                <p className="text-[10px] text-cyber-700 uppercase tracking-widest">Connect payload to begin</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTopicEditor;
