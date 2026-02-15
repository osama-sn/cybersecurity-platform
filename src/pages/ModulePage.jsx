import { useParams, Link } from 'react-router-dom';
import { sectionsData } from '../data/sectionsData';
import PageShell from '../layouts/PageShell';
import GlassCard from '../components/GlassCard';
import { BookOpen, Clock, Target } from 'lucide-react';

const ModulePage = () => {
  const { sectionId, moduleId } = useParams();
  const section = sectionsData.find(s => s.id === sectionId);
  const module = section?.modules.find(m => m.id === moduleId);

  if (!section || !module) {
    return (
      <PageShell
        title="Module Not Found"
        subtitle="The requested module does not exist."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Not Found' }]}
      >
        <GlassCard className="p-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
          >
            Return to Home
          </Link>
        </GlassCard>
      </PageShell>
    );
  }

  const estMinutes = Math.max(10, Math.round(module.topics.length * 15));

  return (
    <PageShell
      title={module.title}
      subtitle={module.description}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: section.title, to: `/section/${sectionId}` },
        { label: module.title },
      ]}
      rightSlot={
        <Link
          to={`/section/${sectionId}`}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
        >
          Back to Section
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
            {module.topics.map((topic, index) => (
              <Link
                key={topic.id}
                to={`/section/${sectionId}/module/${moduleId}/topic/${topic.id}`}
                className="block group"
              >
                <GlassCard className="p-6 h-full hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs text-white/60">Topic {index + 1}</div>
                      <h3 className="mt-2 text-xl font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                        {topic.title}
                      </h3>
                      <p className="mt-3 text-sm text-white/70 line-clamp-3">
                        {topic.content}
                      </p>
                    </div>
                    <div className="shrink-0 text-white/60 group-hover:text-white transition-colors">→</div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80">
                      <BookOpen size={14} />
                      Read
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white/80">
                      <Target size={14} />
                      Practice
                    </span>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-6">
            <h3 className="text-xl font-bold text-white">Module Summary</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Topics</span>
                <span className="text-white font-semibold">{module.topics.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Estimated</span>
                <span className="text-white font-semibold inline-flex items-center gap-2">
                  <Clock size={16} className="text-white/70" />
                  {estMinutes}m
                </span>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-white/70">Progress</div>
                <div className="mt-3 w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <div className="mt-2 text-xs text-white/50">0 / {module.topics.length} completed</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
};

export default ModulePage;
