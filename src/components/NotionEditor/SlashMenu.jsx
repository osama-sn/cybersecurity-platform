import { useEffect, useRef, useState } from 'react';
import { Type, Heading1, Heading2, Heading3, Code, Video, Key, Minus, Lightbulb, AlertTriangle, List, ListOrdered, CheckSquare, Quote, Image } from 'lucide-react';

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
    { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: <Minus size={16} />, color: 'text-cyber-500' },
];

export { BLOCK_TYPES };

const SlashMenu = ({ query, onSelect, onClose, position }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const menuRef = useRef(null);

    const filtered = BLOCK_TYPES.filter(t =>
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[activeIndex]) onSelect(filtered[activeIndex].id);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [activeIndex, filtered, onSelect, onClose]);

    // Scroll active item into view
    useEffect(() => {
        const el = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`);
        el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    if (filtered.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-72 bg-cyber-800 border border-cyber-600 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: position.top, left: position.left }}
        >
            <div className="px-3 py-2 border-b border-cyber-700">
                <p className="text-[10px] text-cyber-500 uppercase tracking-widest font-bold">Block Type</p>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
                {filtered.map((type, i) => (
                    <button
                        key={type.id}
                        data-index={i}
                        onMouseDown={(e) => { e.preventDefault(); onSelect(type.id); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === activeIndex ? 'bg-cyber-700' : 'hover:bg-cyber-700/50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg bg-cyber-900 flex items-center justify-center border border-cyber-700 ${type.color} shrink-0`}>
                            {type.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{type.label}</p>
                            <p className="text-[10px] text-cyber-500">{type.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SlashMenu;
