import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Folder, ArrowRight, Lock, Layout } from 'lucide-react';

const SectionsSkeleton = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between border-b border-cyber-700 pb-4">
            <div className="w-48 h-8 bg-cyber-800 rounded-lg animate-pulse" />
            <div className="w-32 h-4 bg-cyber-800/50 rounded animate-pulse" />
        </div>

        <div className="grid gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="card relative overflow-hidden bg-cyber-900/40 border border-cyber-800/50 p-6 rounded-2xl animate-pulse">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-800" />
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-cyber-800 rounded-lg border border-cyber-700/30 w-12 h-12" />
                            <div className="space-y-3">
                                <div className="w-64 h-6 bg-cyber-800 rounded" />
                                <div className="w-96 h-4 bg-cyber-800/60 rounded" />
                            </div>
                        </div>
                        <div className="w-5 h-5 bg-cyber-800 rounded" />
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="w-24 h-6 bg-cyber-800/40 rounded" />
                        <div className="w-32 h-4 bg-cyber-800/30 rounded" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SectionsList = () => {
    const { sections, loading } = useData();
    const { user, userData, isAdmin, isSuperAdmin } = useAuth();
    const { t } = useLanguage();

    const hasAccess = (sectionId) => {
        if (!user) return false;
        if (isAdmin || isSuperAdmin) return true;
        if (!userData?.allowedSections || userData.allowedSections.length === 0) return true;
        return userData.allowedSections.includes(sectionId);
    };

    if (loading) {
        return <SectionsSkeleton />;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-cyber-700 pb-4">
                <h1 className="text-3xl font-bold text-white">{t('sections.title')}</h1>
                <span className="text-cyber-400 text-sm">{t('sections.available').replace('{count}', sections.filter(s => hasAccess(s.id)).length)}</span>
            </div>

            <div className="grid gap-6">
                {sections.map((section, index) => {
                    const isLocked = section.isLocked && !isAdmin && !isSuperAdmin;

                    const cardContent = (
                        <div
                            className={`card group hover:bg-cyber-800 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-cyber-primary/5 relative overflow-hidden ${isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full ${isLocked ? 'bg-amber-600' : 'bg-cyber-700 group-hover:bg-cyber-primary'} transition-colors`} />

                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 bg-cyber-900 rounded-lg border transition-colors ${isLocked ? 'border-amber-900/50 text-amber-500' : 'border-cyber-700 text-cyber-400 group-hover:text-cyber-primary group-hover:border-cyber-primary/30'}`}>
                                        {isLocked ? <Lock size={24} /> : <Folder size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-1 group-hover:text-cyber-primary transition-colors flex items-center gap-2">
                                            {section.title}
                                            {isLocked && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest font-black">Locked</span>}
                                        </h2>
                                        <p className="text-cyber-400 text-sm line-clamp-2">
                                            {section.description || t('sections.fallbackDesc')}
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-center transition-transform rtl:group-hover:-translate-x-1 ${isLocked ? 'text-cyber-800' : 'text-cyber-500 group-hover:translate-x-1'}`}>
                                    <ArrowRight size={20} className="rtl:rotate-180" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-xs font-mono text-cyber-500">
                                <span className={`bg-cyber-900 px-2 py-1 rounded border ${isLocked ? 'border-amber-900/30' : 'border-cyber-700'}`}>
                                    {t('sections.modulePrefix')}{index + 1}
                                </span>
                                <span>{t('sections.topicsCount').replace('{count}', section.modulesCount || 0)}</span>
                            </div>
                        </div>
                    );

                    if (isLocked) {
                        return <div key={section.id}>{cardContent}</div>;
                    }

                    return (
                    <Link
                        key={section.id}
                        to={`/sections/${section.id}`}
                    >
                        {cardContent}
                    </Link>
                    );
                })}

                {sections.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-cyber-700 rounded-lg">
                        <p className="text-cyber-500">{t('sections.noSections')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionsList;
