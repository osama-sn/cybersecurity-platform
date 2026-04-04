import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    doc, getDoc, collection, query, where, getDocs, orderBy,
    addDoc, deleteDoc, serverTimestamp, updateDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ArrowLeft, CheckCircle, Loader2, Plus, MessageSquare } from 'lucide-react';
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
    const [feedbacks, setFeedbacks] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]); // Array of { id, title }

    // Topic details editing
    const [isEditingTopic, setIsEditingTopic] = useState(false);
    const [topicForm, setTopicForm] = useState({ title: '', description: '' });

    // Slash menu state
    const [slashMenu, setSlashMenu] = useState({ open: false, blockId: null, query: '', position: { top: 0, left: 0 } });

    // Drag state
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Debounce timer ref
    const saveTimer = useRef(null);
    // Map of blockId → Firestore docId (for blocks already persisted)
    const firestoreIds = useRef({}); // { localId: firestoreDocId }
    // Reference for latest blocks for cleanup save
    const blocksRef = useRef(blocks);

    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);

    // The cleanup logic is now integrated into the main useEffect below to handle topic transitions correctly

    // ── Load data ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!topicId) return;

        const fetchTopic = async () => {
            const snap = await getDoc(doc(db, 'topics', topicId));
            if (snap.exists()) {
                const data = snap.data();
                setTopic({ id: snap.id, ...data });
                setTopicForm({ title: data.title || '', description: data.description || '' });
            }
        };
        fetchTopic();

        const fetchBreadcrumbs = async (id, path = []) => {
            const snap = await getDoc(doc(db, 'topics', id));
            if (snap.exists()) {
                const data = snap.data();
                const node = { id: snap.id, title: data.title };
                const newPath = [node, ...path];
                
                if (data.parentId) {
                    return fetchBreadcrumbs(data.parentId, newPath);
                }
                setBreadcrumbs(newPath);
            }
        };
        fetchBreadcrumbs(topicId);

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

        const fetchFeedbacks = async () => {
            const q = query(
                collection(db, 'topicFeedback'),
                where('topicId', '==', topicId),
                orderBy('createdAt', 'desc')
            );
            try {
                const snap = await getDocs(q);
                setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.warn("Failed to fetch feedbacks or missing index. Trying without order...", err);
                const fallbackQ = query(collection(db, 'topicFeedback'), where('topicId', '==', topicId));
                try {
                    const fallbackSnap = await getDocs(fallbackQ);
                    const fbList = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    fbList.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                    setFeedbacks(fbList);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        fetchFeedbacks();

        return () => {
            // ── Cleanup: Flush any pending save for the OLD topicId ──
            if (saveTimer.current) {
                clearTimeout(saveTimer.current);
                // We use persistBlocks from this specific render's closure
                persistBlocks(blocksRef.current);
            }
            // Reset states to avoid data leakage between topics during transition
            setBlocks([]);
            setTopic(null);
            setBreadcrumbs([]);
            firestoreIds.current = {};
            setSaveStatus('idle');
        };
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

    const createSubpage = async (parentBlock) => {
        try {
            setSaveStatus('saving');
            // 1. Create the new topic document
            const newTopicRef = await addDoc(collection(db, 'topics'), {
                title: "New Subpage",
                description: "",
                parentId: topicId, // Link to current topic
                sectionId: topic.sectionId || null, // Inherit section if possible
                createdAt: serverTimestamp(),
                createdBy: topic.createdBy || null
            });

            // 2. Prepare the updated blocks
            const updatedBlock = { 
                ...parentBlock, 
                type: 'subpage', 
                content: "New Subpage",
                metadata: { ...parentBlock.metadata, subTopicId: newTopicRef.id } 
            };

            // 3. Update state AND persist immediately
            const nextBlocks = blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b);
            setBlocks(nextBlocks);
            await persistBlocks(nextBlocks); // Await immediate persist to ensure data integrity

            // 4. Status update
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error("Error creating subpage:", err);
            alert("Failed to create subpage.");
        }
    };

    const handleSaveTopicDetails = async () => {
        try {
            const topicRef = doc(db, 'topics', topicId);
            await updateDoc(topicRef, {
                title: topicForm.title,
                description: topicForm.description
            });
            setTopic(prev => ({ ...prev, title: topicForm.title, description: topicForm.description }));
            setIsEditingTopic(false);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error("Error saving topic details:", error);
            alert("Failed to update topic details.");
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

        // Detect numeric or slash command trigger
        const isTrigger = /^[0-9\/]$/.test(content);
        if (isTrigger) {
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
            const firstChar = content.charAt(0);
            if (/^[0-9\/]$/.test(firstChar)) {
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
            if (type === 'subpage') {
                createSubpage(block);
            } else {
                updateBlock({ ...block, type, content: '' });
            }
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
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-cyber-700/50 pb-8 mb-10 relative overflow-hidden group/header">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/header:opacity-100 transition-opacity duration-1000"></div>

                <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-cyber-500 hover:text-cyber-primary transition-colors"
                        >
                            <ArrowLeft size={12} /> Return
                        </button>
                        {breadcrumbs.length > 1 && (
                            <>
                                <div className="w-1 h-1 rounded-full bg-cyber-800"></div>
                                <div className="flex items-center gap-2 text-cyber-600">
                                    {breadcrumbs.slice(0, -1).map((crumb, i) => (
                                        <div key={crumb.id} className="flex items-center gap-2">
                                            <Link to={`/admin/topics/${crumb.id}`} className="hover:text-cyber-primary transition-colors max-w-[100px] truncate">{crumb.title}</Link>
                                            {i < breadcrumbs.length - 2 && <span>/</span>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {isEditingTopic ? (
                        <div className="space-y-4 max-w-2xl bg-cyber-900/50 p-6 rounded-2xl border border-cyber-700/50">
                            <div>
                                <label className="text-[9px] font-black text-cyber-600 uppercase tracking-widest mb-1.5 block">Topic Title</label>
                                <input 
                                    type="text" 
                                    value={topicForm.title}
                                    onChange={(e) => setTopicForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="input bg-cyber-950 border-cyber-700 text-white font-bold text-2xl w-full focus:border-cyber-primary/50 transition-all"
                                    placeholder="Enter topic title..."
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-cyber-600 uppercase tracking-widest mb-1.5 block">Brief Description (Learning Objectives)</label>
                                <textarea 
                                    value={topicForm.description}
                                    onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="input bg-cyber-950 border-cyber-700 text-cyber-300 w-full min-h-[80px] text-sm leading-relaxed"
                                    placeholder="What will students learn in this specific topic?"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleSaveTopicDetails} className="px-6 py-2 bg-cyber-primary text-black font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all">
                                    Apply Changes
                                </button>
                                <button onClick={() => setIsEditingTopic(false)} className="px-6 py-2 border border-cyber-700 text-cyber-400 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-cyber-800 transition-all">
                                    Discard
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                                    {topic.title}
                                </h1>
                                <button 
                                    onClick={() => setIsEditingTopic(true)}
                                    className="p-2 text-cyber-600 hover:text-cyber-primary hover:bg-cyber-900 rounded-xl transition-all border border-transparent hover:border-cyber-primary/20"
                                    title="Edit Metadata"
                                >
                                    <Plus size={20} className="rotate-45" /> {/* Using Plus rotated as an X/Edit placeholder or just use Pencil if available */}
                                </button>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 bg-cyber-950 border border-cyber-800 px-3 py-1 rounded-full">
                                    <span className="text-[10px] font-black text-cyber-600 uppercase tracking-widest">NodeID:</span>
                                    <span className="text-[10px] font-mono text-cyber-400">{topicId.substring(0, 12)}</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-cyber-800"></div>
                                <div className="flex gap-2">
                                    {saveStatus === 'saving' && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-cyber-500 uppercase tracking-widest">
                                            <Loader2 size={12} className="animate-spin text-cyber-primary" /> Syncing...
                                        </div>
                                    )}
                                    {saveStatus === 'saved' && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            <CheckCircle size={12} /> Synced
                                        </div>
                                    )}
                                    {saveStatus === 'idle' && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-cyber-700 uppercase tracking-widest opacity-40">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyber-700 animate-pulse"></div> Local Link Stable
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-cyber-400 font-medium text-lg leading-relaxed max-w-3xl border-l-2 border-cyber-800 pl-6 italic">
                                {topic.description || "No metadata description synchronised. Recommend adding learning objectives for better student alignment."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Student Reviews ── */}
            {feedbacks.length > 0 && (
                <div className="mb-8 p-6 bg-cyber-900/30 border border-cyber-800/60 rounded-2xl relative overflow-hidden group/feedback">
                    <h3 className="text-sm font-black text-cyber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare size={14} className="text-cyber-primary" /> Anonymous Student Feedback ({feedbacks.length})
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {feedbacks.map(fb => (
                            <div key={fb.id} className="min-w-[280px] w-[280px] bg-cyber-950 border border-cyber-700/50 p-4 rounded-xl shrink-0 shadow-lg relative">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <MessageSquare size={40} />
                                </div>
                                <p className="text-cyber-300 text-sm whitespace-pre-wrap italic relative z-10" dir="auto">"{fb.content}"</p>
                                <p className="text-[10px] text-cyber-600 font-mono mt-4 text-right">
                                    {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        Start typing, or press <kbd className="bg-cyber-800 px-1 rounded text-cyber-500">0-9</kbd> for quick commands...
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