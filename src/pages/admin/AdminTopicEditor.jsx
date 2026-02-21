import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    doc, getDoc, collection, query, where, getDocs, orderBy,
    addDoc, deleteDoc, serverTimestamp, updateDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, CheckCircle, Loader2, Plus } from 'lucide-react';
import EditorBlock from '../../components/NotionEditor/EditorBlock';
import SlashMenu from '../../components/NotionEditor/SlashMenu';

// ─── Markdown shortcut patterns ───────────────────────────────────────────────
const MARKDOWN_SHORTCUTS = [
    { pattern: /^# $/, type: 'h1' },
    { pattern: /^## $/, type: 'h2' },
    { pattern: /^### $/, type: 'h3' },
    { pattern: /^- $/, type: 'bullet' },
    { pattern: /^\* $/, type: 'bullet' },
    { pattern: /^1\. $/, type: 'numbered' },
    { pattern: /^```$/, type: 'code' },
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
    const [selectedBlockIds, setSelectedBlockIds] = useState(new Set());

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
    const handleBlockClick = (e, blockId, index) => {
        // Prevent default only if we are doing a selection action to avoid messing up focus
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            e.preventDefault();
        }

        if (e.shiftKey && activeBlockId) {
            // Range selection
            const activeIndex = blocks.findIndex(b => b.id === activeBlockId);
            if (activeIndex === -1) return;

            const start = Math.min(activeIndex, index);
            const end = Math.max(activeIndex, index);

            const newSelection = new Set();
            for (let i = start; i <= end; i++) {
                newSelection.add(blocks[i].id);
            }
            setSelectedBlockIds(newSelection);
        } else if (e.ctrlKey || e.metaKey) {
            // Toggle selection
            const newSelection = new Set(selectedBlockIds);
            if (newSelection.has(blockId)) {
                newSelection.delete(blockId);
            } else {
                newSelection.add(blockId);
            }
            setSelectedBlockIds(newSelection);
            setActiveBlockId(blockId); // Update active but keep others selected
        } else {
            // Single selection (default)
            if (selectedBlockIds.size > 0) {
                setSelectedBlockIds(new Set());
            }
            setActiveBlockId(blockId);
        }
    };

    // ── Keyboard handler ───────────────────────────────────────────────────────
    const handleKeyDown = (e, block, index) => {
        // Slash menu navigation is handled inside SlashMenu itself
        if (slashMenu.open) return;

        // Bulk Delete
        if (e.key === 'Backspace' || e.key === 'Delete') {
            if (selectedBlockIds.size > 1) {
                e.preventDefault();
                const idsToDelete = Array.from(selectedBlockIds);
                setBlocks(prev => {
                    const next = prev.filter(b => !selectedBlockIds.has(b.id));
                    if (next.length === 0) return [newBlock('text')]; // Always keep one
                    persistBlocks(next);
                    return next;
                });
                setSelectedBlockIds(new Set());
                setActiveBlockId(null);
                return;
            }
        }

        if (e.key === 'Enter') {
            const isMultiline = ['code', 'quote', 'tip', 'warning', 'quiz', 'toggle'].includes(block.type);

            // Ctrl+Enter (or Cmd+Enter) always creates a new block below
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                addBlockAfter(index);
                return;
            }

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

        if (e.key === 'Backspace' && block.content === '' && selectedBlockIds.size <= 1) {
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
            if (e.shiftKey) {
                e.preventDefault();
                // Expand selection downwards
                const nextIndex = index + 1;
                if (nextIndex < blocks.length) {
                    const nextBlock = blocks[nextIndex];
                    const newSelection = new Set(selectedBlockIds);
                    newSelection.add(block.id);
                    newSelection.add(nextBlock.id);
                    setSelectedBlockIds(newSelection);
                    setActiveBlockId(nextBlock.id);
                }
            } else {
                const next = blocks[index + 1];
                if (next) {
                    e.preventDefault();
                    setActiveBlockId(next.id);
                    setSelectedBlockIds(new Set()); // Clear selection on arrow move without shift
                }
            }
        }
        if (e.key === 'ArrowUp') {
            if (e.shiftKey) {
                e.preventDefault();
                // Expand selection upwards
                const prevIndex = index - 1;
                if (prevIndex >= 0) {
                    const prevBlock = blocks[prevIndex];
                    const newSelection = new Set(selectedBlockIds);
                    newSelection.add(block.id);
                    newSelection.add(prevBlock.id);
                    setSelectedBlockIds(newSelection);
                    setActiveBlockId(prevBlock.id);
                }
            } else {
                const prev = blocks[index - 1];
                if (prev) {
                    e.preventDefault();
                    setActiveBlockId(prev.id);
                    setSelectedBlockIds(new Set()); // Clear selection on arrow move without shift
                }
            }
        }
    };

    // ── Slash menu logic ───────────────────────────────────────────────────────
    const handleBlockChange = (updatedBlock) => {
        const content = updatedBlock.content || '';

        // Auto-convert '---' (or more) to divider
        if (updatedBlock.type === 'text' && /^---+$/.test(content) && content.length >= 3) {
            updateBlock({ ...updatedBlock, type: 'divider', content: '' });
            return;
        }

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

    // ─── Paste Handler ─────────────────────────────────────────────────────────
    const handlePaste = (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');

        if (!pastedText) return;

        // Find the active block
        const activeBlock = blocks.find(b => b.id === activeBlockId);

        // Only parse markdown when pasting into a "paste" block
        // All other blocks get raw text (default browser behavior)
        if (!activeBlock || activeBlock.type !== 'paste') {
            return; // Let the browser handle the paste as raw text
        }

        e.preventDefault();

        const newBlocksData = parseMarkdownToBlocks(pastedText);
        if (newBlocksData.length === 0) return;

        // Replace the paste block with the parsed blocks
        setBlocks(prev => {
            const pasteIndex = prev.findIndex(b => b.id === activeBlockId);
            if (pasteIndex < 0) return prev;

            const newBlocks = newBlocksData.map(data => ({
                ...newBlock(data.type, data.content),
                metadata: data.metadata || {}
            }));

            const next = [...prev];
            // Remove the paste block and insert parsed blocks in its place
            next.splice(pasteIndex, 1, ...newBlocks);

            persistBlocks(next);

            // Focus the last parsed block
            setTimeout(() => setActiveBlockId(newBlocks[newBlocks.length - 1].id), 50);
            return next;
        });
    };

    const parseMarkdownToBlocks = (text) => {
        const lines = text.split(/\r?\n/);
        const parsedBlocks = [];
        let currentCodeBlock = null;
        let currentTableBlock = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();

            // 1. Code Block Handling (```)
            if (trimmedLine.startsWith('```')) {
                // If we were building a table, close it first
                if (currentTableBlock) {
                    parsedBlocks.push(currentTableBlock);
                    currentTableBlock = null;
                }

                if (currentCodeBlock) {
                    // Close code block
                    parsedBlocks.push(currentCodeBlock);
                    currentCodeBlock = null;
                } else {
                    // Start code block
                    const lang = trimmedLine.replace(/^```/, '');
                    currentCodeBlock = { type: 'code', content: '', metadata: { language: lang || 'bash' } };
                }
                continue;
            }

            if (currentCodeBlock) {
                currentCodeBlock.content += (currentCodeBlock.content ? '\n' : '') + line;
                continue;
            }

            // 2. Table Handling (Lines starting with |)
            if (trimmedLine.startsWith('|')) {
                if (!currentTableBlock) {
                    currentTableBlock = {
                        type: 'table',
                        content: line,
                        metadata: { language: 'markdown' }
                    };
                } else {
                    currentTableBlock.content += '\n' + line;
                }
                continue;
            } else {
                // If we were in a table but this line is not a table row, close the table
                if (currentTableBlock) {
                    parsedBlocks.push(currentTableBlock);
                    currentTableBlock = null;
                }
            }

            // 3. Headings
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                let content = headingMatch[2].trim();
                // Strip wrapping bold/italic markdown from headings as they are already styled
                content = content.replace(/^(\*\*|__)(.*?)\1$/, '$2'); // Bold
                content = content.replace(/^(\*|_)(.*?)\1$/, '$2');   // Italic

                parsedBlocks.push({
                    type: headingMatch[1].length === 1 ? 'h1' : headingMatch[1].length === 2 ? 'h2' : 'h3',
                    content: content
                });
                continue;
            }

            // 4. Dividers
            if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
                parsedBlocks.push({ type: 'divider', content: '' });
                continue;
            }

            // 5. Lists (Unordered) - Support bold star/dash too: **- item**
            const bulletMatch = line.match(/^(\*\*|__)?[\-\*]\s+(.+)$/);
            if (bulletMatch) {
                // bulletMatch[2] is the content. If it started with bold, we might want to keep the bolding?
                // Actually regex above is tricky. Let's stick to standard markdown: - item.
                // If user pastes "**- item**", it's technically a paragraph.
                // Let's rely on standard logic but check for common "formatted" lists if needed.
                // Resetting to simple check for now:
            }
            if (/^[\-\*]\s+/.test(line)) {
                parsedBlocks.push({ type: 'bullet', content: line.replace(/^[\-\*]\s+/, '') });
                continue;
            }

            // 6. Lists (Ordered)
            // Support "1. item" or "1) item"
            const numberMatch = line.match(/^\d+[\.\)]\s+(.+)$/);
            if (numberMatch) {
                parsedBlocks.push({ type: 'numbered', content: numberMatch[1] });
                continue;
            }

            // 7. Blockquotes
            const quoteMatch = line.match(/^>\s+(.+)$/);
            if (quoteMatch) {
                parsedBlocks.push({ type: 'quote', content: quoteMatch[1] });
                continue;
            }

            // 8. General Text
            if (trimmedLine === '') continue;

            // Optimization: If the previous block was text, append to it? 
            // Users usually paste paragraphs. If we split every line into a block, it gets messy.
            // Let's try to append if the previous block was text.
            const lastBlock = parsedBlocks[parsedBlocks.length - 1];
            if (lastBlock && lastBlock.type === 'text') {
                lastBlock.content += '\n' + line;
            } else {
                parsedBlocks.push({ type: 'text', content: line });
            }
        }

        // Final cleanup
        if (currentCodeBlock) parsedBlocks.push(currentCodeBlock);
        if (currentTableBlock) parsedBlocks.push(currentTableBlock);

        return parsedBlocks;
    };

    return (
        <div className="max-w-full mx-auto pb-40 animate-fade-in px-8 lg:px-12">
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
                onPaste={handlePaste}
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
                                    index={index} // logical index for array operations
                                    listNumber={block.type === 'numbered' ? listIndex : undefined} // visual index for display
                                    isActive={activeBlockId === block.id}
                                    isSelected={selectedBlockIds.has(block.id)}
                                    onClick={(e) => handleBlockClick(e, block.id, index)}
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

                {/* Add Block Button at the End */}
                <button
                    onClick={() => addBlockAfter(blocks.length - 1)}
                    className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-cyber-600 hover:text-cyber-primary hover:bg-cyber-900/40 border border-transparent hover:border-cyber-primary/30 rounded-xl transition-all group"
                >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs uppercase tracking-widest">Add New Block</span>
                </button>

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