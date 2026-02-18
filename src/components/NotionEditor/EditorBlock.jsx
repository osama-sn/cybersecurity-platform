import { useRef, useEffect, useState } from 'react';
import { GripVertical, Trash2, Plus } from 'lucide-react';

// Renders the block content in "edit mode" - a simple textarea or input
const BlockInput = ({ block, onChange, onKeyDown, inputRef, placeholder }) => {
    // Auto-resize textarea
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    }, [block.content]);

    const baseClass = "w-full bg-transparent outline-none resize-none overflow-hidden leading-relaxed";

    if (block.type === 'code') {
        return (
            <div className="relative my-2">
                <div className="flex items-center gap-2 mb-2">
                    <input
                        className="bg-transparent outline-none text-xs text-cyber-500 font-mono w-24 border-b border-cyber-700 focus:border-cyber-primary"
                        placeholder="language..."
                        value={block.metadata?.language || ''}
                        onChange={e => onChange({ ...block, metadata: { ...block.metadata, language: e.target.value } })}
                    />
                </div>
                <textarea
                    ref={inputRef}
                    className={`${baseClass} font-mono text-sm text-green-400 bg-cyber-900/50 border border-cyber-700 rounded-lg p-4 min-h-[100px]`}
                    value={block.content}
                    onChange={e => onChange({ ...block, content: e.target.value })}
                    onKeyDown={onKeyDown}
                    placeholder="// code here..."
                    rows={3}
                />
            </div>
        );
    }

    if (block.type === 'youtube') {
        return (
            <input
                ref={inputRef}
                className={`${baseClass} text-cyber-300`}
                value={block.content}
                onChange={e => onChange({ ...block, content: e.target.value })}
                onKeyDown={onKeyDown}
                placeholder="Paste YouTube URL..."
            />
        );
    }

    if (block.type === 'quiz') {
        return (
            <div className="space-y-3 py-2">
                <p className="text-xs text-cyber-500 uppercase tracking-widest font-bold">Challenge Block</p>
                <textarea
                    ref={inputRef}
                    className={`${baseClass} text-cyber-300 bg-cyber-900/30 border border-cyber-700 rounded-lg p-3`}
                    value={block.metadata?.question || ''}
                    onChange={e => onChange({ ...block, metadata: { ...block.metadata, question: e.target.value } })}
                    onKeyDown={onKeyDown}
                    placeholder="Challenge question..."
                    rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                    <input
                        className="input text-sm py-2"
                        placeholder="Correct flag (e.g. FLAG{...})"
                        value={block.metadata?.correctFlag || ''}
                        onChange={e => onChange({ ...block, metadata: { ...block.metadata, correctFlag: e.target.value, challengeType: 'flag' } })}
                    />
                    <input
                        className="input text-sm py-2"
                        placeholder="Flag pattern (e.g. FLAG{****})"
                        value={block.metadata?.flagPattern || ''}
                        onChange={e => onChange({ ...block, metadata: { ...block.metadata, flagPattern: e.target.value } })}
                    />
                </div>
                <input
                    className="input text-sm py-2"
                    placeholder="Hint (optional)"
                    value={block.metadata?.hint || ''}
                    onChange={e => onChange({ ...block, metadata: { ...block.metadata, hint: e.target.value } })}
                />
                <input
                    className="input text-sm py-2"
                    placeholder="Explanation (shown after answer)"
                    value={block.metadata?.explanation || ''}
                    onChange={e => onChange({ ...block, metadata: { ...block.metadata, explanation: e.target.value } })}
                />
            </div>
        );
    }

    const styleMap = {
        h1: `${baseClass} text-4xl font-bold text-white`,
        h2: `${baseClass} text-3xl font-bold text-white`,
        h3: `${baseClass} text-2xl font-bold text-white`,
        quote: `${baseClass} text-cyber-300 italic border-l-4 border-cyber-primary pl-4`,
        tip: `${baseClass} text-cyber-300`,
        warning: `${baseClass} text-cyber-300`,
        bullet: `${baseClass} text-cyber-300`,
        numbered: `${baseClass} text-cyber-300`,
        todo: `${baseClass} text-cyber-300`,
        text: `${baseClass} text-cyber-300`,
    };

    return (
        <textarea
            ref={inputRef}
            className={styleMap[block.type] || `${baseClass} text-cyber-300`}
            value={block.content}
            onChange={e => onChange({ ...block, content: e.target.value })}
            onKeyDown={onKeyDown}
            placeholder={placeholder || 'Type \'/\' for commands...'}
            rows={1}
        />
    );
};

