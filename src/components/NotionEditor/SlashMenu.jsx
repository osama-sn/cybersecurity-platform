import { useEffect, useRef, useState } from 'react';
import { Type, Heading1, Heading2, Heading3, Code, Video, Key, Minus, Lightbulb, AlertTriangle, List, ListOrdered, CheckSquare, Quote, Image, ChevronRight, ClipboardPaste } from 'lucide-react';

const BLOCK_TYPES = [
    { id: 'text', label: 'Text', description: 'Plain paragraph', icon: <Type size={16} />, color: 'text-blue-400' },
    { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: <Heading1 size={16} />, color: 'text-purple-400' },
    { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: <Heading2 size={16} />, color: 'text-purple-300' },
    { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: <Heading3 size={16} />, color: 'text-purple-200' },
    { id: 'bullet', label: 'Bullet List', description: 'Unordered list', icon: <List size={16} />, color: 'text-green-400' },
    { id: 'numbered', label: 'Numbered List', description: 'Ordered list', icon: <ListOrdered size={16} />, color: 'text-green-300' },
    { id: 'todo', label: 'To-do', description: 'Checkbox list', icon: <CheckSquare size={16} />, color: 'text-teal-400' },
    { id: 'quote', label: 'Quote', description: 'Blockquote', icon: <Quote size={16} />, color: 'text-yellow-400' },
    { id: 'code', label: 'Code', description: 'Code block with syntax', icon: <Code size={16} />, color: 'text-green-500' },
    { id: 'tip', label: 'Callout', description: 'Info / tip callout', icon: <Lightbulb size={16} />, color: 'text-amber-400' },
    { id: 'warning', label: 'Warning', description: 'Warning callout', icon: <AlertTriangle size={16} />, color: 'text-red-400' },
    { id: 'youtube', label: 'Video', description: 'Embed YouTube video', icon: <Video size={16} />, color: 'text-red-500' },
    { id: 'quiz', label: 'Challenge', description: 'Quiz or flag challenge', icon: <Key size={16} />, color: 'text-yellow-500' },
    { id: 'toggle', label: 'Toggle List', description: 'Toggles can hide content inside', icon: <ChevronRight size={16} />, color: 'text-cyber-300' },
    { id: 'image', label: 'Image', description: 'Embed from URL', icon: <Image size={16} />, color: 'text-pink-400' },
    { id: 'paste', label: 'Paste', description: 'Paste content with smart parsing', icon: <ClipboardPaste size={16} />, color: 'text-cyan-400' },
    { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: <Minus size={16} />, color: 'text-cyber-500' },
];

export { BLOCK_TYPES };

const SlashMenu = ({ query, onSelect, onClose, position }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [recents, setRecents] = useState([]);
    const menuRef = useRef(null);

    // Load recents on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('recentBlocks');
            if (saved) setRecents(JSON.parse(saved));
        } catch (e) { console.error('Failed to load recent blocks', e); }
    }, []);

    const handleSelect = (id) => {
        // Update recents
        const newRecents = [id, ...recents.filter(r => r !== id)].slice(0, 3);
        setRecents(newRecents);
        localStorage.setItem('recentBlocks', JSON.stringify(newRecents));
        onSelect(id);
    };

    // Filter logic
    let filtered = [];
    if (!query) {
        // Show Recents + All
        const recentBlocks = recents
            .map(id => BLOCK_TYPES.find(t => t.id === id))
            .filter(Boolean); // Filter out if block type no longer exists

        if (recentBlocks.length > 0) {
            filtered = [
                { header: 'Suggested' },
                ...recentBlocks,
                { header: 'Basic Blocks' },
                ...BLOCK_TYPES.filter(t => !recents.includes(t.id))
            ];
        } else {
            filtered = BLOCK_TYPES;
        }
    } else {
        filtered = BLOCK_TYPES.filter(t =>
            t.label.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                // Skip headers in navigation
                let nextIndex = activeIndex + 1;
                while (filtered[nextIndex] && filtered[nextIndex].header) {
                    nextIndex++;
                }
                if (nextIndex < filtered.length) setActiveIndex(nextIndex);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                let prevIndex = activeIndex - 1;
                while (filtered[prevIndex] && filtered[prevIndex].header) {
                    prevIndex--;
                }
                if (prevIndex >= 0) setActiveIndex(prevIndex);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = filtered[activeIndex];
                if (item && !item.header) handleSelect(item.id);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeIndex, filtered, onClose]);

    // Scroll active item into view
    useEffect(() => {
        const el = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (filtered.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-72 bg-cyber-800 border border-cyber-600 rounded-xl shadow-2xl overflow-hidden max-h-80 flex flex-col"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex-1 overflow-y-auto py-1">
                {filtered.map((item, i) => {
                    if (item.header) {
                        return (
                            <div key={`header-${i}`} className="px-3 py-2 bg-cyber-800/90 backdrop-blur sticky top-0 z-10 border-b border-cyber-700/50">
                                <p className="text-[10px] text-cyber-500 uppercase tracking-widest font-bold">{item.header}</p>
                            </div>
                        );
                    }
                    return (
                        <button
                            key={item.id}
                            data-index={i}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(item.id); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === activeIndex ? 'bg-cyber-700' : 'hover:bg-cyber-700/50'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-cyber-900 flex items-center justify-center border border-cyber-700 ${item.color} shrink-0`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="text-[10px] text-cyber-500">{item.description}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SlashMenu;
