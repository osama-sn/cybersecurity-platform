import { Link } from 'react-router-dom';
import { Shield, Terminal, BookOpen, User, Layers, Target, Briefcase, ChevronRight, Lock, Code, Database, Network, Key, Cpu, Github, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMode } from '../context/ModeContext';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/animations/ScrollReveal';

const Home = () => {
  const { setMode } = useMode();
  const { t, isRTL } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggeredChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      {/* 1. Hero Section */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-10 md:pt-16">
        {/* Background Glow Only */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="absolute w-[600px] h-[600px] bg-cyber-primary/5 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 space-y-8 max-w-5xl mx-auto flex flex-col items-center">
          {/* Small Professional Avatar */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <div className="absolute -inset-2 bg-cyber-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
              <div className="relative w-full h-full rounded-full border-2 border-cyber-primary/50 overflow-hidden bg-cyber-800 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <img
                  src="/osama.jpeg"
                  alt="Osama"
                  className="w-full h-full object-cover grayscale-[20%] contrast-110"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 bg-cyber-900 border border-cyber-primary rounded-xl shadow-lg">
                <Shield size={16} className="text-cyber-primary" />
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center justify-center gap-3 px-4 py-1.5 bg-cyber-900/60 rounded-full border border-cyber-primary/30 backdrop-blur-md"
          >
            <span className="text-[10px] md:text-xs font-mono text-cyber-400 uppercase tracking-[0.4em] font-bold">Verified Security Specialist</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none font-arabic"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.h2
              variants={itemVariants}
              className="text-xl md:text-3xl text-cyber-primary font-bold font-arabic tracking-wide"
            >
              {t('home.hero.subtitle')}
            </motion.h2>
          </div>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-cyber-300 max-w-3xl mx-auto leading-relaxed font-arabic"
          >
            {t('home.hero.description')}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/sections"
              onClick={() => setMode('learning')}
              className="btn btn-primary flex items-center gap-2 text-lg px-8 py-3 group shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all font-bold uppercase"
            >
              <Terminal size={20} />
              {t('home.hero.buttons.learning')}
              <ChevronRight className={`transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </Link>
            <Link
              to="/about"
              className="btn btn-outline flex items-center gap-2 text-lg px-8 py-3 group hover:border-cyber-secondary hover:text-cyber-secondary transition-all font-bold uppercase"
            >
              <User size={20} />
              {t('home.hero.buttons.profile')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Quick About */}
      <ScrollReveal direction="up">
        <section className="card bg-cyber-900/40 border-l-4 border-l-cyber-primary hover:border-l-emerald-400 transition-colors">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 font-arabic">
            <User className="text-cyber-primary" />
            {t('home.quickAbout.title')}
          </h3>
          <p className="text-cyber-200 leading-relaxed mb-6 font-arabic whitespace-pre-line">
            {t('home.quickAbout.content')}
          </p>
          <div className="bg-cyber-900/50 p-4 rounded-lg border border-cyber-700/50 italic text-cyber-400 font-arabic">
            "{t('home.quickAbout.quote')}"
          </div>
        </section>
      </ScrollReveal>

      {/* 3. Core Skills */}
      <section>
        <ScrollReveal>
          <h3 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3 font-arabic">
            <Cpu className="text-cyber-accent" />
            {t('home.coreSkills.title')}
          </h3>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Network Enum */}
          <ScrollReveal delay={0.1}>
            <div className="card h-full group hover:bg-cyber-800/50 hover:border-cyber-secondary/50 transition-all duration-300 transform hover:-translate-y-1">
              <Network size={32} className="text-cyber-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-4 font-arabic">{t('home.coreSkills.networkEnum.title')}</h4>
              <ul className="space-y-2 text-sm text-cyber-300 font-arabic">
                {t('home.coreSkills.networkEnum.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyber-secondary mt-1">▹</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* AD Attacks */}
          <ScrollReveal delay={0.2}>
            <div className="card h-full group hover:bg-cyber-800/50 hover:border-cyber-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <Database size={32} className="text-cyber-primary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-4 font-arabic">{t('home.coreSkills.adAttacks.title')}</h4>
              <ul className="space-y-2 text-sm text-cyber-300 font-arabic">
                {t('home.coreSkills.adAttacks.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyber-primary mt-1">▹</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Credential Attacks */}
          <ScrollReveal delay={0.3}>
            <div className="card h-full group hover:bg-cyber-800/50 hover:border-cyber-warning/50 transition-all duration-300 transform hover:-translate-y-1">
              <Key size={32} className="text-cyber-warning mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-4 font-arabic">{t('home.coreSkills.credentialAttacks.title')}</h4>
              <ul className="space-y-2 text-sm text-cyber-300 font-arabic">
                {t('home.coreSkills.credentialAttacks.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyber-warning mt-1">▹</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Tooling */}
          <ScrollReveal delay={0.4}>
            <div className="card h-full group hover:bg-cyber-800/50 hover:border-cyber-danger/50 transition-all duration-300 transform hover:-translate-y-1">
              <Terminal size={32} className="text-cyber-danger mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold text-white mb-4 font-arabic">{t('home.coreSkills.tooling.title')}</h4>
              <ul className="space-y-2 text-sm text-cyber-300 font-arabic">
                {t('home.coreSkills.tooling.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyber-danger mt-1">▹</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Platform Sections Preview */}
      <section className="space-y-8">
        <ScrollReveal>
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3 font-arabic">
              <Layers className="text-cyber-primary" />
              {t('home.platformSections.title')}
            </h3>
            <p className="text-cyber-400 font-arabic">{t('home.platformSections.description')}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'networkPlaybook', color: 'text-cyber-primary', animate: 'border-cyber-primary/20' },
            { key: 'activeDirectory', color: 'text-cyber-secondary', animate: 'border-cyber-secondary/20' },
            { key: 'enumeration', color: 'text-cyber-accent', animate: 'border-cyber-accent/20' },
            { key: 'tools', color: 'text-cyber-warning', animate: 'border-cyber-warning/20' },
            { key: 'cpts', color: 'text-cyber-danger', animate: 'border-cyber-danger/20' },
            { key: 'cheatsheets', color: 'text-white', animate: 'border-white/20' },
            { key: 'thinking', color: 'text-cyber-purple', animate: 'border-purple-500/20' }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05} direction="none">
              <div className={`p-4 bg-cyber-900 rounded-lg border ${item.animate} hover:bg-cyber-800 hover:-translate-y-1 transition-all group`}>
                <h4 className={`text-lg font-bold mb-2 ${item.color} font-arabic group-hover:brightness-125 transition-all`}>{t(`home.platformSections.items.${item.key}.title`)}</h4>
                <p className="text-sm text-cyber-400 font-arabic">{t(`home.platformSections.items.${item.key}.desc`)}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.5}>
          <div className="text-center text-sm text-cyber-500 mt-4 font-mono">
            [{t('home.platformSections.supports')}]
          </div>
        </ScrollReveal>
      </section>

      {/* 5. Philosophy */}
      <ScrollReveal direction="up">
        <section className="card bg-gradient-to-br from-cyber-900 via-cyber-800 to-cyber-900 border border-cyber-700">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 font-arabic">{t('home.philosophy.title')}</h3>
              <p className="text-cyber-200 mb-6 font-arabic">{t('home.philosophy.content')}</p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1 bg-cyber-primary rounded-full"></div>
                  <div>
                    <h4 className="text-cyber-primary font-bold font-arabic">{t('home.philosophy.modes.learning.title')}</h4>
                    <p className="text-sm text-cyber-400 font-arabic">{t('home.philosophy.modes.learning.desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1 bg-cyber-secondary rounded-full"></div>
                  <div>
                    <h4 className="text-cyber-secondary font-bold font-arabic">{t('home.philosophy.modes.reference.title')}</h4>
                    <p className="text-sm text-cyber-400 font-arabic">{t('home.philosophy.modes.reference.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-black/20 rounded-xl border border-cyber-700 group hover:border-cyber-primary/50 transition-colors">
              <p className="text-xl font-bold text-center text-white font-arabic group-hover:scale-105 transition-transform duration-500">
                "{t('home.philosophy.goal')}"
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 6. Current Focus */}
      <section className="text-center md:text-start">
        <ScrollReveal>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center md:justify-start gap-2 font-arabic">
            <Target className="text-cyber-danger animate-pulse" />
            {t('home.currentFocus.title')}
          </h3>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t('home.currentFocus.items', { returnObjects: true }).map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="left">
              <div className="flex items-center gap-3 p-3 bg-cyber-900 rounded border border-cyber-800 hover:border-cyber-danger/50 transition-colors group">
                <div className="w-2 h-2 rounded-full bg-cyber-danger group-hover:scale-150 transition-transform"></div>
                <span className="text-cyber-200 font-arabic">{item}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 7. Custom Tools Showcase */}
      <section className="space-y-8">
        <ScrollReveal>
          <div className="text-center md:text-start">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3 font-arabic">
              <Code className="text-cyber-primary" />
              {t('home.builtTools.title')}
            </h3>
            <p className="text-cyber-400 font-arabic">{t('home.builtTools.description')}</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {t('home.builtTools.items', { returnObjects: true }).map((tool, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="up">
              <div className="card h-full group hover:bg-cyber-800/50 hover:border-cyber-primary/50 transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyber-900 rounded border border-cyber-700">
                    <Terminal size={20} className="text-cyber-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-white">{tool.name}</h4>
                </div>
                <p className="text-sm text-cyber-300 font-arabic mb-6 flex-1">
                  {tool.desc}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-cyber-800">
                  <span className="text-xs font-mono text-cyber-500">{tool.tech}</span>
                  <Github size={16} className="text-cyber-400 hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up">
          <div className="text-center md:text-end">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-cyber-400 hover:text-cyber-primary transition-colors group">
              <Github size={18} />
              {t('home.builtTools.github')}
              <ChevronRight size={16} className={`transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* 8. For Companies */}
      <ScrollReveal direction="up">
        <section className="bg-cyber-800/30 p-8 rounded-2xl border border-cyber-700 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <Briefcase size={40} className="text-cyber-secondary mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold text-white mb-4 font-arabic">{t('home.forCompanies.title')}</h3>
          <p className="text-cyber-300 mb-6 font-arabic">{t('home.forCompanies.content')}</p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {t('home.forCompanies.items', { returnObjects: true }).map((item, i) => (
              <span key={i} className="px-3 py-1 bg-cyber-900 rounded-full border border-cyber-700 text-sm text-cyber-300 font-arabic hover:border-cyber-secondary transition-colors cursor-default">
                {item}
              </span>
            ))}
          </div>

          <p className="text-cyber-400 text-sm mb-6 max-w-2xl mx-auto font-arabic">
            {t('home.forCompanies.cta')}
          </p>

          <Link
            to="/about"
            className="btn btn-secondary px-8 py-3 inline-flex items-center gap-2 group-hover:bg-cyber-700 transition-all shadow-lg shadow-black/20"
          >
            {t('home.forCompanies.button')}
            <ChevronRight size={16} className={`transition-transform duration-300 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />
          </Link>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="text-center border-t border-cyber-800 pt-10 pb-4 space-y-4">
        <p className="text-cyber-primary font-medium font-arabic">{t('home.footer.copyright')}</p>
        <p className="text-cyber-500 text-sm font-arabic">{t('home.footer.builtWith')}</p>
        <div>
          <Link to="/login" className="text-xs text-cyber-700 hover:text-cyber-500 transition-colors font-arabic">
            {t('home.footer.admin')}
          </Link>
        </div>
      </footer>
    </motion.div>
  );
};

export default Home;
