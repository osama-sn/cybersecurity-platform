import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    doc, getDoc, collection, query, where, getDocs, orderBy,
    addDoc, deleteDoc, serverTimestamp, updateDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import EditorBlock from '../../components/NotionEditor/EditorBlock';
import SlashMenu from '../../components/NotionEditor/SlashMenu';

// ─── Markdown shortcut patterns ───────────────────────────────────────────────
const MARKDOWN_SHORTCUTS = [
    { pattern: /^# $/, type: 'h1' },
    { pattern: /^## $/, type: 'h2' },
    { pattern: /^### $/, type: 'h3' },
    { pattern: /^- $/, type: 'bullet' },
    { pattern: /^\* $/, type: 'bullet' },
    { pattern: /^> $/, type: 'quote' },
    { pattern: /^\[\] $/, type: 'todo' },
    { pattern: /^--- $/, type: 'divider' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const newBlock = (type = 'text', content = '') => ({
    id: crypto.randomUUID(),
    type,
    content,
    metadata: {},
    _isNew: true,   // flag: needs to be written to Firestore
});

// ─── Component ────────────────────────────────────────────────────────────────
const AdminTopicEditor = () => {
    const { topicId } = useParams();
    const [topic, setTopic] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

    // Slash menu state
    const [slashMenu, setSlashMenu] = useState({ open: false, blockId: null, query: '', position: { top: 0, left: 0 } });

    // Drag state
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Debounce timer ref
    const saveTimer = useRef(null);
    // Map of blockId → Firestore docId (for blocks already persisted)
    const firestoreIds = useRef({}); // { localId: firestoreDocId }

    // ── Load data ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!topicId) return;

        const fetchTopic = async () => {
            const snap = await getDoc(doc(db, 'topics', topicId));
            if (snap.exists()) setTopic({ id: snap.id, ...snap.data() });
        };
        fetchTopic();

        const fetchBlocks = async () => {
            const q = query(
                collection(db, 'contentBlocks'),
                where('topicId', '==', topicId),
                orderBy('order', 'asc')
            );
            let snap;
            try { snap = await getDocs(q); }
            catch {
                const fallback = query(collection(db, 'contentBlocks'), where('topicId', '==', topicId));
                snap = await getDocs(fallback);
            }

            const loaded = snap.docs.map(d => {
                const localId = crypto.randomUUID();
                firestoreIds.current[localId] = d.id;
                return { id: localId, ...d.data(), _isNew: false };
            });
            loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
            setBlocks(loaded.length > 0 ? loaded : [newBlock('text')]);
        };
        fetchBlocks();
    }, [topicId]);

    // ── Auto-save (debounced) ──────────────────────────────────────────────────
    const scheduleSave = useCallback((updatedBlocks) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        setSaveStatus('saving');
        saveTimer.current = setTimeout(() => persistBlocks(updatedBlocks), 800);
    }, []);

    const persistBlocks = async (currentBlocks) => {
        try {
            const batch = writeBatch(db);

            currentBlocks.forEach((block, index) => {
                const firestoreId = firestoreIds.current[block.id];
                const data = {
                    topicId,
                    type: block.type,
                    content: block.content || '',
                    metadata: block.metadata || {},
                    order: index,
                };

                if (firestoreId) {
                    // Update existing
                    batch.update(doc(db, 'contentBlocks', firestoreId), data);
                } else {
                    // Create new
                    const newRef = doc(collection(db, 'contentBlocks'));
                    firestoreIds.current[block.id] = newRef.id;
                    batch.set(newRef, { ...data, createdAt: serverTimestamp() });
                }
            });

            // Delete removed blocks
            const currentLocalIds = new Set(currentBlocks.map(b => b.id));
            for (const [localId, fsId] of Object.entries(firestoreIds.current)) {
                if (!currentLocalIds.has(localId)) {
                    batch.delete(doc(db, 'contentBlocks', fsId));
                    delete firestoreIds.current[localId];
                }
            }

            await batch.commit();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error('Save error:', err);
            setSaveStatus('idle');
        }
    };

    // ── Block mutations ────────────────────────────────────────────────────────
    const updateBlock = (updatedBlock) => {
        setBlocks(prev => {
            const next = prev.map(b => b.id === updatedBlock.id ? updatedBlock : b);
            scheduleSave(next);
            return next;
        });
    };

    const addBlockAfter = (index, type = 'text') => {
        const nb = newBlock(type);
        setBlocks(prev => {
            const next = [...prev];
            next.splice(index + 1, 0, nb);
            // Immediate save for structural change
            persistBlocks(next);
            return next;
        });
        setActiveBlockId(nb.id);
        return nb.id;
    };

    const deleteBlock = (blockId) => {
        setBlocks(prev => {
            if (prev.length === 1) {
                // Don't delete the last block; just clear it
                const cleared = [{ ...prev[0], content: '', type: 'text', metadata: {} }];
                // Immediate save
                persistBlocks(cleared);
                return cleared;
            }
            const idx = prev.findIndex(b => b.id === blockId);
            const next = prev.filter(b => b.id !== blockId);
            // Immediate save
            persistBlocks(next);
            // Focus previous block
            const focusIdx = Math.max(0, idx - 1);
            setActiveBlockId(next[focusIdx]?.id || null);
            return next;
        });
    };

    // ── Keyboard handler ───────────────────────────────────────────────────────
    // ── Keyboard handler ───────────────────────────────────────────────────────
    const handleKeyDown = (e, block, index) => {
        // Slash menu navigation is handled inside SlashMenu itself
        if (slashMenu.open) return;

        if (e.key === 'Enter') {
            const isMultiline = ['code', 'quote', 'tip', 'warning', 'quiz', 'toggle'].includes(block.type);

            // Ctrl+Enter (or Cmd+Enter) always creates a new block below
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                addBlockAfter(index);
                return;
            }

            // For multi-line blocks, Enter inserts a new line (default behavior).
            // We only intercept if it's NOT multi-line (or if Shift is pressed, which usually means new line in text editors, but here we want standard list behavior)
            // Wait, standard behavior:
            // Text/List: Enter = New Block. Shift+Enter = New Line.
            // Code/Quote: Enter = New Line. Ctrl+Enter = New Block.

            if (isMultiline) {
                // Allow default (new line)
                return;
            }

            // Standard blocks (Text, Headers, Lists)
            if (!e.shiftKey) {
                e.preventDefault();
                // Inherit list types
                const nextType = ['bullet', 'numbered', 'todo'].includes(block.type) ? block.type : 'text';
                addBlockAfter(index, nextType);
                return;
            }
        }

        if (e.key === 'Backspace' && block.content === '') {
            e.preventDefault();
            deleteBlock(block.id);
            return;
        }

        // Markdown shortcuts — check after space is typed
        if (e.key === ' ') {
            const currentContent = block.content;
            const testStr = currentContent + ' ';
            for (const { pattern, type } of MARKDOWN_SHORTCUTS) {
                if (pattern.test(testStr)) {
                    e.preventDefault();
                    updateBlock({ ...block, type, content: '' });
                    return;
                }
            }
        }

        // Arrow key navigation between blocks
        if (e.key === 'ArrowDown') {
            const next = blocks[index + 1];
            if (next) { e.preventDefault(); setActiveBlockId(next.id); }
        }
        if (e.key === 'ArrowUp') {
            const prev = blocks[index - 1];
            if (prev) { e.preventDefault(); setActiveBlockId(prev.id); }
        }
    };

    // ── Slash menu logic ───────────────────────────────────────────────────────
    const handleBlockChange = (updatedBlock) => {
        const content = updatedBlock.content || '';

        // Detect slash command
        if (content === '/') {
            // Get caret position for menu placement
            const el = document.activeElement;
            const rect = el?.getBoundingClientRect?.() || { bottom: 0, left: 0 };
            const containerRect = el?.closest('.editor-container')?.getBoundingClientRect?.() || { top: 0, left: 0 };
            setSlashMenu({
                open: true,
                blockId: updatedBlock.id,
                query: '',
                position: {
                    top: rect.bottom - containerRect.top + 4,
                    left: Math.max(0, rect.left - containerRect.left),
                }
            });
        } else if (slashMenu.open && slashMenu.blockId === updatedBlock.id) {
            if (content.startsWith('/')) {
                setSlashMenu(prev => ({ ...prev, query: content.slice(1) }));
            } else {
                setSlashMenu({ open: false, blockId: null, query: '', position: { top: 0, left: 0 } });
            }
        }

        updateBlock(updatedBlock);
    };

    const handleSlashSelect = (type) => {
        const block = blocks.find(b => b.id === slashMenu.blockId);
        if (block) {
            updateBlock({ ...block, type, content: '' });
        }
        setSlashMenu({ open: false, blockId: null, query: '', position: { top: 0, left: 0 } });
    };

    const closeSlashMenu = () => {
        setSlashMenu({ open: false, blockId: null, query: '', position: { top: 0, left: 0 } });
    };

    // ── Drag and drop ──────────────────────────────────────────────────────────
    const handleDragStart = (index) => setDragIndex(index);
    const handleDragOver = (index) => setDragOverIndex(index);

    const handleDrop = (targetIndex) => {
        if (dragIndex === null || dragIndex === targetIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        setBlocks(prev => {
            const next = [...prev];
            const [moved] = next.splice(dragIndex, 1);
            next.splice(targetIndex, 0, moved);
            // Immediate save for reordering
            persistBlocks(next);
            return next;
        });
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    if (!topic) return (
        <div className="flex items-center justify-center py-20 gap-3 text-cyber-500">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-mono text-sm">Establishing secure connection...</span>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto pb-40 animate-fade-in px-4">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cyber-700/50 pb-6 mb-8">
                <div className="space-y-2">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-cyber-500 hover:text-cyber-primary transition-colors text-sm font-mono uppercase tracking-wider"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-white">
                        {topic.title}
                    </h1>
                    <p className="text-cyber-600 font-mono text-xs">ID: {topicId}</p>
                </div>

                {/* Save status indicator */}
                <div className="flex items-center gap-2 text-xs font-mono">
                    {saveStatus === 'saving' && (
                        <span className="flex items-center gap-1.5 text-cyber-500">
                            <Loader2 size={12} className="animate-spin" /> Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1.5 text-green-400">
                            <CheckCircle size={12} /> Saved
                        </span>
                    )}
                    {saveStatus === 'idle' && (
                        <span className="text-cyber-700">Auto-save on</span>
                    )}
                </div>
            </div>

            {/* ── Editor Canvas ── */}
            <div
                className="editor-container relative bg-cyber-900/20 border border-cyber-700/30 rounded-2xl p-6 md:p-10 min-h-[400px] shadow-2xl"
                onClick={(e) => {
                    // Click on empty area → focus last block
                    if (e.target === e.currentTarget) {
                        setActiveBlockId(blocks[blocks.length - 1]?.id || null);
                    }
                }}
            >
                {/* Hint */}
                {blocks.length === 1 && blocks[0].content === '' && (
                    <p className="absolute top-10 left-10 text-cyber-700 text-sm pointer-events-none select-none font-mono italic">
                        Start typing, or press <kbd className="bg-cyber-800 px-1 rounded text-cyber-500">/</kbd> for commands...
                    </p>
                )}

                {/* Blocks */}
                <div className="space-y-0.5 pl-8">
                    {(() => {
                        let listIndex = 0;
                        return blocks.map((block, index) => {
                            // Numbered list grouping logic
                            if (block.type === 'numbered') {
                                listIndex++;
                            } else {
                                listIndex = 0;
                            }

                            return (
                                <EditorBlock
                                    key={block.id}
                                    block={block}
                                    index={block.type === 'numbered' ? listIndex : index}
                                    isActive={activeBlockId === block.id}
                                    onFocus={(id) => setActiveBlockId(id)}
                                    onChange={handleBlockChange}
                                    onKeyDown={handleKeyDown}
                                    onDelete={deleteBlock}
                                    onAddBelow={(idx) => addBlockAfter(idx)}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                />
                            );
                        });
                    })()}
                </div>

                {/* Slash Menu */}
                {slashMenu.open && (
                    <SlashMenu
                        query={slashMenu.query}
                        onSelect={handleSlashSelect}
                        onClose={closeSlashMenu}
                        position={slashMenu.position}
                    />
                )}
            </div>

            {/* ── Keyboard Shortcuts Reference ── */}
            <div className="mt-6 px-2">
                <p className="text-[10px] text-cyber-700 font-mono uppercase tracking-widest mb-2">Shortcuts</p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-cyber-600 font-mono">
                    {[
                        ['/', 'Block menu'],
                        ['Enter', 'New block'],
                        ['Backspace', 'Delete empty block'],
                        ['# ', 'Heading 1'],
                        ['## ', 'Heading 2'],
                        ['- ', 'Bullet list'],
                        ['> ', 'Quote'],
                        ['[] ', 'To-do'],
                    ].map(([key, desc]) => (
                        <span key={key}>
                            <kbd className="bg-cyber-800 border border-cyber-700 px-1 rounded text-cyber-400">{key}</kbd>
                            {' '}{desc}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminTopicEditor;
