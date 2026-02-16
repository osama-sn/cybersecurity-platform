import React from 'react';
import { Mail, Github, Linkedin, Download, Server, Wifi, Lock, Code, Shield, Target, Terminal, Brain, FileText, Briefcase, Zap, Cpu, Network, Database, Key, ChevronRight, ArrowRight, CheckCircle2, User, List, Flag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/animations/ScrollReveal';

const About = () => {
  const { t, isRTL } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
      className="max-w-6xl mx-auto space-y-24 pb-20 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. Hero & Summary Section */}
      <section className="flex flex-col lg:flex-row items-center gap-12 pt-10">
        <motion.div variants={itemVariants} className="relative group shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyber-primary to-cyber-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full bg-cyber-900 border-2 border-cyber-700 p-1 overflow-hidden shadow-2xl">
            <img src={`${import.meta.env.BASE_URL}osama.jpeg`} alt="Osama" className="w-full h-full object-cover rounded-full" />
          </div>
        </motion.div>

        <div className="text-center lg:text-start space-y-6 flex-1">
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
              {t('about.title')}
            </h1>
            <p className="text-xl md:text-2xl text-cyber-primary font-bold">
              {t('about.role')}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4 max-w-3xl">
            <p className="text-xl text-cyber-100 leading-relaxed font-semibold">
              {t('about.summary')}
            </p>
            <p className="text-lg text-cyber-400 leading-relaxed">
              {t('about.summaryDetail')}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
            <button className="btn btn-primary flex items-center gap-2 text-lg px-8 py-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all">
              <Mail size={20} /> {t('about.contact')}
            </button>
            <button className="btn btn-outline flex items-center gap-2 text-lg px-8 py-3 group hover:border-white transition-all">
              <Download size={20} /> {t('about.cv')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Technical Expertise Matrix */}
      <section className="space-y-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* AD Security */}
          <ScrollReveal direction="up" className="h-full">
            <div className="card h-full flex flex-col group hover:bg-cyber-800 hover:border-cyber-primary/50 transition-all duration-300 transform hover:-translate-y-2 p-8 rounded-[2rem] border border-cyber-700 bg-cyber-900/40">
              <div className="w-14 h-14 rounded-2xl bg-cyber-primary/10 flex items-center justify-center mb-6 text-cyber-primary group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{t('about.ad.title')}</h3>
              <ul className="space-y-3 text-cyber-400 flex-1">
                {t('about.ad.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight size={18} className="mt-1 text-cyber-primary shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Internal Network */}
          <ScrollReveal delay={0.1} direction="up" className="h-full">
            <div className="card h-full flex flex-col group hover:bg-cyber-800 hover:border-cyber-secondary/50 transition-all duration-300 transform hover:-translate-y-2 p-8 rounded-[2rem] border border-cyber-700 bg-cyber-900/40">
              <div className="w-14 h-14 rounded-2xl bg-cyber-secondary/10 flex items-center justify-center mb-6 text-cyber-secondary group-hover:scale-110 transition-transform">
                <Network size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{t('about.internal.title')}</h3>
              <ul className="space-y-3 text-cyber-400 flex-1">
                {t('about.internal.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight size={18} className="mt-1 text-cyber-secondary shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Enumeration Expertise */}
          <ScrollReveal delay={0.2} direction="up" className="h-full">
            <div className="card h-full flex flex-col group hover:bg-cyber-800 hover:border-cyber-accent/50 transition-all duration-300 transform hover:-translate-y-2 p-8 rounded-[2rem] border border-cyber-700 bg-cyber-900/40">
              <div className="w-14 h-14 rounded-2xl bg-cyber-accent/10 flex items-center justify-center mb-6 text-cyber-accent group-hover:scale-110 transition-transform">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6">{t('about.enumeration.title')}</h3>
              <ul className="space-y-3 text-cyber-400 flex-1">
                {t('about.enumeration.items', { returnObjects: true }).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ChevronRight size={18} className="mt-1 text-cyber-accent shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Tools & Focus Areas */}
      <section className="grid lg:grid-cols-2 gap-12">
        {/* Tools Arsenal */}
        <ScrollReveal direction="left">
          <div className="space-y-8 bg-cyber-900/60 p-10 rounded-[2.5rem] border border-cyber-700 h-full">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyber-primary/10 text-cyber-primary rounded-2xl">
                <Terminal size={28} />
              </div>
              <h2 className="text-3xl font-bold text-white">{t('about.tools.title')}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {t('about.tools.items', { returnObjects: true }).map((tool, i) => (
                <div key={i} className="p-4 bg-cyber-800/50 border border-cyber-700 rounded-xl text-cyber-100 flex flex-col items-center justify-center text-center gap-2 hover:border-cyber-primary hover:bg-cyber-800 transition-all group">
                  <span className="text-sm font-mono font-bold tracking-tight">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Professional Focus */}
        <ScrollReveal direction="right">
          <div className="space-y-8 bg-cyber-800/20 p-10 rounded-[2.5rem] border border-cyber-700/50 backdrop-blur-sm h-full flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyber-danger/10 text-cyber-danger rounded-2xl">
                <Target size={28} />
              </div>
              <h2 className="text-3xl font-bold text-white">{t('about.focus.title')}</h2>
            </div>
            <div className="space-y-4">
              {t('about.focus.items', { returnObjects: true }).map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-cyber-900/80 border border-cyber-700 rounded-2xl hover:border-cyber-danger transition-all group">
                  <div className="w-2 h-2 rounded-full bg-cyber-danger group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-cyber-200 text-lg font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 4. Methodology Timeline */}
      <section className="space-y-6">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl font-black text-white">{t('about.methodology.title')}</h2>
            <div className="h-1 w-20 bg-cyber-primary mx-auto rounded-full"></div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {t('about.methodology.steps', { returnObjects: true }).map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction="none">
              <div className="p-6 bg-cyber-900/60 border border-cyber-700 rounded-3xl text-center space-y-4 hover:border-cyber-primary hover:-translate-y-2 transition-all group h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary flex items-center justify-center text-xs font-black group-hover:bg-cyber-primary group-hover:text-cyber-900 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h4 className="text-white font-bold text-sm tracking-tighter uppercase">{step}</h4>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal>
          <p className="text-center text-cyber-400 mt-10 italic font-medium">{t('about.methodology.footer')}</p>
        </ScrollReveal>
      </section>

      {/* 5. Call to Action */}
      <ScrollReveal direction="up">
        <section className="bg-gradient-to-br from-cyber-900 to-cyber-800 border border-cyber-primary/20 p-12 md:p-20 rounded-[3.5rem] text-center space-y-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <Briefcase size={64} className="text-cyber-primary mx-auto mb-6 animate-pulse-slow" />
            <h2 className="text-5xl font-black text-white leading-tight">
              {isRTL ? "تحليل المخاطر الحقيقية لأثر ملموس" : "Identifying real risk for measurable impact"}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button className="btn btn-primary text-2xl px-14 py-5 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:shadow-[0_0_70px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105">
                {t('about.contact')}
              </button>
              <button className="btn btn-outline text-2xl px-14 py-5 rounded-2xl border-2 hover:bg-white/5">
                {t('about.cv')}
              </button>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="text-center pt-20 border-t border-cyber-800 opacity-50">
        <p className="text-sm font-mono tracking-widest text-cyber-500 uppercase">
          &copy; 2026 OSAMA_PEN_TEST_V2.5 // MISSION_FOCUSED
        </p>
      </footer>
    </motion.div>
  );
};

export default About;
