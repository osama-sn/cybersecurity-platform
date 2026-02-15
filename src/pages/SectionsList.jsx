import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Folder, ArrowRight, Lock } from 'lucide-react';

const SectionsList = () => {
    const { sections, loading } = useData();
    const { t } = useLanguage();

    if (loading) {
        return <div className="text-center py-20 text-cyber-400 animate-pulse">{t('sections.loading')}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-cyber-700 pb-4">
                <h1 className="text-3xl font-bold text-white">{t('sections.title')}</h1>
                <span className="text-cyber-400 text-sm">{t('sections.available').replace('{count}', sections.length)}</span>
            </div>

            <div className="grid gap-6">
                {sections.map((section, index) => (
                    <Link
                        key={section.id}
                        to={`/sections/${section.id}`}
                        className="card group hover:bg-cyber-800 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-cyber-primary/5 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyber-700 group-hover:bg-cyber-primary transition-colors" />

                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-cyber-900 rounded-lg border border-cyber-700 text-cyber-400 group-hover:text-cyber-primary group-hover:border-cyber-primary/30 transition-colors">
                                    <Folder size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-cyber-primary transition-colors">
                                        {section.title}
                                    </h2>
                                    <p className="text-cyber-400 text-sm line-clamp-2">
                                        {section.description || t('sections.fallbackDesc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center text-cyber-500 group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1">
                                <ArrowRight size={20} className="rtl:rotate-180" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-xs font-mono text-cyber-500">
                            <span className="bg-cyber-900 px-2 py-1 rounded border border-cyber-700">
                                {t('sections.modulePrefix')}{index + 1}
                            </span>
                            <span>{t('sections.topicsCount').replace('{count}', section.modulesCount || 0)}</span>
                        </div>
                    </Link>
                ))}

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