const EditorBlock = ({
    block,
    index,
    isActive,
    onFocus,
    onChange,
    onKeyDown,
    onDelete,
    onAddBelow,
    onDragStart,
    onDragOver,
    onDrop,
}) => {
    const inputRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
            // Place cursor at end
            const len = inputRef.current.value?.length || 0;
            try { inputRef.current.setSelectionRange(len, len); } catch { }
        }
    }, [isActive]);

    const blockPrefix = () => {
        if (block.type === 'bullet') return <span className="text-cyber-primary mr-2 shrink-0 mt-1">•</span>;
        if (block.type === 'numbered') return <span className="text-cyber-primary mr-2 shrink-0 mt-1 font-mono text-sm">{index + 1}.</span>;
        if (block.type === 'todo') return (
            <input
                type="checkbox"
                checked={block.metadata?.checked || false}
                onChange={e => onChange({ ...block, metadata: { ...block.metadata, checked: e.target.checked } })}
                className="mt-1 mr-2 shrink-0 accent-cyber-primary w-4 h-4"
            />
        );
        if (block.type === 'quote') return null;
        if (block.type === 'tip') return <span className="text-amber-400 mr-2 shrink-0 mt-0.5 text-sm">💡</span>;
        if (block.type === 'warning') return <span className="text-red-400 mr-2 shrink-0 mt-0.5 text-sm">⚠️</span>;
        return null;
    };

    const wrapperClass = () => {
        if (block.type === 'divider') return '';
        if (block.type === 'quote') return 'border-l-4 border-cyber-primary/50 pl-4 py-1';
        if (block.type === 'tip') return 'bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3';
        if (block.type === 'warning') return 'bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3';
        return '';
    };

    if (block.type === 'divider') {
        return (
            <div
                className="relative group py-3"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={e => { e.preventDefault(); onDragOver(index); }}
                onDrop={() => onDrop(index)}
            >
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full pr-2`}>
                    <button className="p-1 text-cyber-600 hover:text-cyber-400 cursor-grab"><GripVertical size={14} /></button>
                    <button onClick={() => onDelete(block.id)} className="p-1 text-cyber-600 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
                <hr className="border-cyber-700/50" />
            </div>
        );
    }

    return (
        <div
            className={`relative group py-1 ${isActive ? 'is-active' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={e => { e.preventDefault(); onDragOver(index); }}
            onDrop={() => onDrop(index)}
        >
            {/* Left Controls */}
            <div className={`absolute left-0 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full pr-1`}>
                <button
                    onClick={() => onAddBelow(index)}
                    className="p-1 text-cyber-600 hover:text-cyber-primary transition-colors"
                    title="Add block below"
                >
                    <Plus size={14} />
                </button>
                <button
                    className="p-1 text-cyber-600 hover:text-cyber-400 cursor-grab active:cursor-grabbing transition-colors"
                    title="Drag to reorder"
                >
                    <GripVertical size={14} />
                </button>
            </div>

            {/* Delete Button */}
            <button
                onClick={() => onDelete(block.id)}
                className="absolute right-0 top-2 p-1 text-cyber-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete block"
            >
                <Trash2 size={12} />
            </button>

            {/* Block Content */}
            <div
                className={`flex items-start ${wrapperClass()}`}
                onClick={() => onFocus(block.id)}
            >
                {blockPrefix()}
                <div className="flex-1 min-w-0">
                    <BlockInput
                        block={block}
                        onChange={onChange}
                        onKeyDown={(e) => onKeyDown(e, block, index)}
                        inputRef={inputRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditorBlock;
