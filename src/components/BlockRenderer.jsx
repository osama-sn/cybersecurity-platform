import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal, Play, AlertCircle, AlertTriangle, Key, Lightbulb, ArrowRight, Lock, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
        <div className="relative group my-6 overflow-hidden rounded-lg border border-cyber-700 bg-[#1e1e1e]" dir="ltr">
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

const ChallengeBlock = ({ block }) => {
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

    const handleSubmit = () => {
        setShowResult(true);
    };

    const isCorrect = challengeType === 'multiple_choice'
        ? selectedOption === correctOption
        : flagInput.trim().toLowerCase() === correctFlag.trim().toLowerCase();

    return (
        <div className="card my-8 border-s-4 border-s-cyber-primary p-0 bg-cyber-900/40 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.05)]">
            {/* Header */}
            <div className="bg-cyber-800/50 px-6 py-4 border-b border-cyber-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyber-primary/10 flex items-center justify-center border border-cyber-primary/20">
                        {challengeType === 'multiple_choice' ? <AlertCircle size={20} className="text-cyber-primary" /> : <Key size={20} className="text-cyber-primary" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">{challengeType === 'multiple_choice' ? 'Multiple Choice Challenge' : 'Flag Submission Challenge'}</h4>
                        <p className="text-[10px] text-cyber-500 uppercase tracking-widest leading-none mt-1">Status: {showResult ? (isCorrect ? 'DECRYPTED' : 'ACCESS DENIED') : 'LOCKED'}</p>
                    </div>
                </div>
                {hint && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest
                            ${showHint ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-cyber-900 text-cyber-500 border border-cyber-700 hover:border-amber-500/50 hover:text-amber-500'}
                        `}
                    >
                        <Lightbulb size={14} />
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                )}
            </div>

            <div className="p-6 space-y-8">
                {/* Question Text */}
                <div dir="auto" className="text-white font-medium text-lg leading-relaxed whitespace-pre-wrap">
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
                        <div className="grid grid-cols-1 gap-3">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    disabled={showResult}
                                    onClick={() => setSelectedOption(index)}
                                    className={`
                                        p-4 rounded-xl border text-start transition-all flex items-center justify-between group relative overflow-hidden
                                        ${showResult
                                            ? index === correctOption
                                                ? 'bg-cyber-primary/20 border-cyber-primary text-white'
                                                : index === selectedOption
                                                    ? 'bg-cyber-danger/20 border-cyber-danger text-white'
                                                    : 'bg-cyber-900/50 border-cyber-700 text-cyber-500 opacity-60'
                                            : selectedOption === index
                                                ? 'bg-cyber-800 border-cyber-primary text-white shadow-[0_0_15px_rgba(0,243,255,0.1)]'
                                                : 'bg-cyber-900/50 border-cyber-700 text-cyber-300 hover:bg-cyber-800 hover:border-cyber-600'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4 z-10">
                                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all
                                            ${selectedOption === index ? 'bg-cyber-primary border-cyber-primary text-black' : 'border-cyber-700 text-cyber-500 group-hover:border-cyber-primary/50'}
                                        `}>
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        <span dir="auto" className="font-semibold">{option}</span>
                                    </div>
                                    {showResult && index === correctOption && <Check size={20} className="text-cyber-primary z-10" />}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold text-cyber-500 uppercase tracking-[0.2em]">System Identifier: <span className="text-cyber-primary">{flagPattern}</span></label>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(correctFlag || "FLAG{EXAMPLE}").split('').map((char, i) => (
                                            <div
                                                key={i}
                                                className={`
                                                transition-all duration-500 rounded-full
                                                ${char === ' ' ? 'w-4 h-1 mt-1.5 opacity-0' : 'w-2 h-2'}
                                                ${flagInput.length > i ? 'bg-cyber-primary shadow-[0_0_8px_rgba(0,243,255,0.6)]' : 'bg-cyber-800'}
                                            `}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-mono text-cyber-500">{flagInput.length} / {correctFlag.length || '??'}</span>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                    <Terminal size={18} className={`transition-colors duration-300 ${flagInput ? 'text-cyber-primary' : 'text-cyber-700'}`} />
                                </div>
                                <input
                                    type="text"
                                    autoFocus
                                    disabled={showResult}
                                    maxLength={correctFlag.length || 100}
                                    value={flagInput}
                                    onChange={(e) => setFlagInput(e.target.value)}
                                    placeholder="Waiting for flag input..."
                                    className={`w-full bg-black/60 border-2 rounded-2xl py-6 pl-14 pr-6 font-mono text-xl tracking-[0.2em] focus:outline-none transition-all duration-300
                                        ${showResult
                                            ? isCorrect ? 'border-cyber-primary text-cyber-primary bg-cyber-primary/5 shadow-[0_0_30px_rgba(0,243,255,0.1)]' : 'border-cyber-danger text-cyber-danger bg-cyber-danger/5'
                                            : 'border-cyber-800 focus:border-cyber-primary text-white shadow-inner focus:shadow-[0_0_20px_rgba(0,243,255,0.05)]'
                                        }
                                    `}
                                />
                                {/* Underline decoration */}
                                <div className={`absolute bottom-0 left-0 h-1 bg-cyber-primary transition-all duration-500 rounded-b-2xl ${showResult ? 'w-full' : 'w-0 group-focus-within:w-full opacity-50'}`} />
                            </div>

                            <p className="text-[10px] font-bold text-cyber-700 uppercase tracking-widest text-center animate-pulse">
                                Input terminal active • UTF-8 Encoding • Secure validation enabled
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={challengeType === 'multiple_choice' ? selectedOption === null : !flagInput.trim()}
                        className="btn btn-primary w-full py-5 rounded-xl font-bold uppercase tracking-[0.3em] shadow-xl shadow-cyber-primary/10 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                        <ArrowRight size={18} />
                        Submit Payload
                    </button>
                ) : (
                    <div className={`p-6 rounded-xl border-2 animate-in zoom-in-95 duration-300 ${isCorrect
                        ? 'bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary shadow-[0_0_30px_rgba(0,243,255,0.1)]'
                        : 'bg-cyber-danger/10 border-cyber-danger/30 text-cyber-danger'}`}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isCorrect ? 'bg-cyber-primary border-cyber-primary text-black' : 'bg-cyber-danger border-cyber-danger text-white'}`}>
                                {isCorrect ? <Check size={24} strokeWidth={3} /> : <AlertTriangle size={24} strokeWidth={3} />}
                            </div>
                            <div>
                                <p className="font-black text-xl uppercase tracking-[0.1em] italic">{isCorrect ? 'PROTOCOL SUCCESS' : 'SYSTEM REJECTION'}</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-70">{isCorrect ? 'Target neutralized / Key accepted' : 'Validation failed / Check credentials'}</p>
                            </div>
                        </div>
                        {explanation && (
                            <div className="mt-4 pt-4 border-t border-current/10">
                                <p dir="auto" className="text-sm font-medium leading-relaxed opacity-90">{explanation}</p>
                            </div>
                        )}
                        {!isCorrect && (
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setFlagInput('');
                                    setSelectedOption(null);
                                }}
                                className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-cyber-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Play size={10} className="rotate-180" /> Try Re-Submission
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

const BlockRenderer = ({ block, index, onToggle, isEditor = false }) => {
    const { t } = useLanguage();

    // Utility for style commonalities
    const commonClasses = "text-start leading-relaxed";

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
        // Simple parser for basic markdown
        let html = text
            // Bold **text**
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
            // Italic *text*
            .replace(/\*(.*?)\*/g, '<em class="text-cyber-400 italic">$1</em>')
            // Inline Code `text`
            .replace(/`([^`]+)`/g, '<code class="bg-cyber-800 text-cyber-300 px-1.5 py-0.5 rounded font-mono text-sm border border-cyber-700">$1</code>')
            // Wrapper Link [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyber-primary hover:underline underline-offset-4">$1</a>');
        return html;
    };

    switch (block.type) {
        case 'table':
            return <TableBlock content={block.content} />;

        case 'quiz':
            return <ChallengeBlock block={block} />;
        case 'heading':
        case 'h1':
        case 'h2':
        case 'h3':
            let LevelTag = 'h2';
            let sizeClass = 'text-3xl';

            if (block.type === 'h1') { LevelTag = 'h1'; sizeClass = 'text-4xl'; }
            else if (block.type === 'h3') { LevelTag = 'h3'; sizeClass = 'text-2xl'; }
            else if (block.type === 'heading') {
                const level = block.metadata?.level || 2;
                LevelTag = `h${level}`;
                const sizes = { 1: 'text-4xl', 2: 'text-3xl', 3: 'text-2xl', 4: 'text-xl', 5: 'text-lg', 6: 'text-base' };
                sizeClass = sizes[level] || 'text-2xl';
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
                    className={`prose prose-invert max-w-none text-cyber-300 ${spacingClass} text-lg whitespace-pre-wrap ${commonClasses}`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }}
                />
            );

        case 'list':
        case 'bullet':
            // Handle both legacy 'list' (array of items) and new 'bullet' (single text content)
            if (block.type === 'list' && Array.isArray(block.items)) {
                return (
                    <ul dir="auto" className={`list-disc list-inside space-y-3 text-cyber-300 ${listSpacing} marker:text-cyber-primary text-lg ${commonClasses}`}>
                        {block.items.map((item, i) => (
                            <li key={i} dir={getDirection(item)} dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
                        ))}
                    </ul>
                );
            }
            // For 'bullet', it's usually a single block per bullet in Notion-like editors, 
            // BUT if we want to group them, we'd need a different approach in the parent.
            // For now, let's render individual bullets.
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-3 mb-2 text-cyber-300 text-lg ${commonClasses}`}>
                    <span className="text-cyber-primary mt-1.5 shrink-0">•</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }} />
                </div>
            );

        case 'numbered':
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-3 mb-2 text-cyber-300 text-lg ${commonClasses}`}>
                    <span className="text-cyber-primary font-mono mt-0.5 shrink-0">{index ? `${index}.` : '1.'}</span>
                    <span className="flex-1" dangerouslySetInnerHTML={{ __html: parseMarkdown(block.content) }} />
                </div>
            );

        case 'todo':
            return (
                <div dir={getDirection(block.content)} className={`flex items-start gap-3 mb-2 text-lg ${commonClasses}`}>
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
                <blockquote dir="auto" className={`border-s-4 border-cyber-primary ps-6 py-2 ${blockSpacing} text-xl italic text-cyber-200 bg-cyber-900/30 rounded-e-lg ${commonClasses}`}>
                    "{block.content}"
                </blockquote>
            );

        case 'code':
            return <CodeBlock content={block.content} language={block.metadata?.language} />;

        case 'youtube':
            return <YouTubeBlock url={block.content} />;

        case 'image':
            return (
                <div className="my-6">
                    <img
                        src={block.content}
                        alt="Content"
                        className="w-full h-auto rounded-xl shadow-lg border border-cyber-700"
                        loading="lazy"
                    />
                </div>
            );





        case 'divider':
            return <hr className={`${dividerSpacing} border-cyber-700/50`} />;

        case 'warning':
            return (
                <div dir="auto" className={`bg-cyber-danger/10 border-s-4 border-cyber-danger p-6 ${blockSpacing} rounded-e-xl shadow-lg`}>
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
                <div dir="auto" className={`bg-cyber-primary/10 border-s-4 border-cyber-primary p-6 ${blockSpacing} rounded-e-xl shadow-lg`}>
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

export default BlockRenderer;
