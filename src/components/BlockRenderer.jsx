import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal, Play, AlertCircle, AlertTriangle, Key, Lightbulb, ArrowRight, Lock, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getTelegramFileUrl } from '../utils/telegram';

const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded bg-cyber-800 text-cyber-400 hover:text-white transition-colors"
            title={t('renderer.copy')}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
    );
};

const FlagInput = ({ pattern, value, onChange, disabled, isCorrect, showResult }) => {
    // Pattern example: FLAG{*********}
    const prefixMatch = pattern.match(/^[^{]*/);
    const prefix = prefixMatch ? prefixMatch[0] : '';
    const placeholderChars = pattern.slice(prefix.length); // e.g., {*********}

    // We want to handle the input inside the curly braces separately for the "OTP" effect
    // but keep it as a single string for simplicity in state management.

    return (
        <div className="space-y-4" dir="ltr">
            <div className="flex flex-wrap items-center gap-2 font-mono">
                {/* Prefix - like FLAG */}
                {prefix && (
                    <span className="text-cyber-500 font-black text-xl tracking-tighter self-center mt-1">{prefix}</span>
                )}

                {/* The Input Boxes */}
                <div className="flex items-center gap-1">
                    {placeholderChars.split('').map((char, index) => {
                        const isSpecial = char === '{' || char === '}' || char === '_' || char === '-';
                        const val = value[index + prefix.length] || '';

                        if (isSpecial) {
                            return (
                                <span key={index} className="text-cyber-700 text-2xl font-bold px-1 select-none">
                                    {char}
                                </span>
                            );
                        }

                        return (
                            <div
                                key={index}
                                className={`
                                    w-10 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-all relative
                                    ${showResult
                                        ? isCorrect
                                            ? 'border-cyber-primary bg-cyber-primary/10 text-cyber-primary shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                                            : 'border-cyber-danger bg-cyber-danger/10 text-cyber-danger'
                                        : val
                                            ? 'border-cyber-primary/50 bg-cyber-primary/5 text-white'
                                            : 'border-cyber-800 bg-black/40 text-cyber-700'
                                    }
                                    ${!disabled && !showResult && 'group-hover:border-cyber-700'}
                                `}
                            >
                                {val}
                                {!val && !showResult && <div className="absolute bottom-3 w-4 h-0.5 bg-cyber-800 animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hidden Input to capture keyboard events */}
            <input
                type="text"
                disabled={disabled || showResult}
                value={value}
                onChange={(e) => {
                    const newVal = e.target.value.toUpperCase();
                    // Basic validation: must match pattern length or structure
                    if (newVal.length <= pattern.length) {
                        onChange(newVal);
                    }
                }}
                className="opacity-0 absolute inset-0 cursor-default pointer-events-none"
                autoFocus
            />

            {!showResult && (
                <p className="text-[10px] font-bold text-cyber-700 uppercase tracking-widest pl-1">
                    Click challenge area & start typing to inject payload...
                </p>
            )}
        </div>
    );
};

const CodeBlock = ({ content, language = 'bash' }) => {
    return (
        <div className="relative group my-6 overflow-hidden rounded-lg border border-cyber-700 bg-[#1e1e1e] select-text" dir="ltr">
            <div className="flex items-center px-4 py-2 bg-cyber-800 border-b border-cyber-700">
                <Terminal size={14} className="text-cyber-400 mr-2" />
                <span className="text-xs font-mono text-cyber-400">{language}</span>
            </div>
            <CopyButton text={content} />
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                wrapLongLines={true}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
};

const ChallengeBlock = ({ block, onSuccess, isPassed }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [flagInput, setFlagInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const { t } = useLanguage();

    const metadata = block.metadata || {};
    const challengeType = metadata.challengeType || 'multiple_choice'; // 'multiple_choice' or 'flag'
    const question = metadata.question || block.content || "Challenge data missing";
    const options = metadata.options || [];
    const correctOption = metadata.correctAnswer ?? -1;
    const correctFlag = metadata.correctFlag || "";
    const explanation = metadata.explanation || "";
    const hint = metadata.hint || "";
    const flagPattern = metadata.flagPattern || "FLAG{...}";

    useEffect(() => {
        if (isPassed) {
            setShowResult(true);
            if (challengeType === 'multiple_choice') {
                setSelectedOption(correctOption);
            } else {
                setFlagInput(correctFlag);
            }
        }
    }, [isPassed, challengeType, correctOption, correctFlag]);

    const handleSubmit = () => {
        setShowResult(true);
        if (isCorrect && onSuccess) {
            onSuccess(block.id, metadata.points || 0);
        }
    };

    const isCorrect = challengeType === 'multiple_choice'
        ? selectedOption === correctOption
        : flagInput.trim().toLowerCase() === correctFlag.trim().toLowerCase();

    return (
        <div className="card my-8 border border-cyber-700 p-0 bg-cyber-900/30 rounded-xl overflow-hidden select-text">
            {/* Header */}
            <div className="bg-cyber-800/30 px-5 py-3 border-b border-cyber-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-cyber-400">
                        {challengeType === 'multiple_choice' ? <AlertCircle size={18} /> : <Key size={18} />}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                            {challengeType === 'multiple_choice' ? 'Question' : 'Flag Challenge'}
                            {metadata.points > 0 && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {metadata.points} PTS
                                </span>
                            )}
                        </h4>
                    </div>
                </div>
                {hint && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5
                            ${showHint ? 'bg-amber-500/10 text-amber-500' : 'text-cyber-500 hover:text-amber-500 hover:bg-cyber-800'}
                        `}
                    >
                        <Lightbulb size={14} />
                        {showHint ? 'Hide Hint' : 'Hint'}
                    </button>
                )}
            </div>

            <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                {/* Question Text */}
                <div dir="auto" className="text-white font-medium text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                    {question}
                </div>

                {/* Hint Area */}
                {showHint && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
                            <p className="text-sm text-amber-200 italic leading-relaxed">{hint}</p>
                        </div>
                    </div>
                )}

                {/* Challenge Body */}
                <div className="space-y-4">
                    {challengeType === 'multiple_choice' ? (
                        <div className="grid grid-cols-1 gap-2.5">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    disabled={showResult}
                                    onClick={() => setSelectedOption(index)}
                                    className={`
                                        px-4 py-3 rounded-lg border text-start transition-all flex items-center justify-between group
                                        ${showResult
                                            ? index === correctOption
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100'
                                                : index === selectedOption
                                                    ? 'bg-red-500/10 border-red-500/50 text-red-100'
                                                    : 'bg-cyber-900/30 border-cyber-800 text-cyber-500 opacity-50'
                                            : selectedOption === index
                                                ? 'bg-cyber-800 border-cyber-primary text-white'
                                                : 'bg-cyber-900/30 border-cyber-800 text-cyber-300 hover:bg-cyber-800 hover:border-cyber-600'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-colors
                                            ${selectedOption === index ? 'bg-cyber-primary text-black' : 'bg-cyber-800 text-cyber-400'}
                                        `}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span dir="auto" className="text-sm md:text-base">{option}</span>
                                    </div>
                                    {showResult && index === correctOption && <Check size={18} className="text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    disabled={showResult}
                                    value={flagInput}
                                    onChange={(e) => setFlagInput(e.target.value)}
                                    placeholder={flagPattern || "FLAG{...}"}
                                    className={`w-full bg-cyber-900/50 border rounded-lg py-3 px-4 font-mono text-base md:text-lg focus:outline-none transition-colors
                                        ${showResult
                                            ? isCorrect ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
                                            : 'border-cyber-700 focus:border-cyber-primary text-white'
                                        }
                                    `}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={challengeType === 'multiple_choice' ? selectedOption === null : !flagInput.trim()}
                        className="btn btn-primary w-full py-3 rounded-lg font-medium transition-all"
                    >
                        Check Answer
                    </button>
                ) : (
                    <div className={`p-4 rounded-lg border animate-in zoom-in-95 duration-300 ${isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {isCorrect ? <Check size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                            </div>
                            <div>
                                <p className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </p>
                                {explanation && (
                                    <p dir="auto" className="text-sm mt-2 text-cyber-300">{explanation}</p>
                                )}
                            </div>
                        </div>
                        {!isCorrect && (
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setFlagInput('');
                                    setSelectedOption(null);
                                }}
                                className="mt-4 text-sm font-medium text-cyber-400 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Play size={14} className="rotate-180" /> Try Again
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const YouTubeBlock = ({ url }) => {
    const { t } = useLanguage();
    // Extract video ID from URL
    const getEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const embedUrl = getEmbedUrl(url);

    if (!embedUrl) return <div className="text-red-500">{t('renderer.invalidVideo')}</div>;

    return (
        <div className="my-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-cyber-700 bg-black">
            <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

const ToggleBlock = ({ block, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="my-2">
            <div className="flex items-start gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="mt-1.5 p-0.5 rounded hover:bg-cyber-700/50 text-cyber-500 transition-colors"
                >
                    <ChevronRight size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <div className="flex-1">
                    <p dir="auto" className="text-cyber-300 text-lg leading-relaxed">{block.content}</p>
                    {isOpen && (
                        <div className="mt-2 pl-2 border-l-2 border-cyber-700/50">
                            <p dir="auto" className="text-cyber-400 text-base leading-relaxed">{block.metadata?.details}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ImageBlockRenderer = ({ block }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (block.content?.startsWith('tg://')) {
            setLoading(true);
            const fileId = block.content.replace('tg://', '');
            getTelegramFileUrl(fileId)
                .then(url => { if (isMounted) { setPreviewUrl(url); setLoading(false); } })
                .catch(err => { console.error("Image load failed", err); if (isMounted) setLoading(false); });
        } else {
            setPreviewUrl(block.content || '');
        }
        return () => { isMounted = false; };
    }, [block.content]);

    if (loading) {
        return (
            <div className="my-6 w-full h-48 bg-cyber-900/50 rounded-xl border border-cyber-700 flex items-center justify-center text-cyber-500 animate-pulse">
                <Loader2 size={24} className="animate-spin" />
            </div>
        );
    }

    if (!previewUrl) return null;

    if (previewUrl.includes('.mp4') || previewUrl.match(/\.(webm|ogg)(\?|$)/)) {
        return (
            <div className="my-6">
                <video src={previewUrl} controls className="w-full h-auto rounded-xl shadow-lg border border-cyber-700 bg-black/50" />
            </div>
        );
    }

    return (
        <div className="my-6">
            <img
                src={previewUrl}
                alt="Content"
                className="w-full h-auto rounded-xl shadow-lg border border-cyber-700 bg-black/50"
                loading="lazy"
            />
        </div>
    );
};

const BlockNote = ({ note, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note || '');

    useEffect(() => {
        setText(note || '');
    }, [note]);

    if (!isEditing && !note) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="absolute right-0 -top-3 md:top-1/2 md:-translate-y-1/2 md:-right-10 opacity-40 md:opacity-20 hover:opacity-100 transition-all p-2 text-cyber-400 hover:text-fuchsia-400 bg-cyber-900/90 rounded-lg border border-cyber-700 hover:border-fuchsia-500/50 z-10 shadow-lg"
                title="Add a private note here"
            >
                <MessageSquare size={14} />
            </button>
        );
    }

    if (!isEditing && note) {
        return (
            <div className="mt-3 bg-fuchsia-500/10 border-l-2 border-fuchsia-500 p-3 rounded-r-lg group/note relative text-sm w-full">
                <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare size={12} className="text-fuchsia-400" /> 
                    <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400">Your Private Note</span>
                </div>
                <div className="text-fuchsia-200/90 whitespace-pre-wrap leading-relaxed" dir="auto">{note}</div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover/note:opacity-100 p-1.5 text-fuchsia-400 hover:text-white bg-black/40 rounded hover:bg-fuchsia-500/50 transition-colors"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <div className="mt-3 bg-cyber-900 border border-cyber-700 hover:border-fuchsia-500/50 rounded-lg p-3 transition-colors shadow-2xl relative z-20 w-full animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-fuchsia-400" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Write Private Note</span>
                </div>
            </div>
            <textarea
                autoFocus
                className="w-full bg-black/40 text-sm text-fuchsia-100 outline-none resize-none min-h-[80px] rounded p-3 border border-cyber-800 focus:border-fuchsia-500/50 transition-colors"
                placeholder="What are your thoughts on this section? (visible only to you)"
                value={text}
                onChange={e => setText(e.target.value)}
                dir="auto"
            />
            <div className="flex justify-end gap-2 mt-3">
                <button
                    onClick={() => { setIsEditing(false); setText(note || ''); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-cyber-500 hover:text-white px-3 py-1.5 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => { onSave(text.trim()); setIsEditing(false); }}
                    className="text-[10px] font-black uppercase tracking-widest bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/50 hover:bg-fuchsia-500 hover:text-white px-4 py-1.5 rounded transition-all shadow-[0_0_15px_rgba(217,70,239,0.1)] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                >
                    Save Note
                </button>
            </div>
        </div>
    );
};

const TableBlock = ({ content }) => {

    // Basic Markdown Table Parser
    const lines = content.trim().split('\n');
    const headers = lines[0]?.split('|').slice(1, -1).map(h => h.trim()) || [];
    const alignmentLine = lines[1]?.split('|').slice(1, -1).map(a => a.trim()) || [];
    const rows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(c => c.trim()));

    // alignments: :--- (left), :---: (center), ---: (right)
    const alignments = alignmentLine.map(a => {
        if (a.startsWith(':') && a.endsWith(':')) return 'text-center';
        if (a.endsWith(':')) return 'text-end';
        return 'text-start';
    });

    return (
        <div className="overflow-x-auto my-6 rounded-lg border border-cyber-700 bg-cyber-900/30">
            <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                <thead className="text-xs uppercase bg-cyber-800 text-cyber-400">
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i} scope="col" className={`px-6 py-3 border-b border-cyber-700 ${alignments[i] || ''}`}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-cyber-700/50 hover:bg-cyber-800/50 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className={`px-6 py-4 font-medium text-white whitespace-pre-wrap ${alignments[j] || ''}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const BlockRenderer = ({ block, index, onToggle, isEditor = false, onSuccess, isPassed, userNote, onSaveNote }) => {
    const { t } = useLanguage();

    // Utility for style commonalities
    const commonClasses = "text-start leading-relaxed select-text";

    // In editor mode, remove large margins to match the input fields
    const spacingClass = isEditor ? 'mb-1' : 'mb-6';
    const headingSpacing = isEditor ? 'mt-4 mb-2' : 'mt-10 mb-6';
    const listSpacing = isEditor ? 'mb-2' : 'mb-8';
    const blockSpacing = isEditor ? 'my-2' : 'my-8';
    const dividerSpacing = isEditor ? 'my-4' : 'my-12';

    const getDirection = (text) => {
        if (!text) return 'ltr';
        // Check for the first strong directional character (Arabic or English)
        const match = text.match(/[\u0600-\u06FFa-zA-Z]/);
        if (match) {
            return /[\u0600-\u06FF]/.test(match[0]) ? 'rtl' : 'ltr';
        }
        return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
    };

    const parseMarkdown = (text) => {
        if (!text) return '';
        let html = text
            // Markdown Links [text](url)
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyber-primary hover:underline underline-offset-4 break-all">$1</a>')
            // Bold **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
            // Italic *text*
            .replace(/\*(.*?)\*/g, '<em class="text-cyber-400 italic">$1</em>')
            // Inline Code `text`
            .replace(/`([^`]+)`/g, '<code class="bg-cyber-800 text-cyber-300 px-1.5 py-0.5 rounded font-mono text-sm border border-cyber-700">$1</code>');
            
        // Auto-link raw URLs that are not part of an <a> tag
        html = html.replace(/(<a [^>]+>.*?<\/a>)|(https?:\/\/[^\s<]+)/g, (match, aTag, url) => {
            if (aTag) return aTag;
            // It's a raw URL, wrap it
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-cyber-primary hover:underline underline-offset-4 break-all">${url}</a>`;
        });
        
        return html;
    };

    const renderContent = () => {

    switch (block.type) {
        case 'table':
            return <TableBlock content={block.content} />;

        case 'quiz':
            return <ChallengeBlock block={block} onSuccess={onSuccess} isPassed={isPassed} />;
        case 'heading':
        case 'h1':
        case 'h2':
        case 'h3':
            let LevelTag = 'h2';
            let sizeClass = 'text-3xl';

            if (block.type === 'h1') { LevelTag = 'h1'; sizeClass = 'text-xl md:text-4xl'; }
            else if (block.type === 'h2') { LevelTag = 'h2'; sizeClass = 'text-lg md:text-3xl'; }
            else if (block.type === 'h3') { LevelTag = 'h3'; sizeClass = 'text-base md:text-2xl'; }
            else if (block.type === 'heading') {
                const level = block.metadata?.level || 2;
                LevelTag = `h${level}`;
                const sizes = { 
                    1: 'text-xl md:text-4xl', 
                    2: 'text-lg md:text-3xl', 
                    3: 'text-base md:text-2xl', 
                    4: 'text-sm md:text-xl', 
                    5: 'text-xs md:text-lg', 
                    6: 'text-[10px] md:text-base' 
                };
                sizeClass = sizes[level] || 'text-base md:text-2xl';
            }

            return (
                <LevelTag
                    dir={getDirection(block.content)}
                    className={`${sizeClass} font-bold text-white ${headingSpacing} ${commonClasses}`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
                />
            );

        case 'text':
            return (
                <div
                    dir={getDirection(block.content)}
                    className={`prose prose-invert max-w-none text-cyber-300 ${spacingClass} text-sm md:text-lg leading-relaxed whitespace-pre-wrap break-words ${commonClasses}`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
                />
            );

        case 'list':
        case 'bullet':
            // Handle both legacy 'list' (array of items) and new 'bullet' (single text content)
            if (block.type === 'list' && Array.isArray(block.items)) {
                return (
                    <ul dir="auto" className={`list-disc list-inside space-y-3 text-cyber-300 ${listSpacing} marker:text-cyber-primary text-base md:text-lg ${commonClasses}`}>
                        {block.items.map((item, i) => (
                            <li key={i} dir={getDirection(item)} dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                        ))}
                    </ul>
                );
            }
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-2 md:gap-3 mb-2 text-cyber-300 text-sm md:text-lg break-words ${commonClasses}`}>
                    <span className="text-cyber-primary mt-1 md:mt-1.5 shrink-0">•</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }} />
                </div>
            );

        case 'numbered':
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-2 md:gap-3 mb-2 text-cyber-300 text-sm md:text-lg break-words ${commonClasses}`}>
                    <span className="text-cyber-primary font-mono mt-0.5 shrink-0">{index ? `${index}.` : '1.'}</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }} />
                </div>
            );

        case 'todo':
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-3 mb-2 text-base md:text-lg ${commonClasses}`}>
                    <div
                        onClick={() => onToggle && onToggle(block.id, !block.metadata?.checked)}
                        className={`
                            mt-1.5 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer hover:border-cyber-primary shrink-0
                            ${block.metadata?.checked
                                ? 'bg-cyber-primary border-cyber-primary text-black'
                                : 'border-cyber-600 bg-transparent text-transparent'
                            }
                        `}
                    >
                        <Check size={14} strokeWidth={4} />
                    </div>
                    <span
                        className={`flex-1 ${block.metadata?.checked ? 'text-cyber-600 line-through' : 'text-cyber-300'}`}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
                    />
                </div>
            );

        case 'toggle':
            return <ToggleBlock block={block} />;

        case 'quote':
            return (
                <blockquote dir="auto" className={`border-s-4 border-cyber-primary ps-6 py-2 ${blockSpacing} text-lg md:text-xl italic text-cyber-200 bg-cyber-900/30 rounded-e-lg select-text ${commonClasses}`}>
                    "{block.content}"
                </blockquote>
            );

        case 'code':
            return <CodeBlock content={block.content} language={block.metadata?.language} />;

        case 'youtube':
            return <YouTubeBlock url={block.content} />;

        case 'image':
            return <ImageBlockRenderer block={block} />;





        case 'divider':
            return <hr className={`${dividerSpacing} border-cyber-700/50`} />;

        case 'warning':
            return (
                <div dir="auto" className={`bg-cyber-danger/10 border-s-4 border-cyber-danger p-6 ${blockSpacing} rounded-e-xl shadow-lg select-text`}>
                    <strong className="text-cyber-danger flex items-center gap-2 mb-2">
                        <AlertCircle size={18} />
                        {t('renderer.warning')}
                    </strong>
                    <p className="text-cyber-100 text-base leading-relaxed">{block.content}</p>
                </div>
            );

        case 'tip':
        case 'info':
            return (
                <div dir="auto" className={`bg-cyber-primary/10 border-s-4 border-cyber-primary p-6 ${blockSpacing} rounded-e-xl shadow-lg select-text`}>
                    <strong className="text-cyber-primary flex items-center gap-2 mb-2">
                        <Play size={18} className="fill-cyber-primary" />
                        {block.type.toUpperCase()}
                    </strong>
                    <p className="text-cyber-100 text-base leading-relaxed">{block.content}</p>
                </div>
            );

        default:
            return <div className="text-red-500 p-4 border border-dashed border-red-500 rounded my-4">Unsupported block type: {block.type}</div>;
    }
    };
    
    const content = renderContent();
    if (isEditor) return content;
    
    const canHaveNote = block.type !== 'divider' && block.type !== 'quiz';

    return (
        <div className="relative group/block w-full">
            {content}
            {canHaveNote && (
                <BlockNote note={userNote} onSave={(text) => onSaveNote?.(block.id, text)} />
            )}
        </div>
    );
};

export default BlockRenderer;
