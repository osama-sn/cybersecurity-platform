import BlockRenderer from '../BlockRenderer';

// ... (existing imports)

// ... (BlockInput component remains the same)

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
    ...props
}) => {
    const inputRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const { isRTL } = useLanguage();

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
            // Place cursor at end
            const len = inputRef.current.value?.length || 0;
            try { inputRef.current.setSelectionRange(len, len); } catch { }
        }
    }, [isActive]);

    const wrapperClass = () => {
        if (block.type === 'divider') return '';
        if (block.type === 'quote') return 'border-l-4 border-cyber-primary/50 pl-4 py-1';
        if (block.type === 'tip') return 'bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3';
        if (block.type === 'warning') return 'bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3';
        return '';
    };

    const getTypeSpecificPrefix = () => {
        if (block.type === 'bullet') return <span className="text-cyber-primary mr-2 shrink-0 mt-1">•</span>;
        if (block.type === 'numbered') return <span className="text-cyber-primary mr-2 shrink-0 mt-1 font-mono text-sm">{props.listNumber ? `${props.listNumber}.` : `${index + 1}.`}</span>;
        if (block.type === 'todo') return (
            <input
                type="checkbox"
                checked={block.metadata?.checked || false}
                onChange={e => onChange({ ...block, metadata: { ...block.metadata, checked: e.target.checked } })}
                className="mt-1 mr-2 shrink-0 accent-cyber-primary w-4 h-4"
            />
        );
        if (block.type === 'tip') return <span className="text-amber-400 mr-2 shrink-0 mt-0.5 text-sm">💡</span>;
        if (block.type === 'warning') return <span className="text-red-400 mr-2 shrink-0 mt-0.5 text-sm">⚠️</span>;
        return null;
    };

    // If it's a structural block (divider), we handle it separately or let BlockRenderer handle it?
    // EditorBlock had custom logic for Divider wrapper. Let's keep it for drag/drop consistency if active/hovered?
    // Actually, BlockRenderer handles divider well.
    // If not active, render BlockRenderer.

    // Determine if we should show the Editor Input or the Preview
    // We show preview if NOT active.
    // Exception: For structural manipulation (drag/drop), the wrapper is always there.

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
            {/* Side Controls (Grip + Add + Delete) */}
            <div className={`absolute top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isRTL
                ? 'right-0 translate-x-full pl-1'
                : 'left-0 -translate-x-full pr-1'
                }`}>
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
                <button
                    onClick={() => onDelete(block.id)}
                    className="p-1 text-cyber-700 hover:text-red-400 transition-colors"
                    title="Delete block"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Block Content */}
            <div
                className={`flex items-start ${isActive ? wrapperClass() : ''}`}
                onClick={(e) => {
                    if (e.shiftKey || e.ctrlKey || e.metaKey) return;
                    // Switch to Edit Mode
                    // If clicking a checkbox in Preview mode, we might want to handle it?
                    // But standard behavior: click text -> edit. click checkbox -> toggle.
                    // Implementation simplicity: Click anywhere -> Edit Mode.
                    onFocus(block.id);
                    e.stopPropagation();
                }}
            >
                {isActive ? (
                    <>
                        {getTypeSpecificPrefix()}
                        <div className="flex-1 min-w-0">
                            <BlockInput
                                block={block}
                                onChange={onChange}
                                onKeyDown={(e) => onKeyDown(e, block, index)}
                                inputRef={inputRef}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 min-w-0 select-none cursor-text">
                        <BlockRenderer
                            block={block}
                            index={props.listNumber || index + 1}
                            isEditor={true}
                            onToggle={(id, val) => {
                                // Handle checkbox toggle in preview mode
                                onChange({ ...block, metadata: { ...block.metadata, checked: val } });
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorBlock;
