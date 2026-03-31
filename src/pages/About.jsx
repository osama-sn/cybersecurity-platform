import React from 'react';
import { Mail, Github, Linkedin, Youtube, ExternalLink, Download, Shield, Target, Terminal, Brain, Briefcase, Award, BookOpen, Globe, ChevronRight, MapPin, Phone, GraduationCap, Bug, Wrench, FileText, Trophy, Zap, Code, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import ScrollReveal from '../components/animations/ScrollReveal';

const About = () => {
  const { t, isRTL } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  const skills = [
    { icon: Bug, label: isRTL ? 'استغلال الويب' : 'Web Exploitation', detail: 'XSS, SQLi, IDOR, SSRF, Auth Bypass', color: 'cyber-primary' },
    { icon: Target, label: isRTL ? 'باج باونتي واستطلاع' : 'Bug Bounty & Recon', detail: 'Fuzzing, Subdomains, OSINT', color: 'cyber-secondary' },
    { icon: Terminal, label: isRTL ? 'الاستغلال' : 'Exploitation', detail: 'RCE, Privilege Escalation', color: 'cyber-accent' },
    { icon: Wrench, label: isRTL ? 'الأدوات' : 'Tools', detail: 'Burp Suite, Nmap, FFUF, Metasploit', color: 'cyber-danger' },
    { icon: Globe, label: isRTL ? 'الشبكات' : 'Networking', detail: isRTL ? 'مستوى CCNA' : 'CCNA Level', color: 'cyber-warning' },
    { icon: FileText, label: isRTL ? 'كتابة التقارير' : 'Reporting', detail: isRTL ? 'PoC + تقارير احترافية' : 'PoC + Professional Reports', color: 'cyber-primary' },
  ];

  const achievements = [
    { icon: Shield, value: '3', label: isRTL ? 'ثغرات Remote Access مكتشفة' : 'Remote Access Vulnerabilities', color: 'from-red-500 to-orange-500' },
    { icon: Trophy, value: '100+', label: isRTL ? 'لاب محلول على PortSwigger' : 'PortSwigger Labs Solved', color: 'from-cyber-primary to-emerald-400' },
    { icon: Award, value: '✓', label: isRTL ? 'مسار TryHackMe Penetration Tester' : 'TryHackMe Pen Tester Path', color: 'from-cyber-secondary to-blue-400' },
    { icon: Users, value: '2K+', label: isRTL ? 'مشاهدة على المنصة والمحتوى' : 'Platform & Content Views', color: 'from-cyber-accent to-purple-400' },
  ];

  const certifications = [
    { name: 'CCNA', org: 'Cisco', status: 'certified', icon: '🏅' },
    { name: 'CPTS', org: 'HTB', status: 'completed', icon: '📘' },
    { name: 'OSCP', org: 'OffSec', status: 'completed', icon: '📘' },
    { name: 'PNPT', org: 'TCM', status: 'completed', icon: '📘' },
    { name: 'eCPPT', org: 'INE', status: 'completed', icon: '📘' },
    { name: 'eJPT', org: 'INE', status: 'completed', icon: '📘' },
    { name: isRTL ? 'أمن سيبراني للمبتدئين' : 'Cybersecurity For Beginners', org: 'Mahara-Tech (ITI)', status: 'certified', icon: '🏅', hours: '35' },
    { name: isRTL ? 'الاختراق الأخلاقي' : 'Ethical Hacking', org: 'Udemy & Mahara-Tech', status: 'certified', icon: '🏅' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/osama-essam-a23382372', label: 'LinkedIn', color: '#0077B5' },
    { icon: Github, href: 'https://github.com/osama-sn', label: 'GitHub', color: '#fff' },
    { icon: Youtube, href: 'https://www.youtube.com/@OsamaEssam710', label: 'YouTube', color: '#FF0000' },
    { icon: ExternalLink, href: 'https://osama-sn.github.io/cybersecurity-platform/', label: 'Platform', color: '#10b981' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-6xl mx-auto space-y-20 pb-20 px-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-10">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyber-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center gap-12">
          {/* Profile Image */}
          <motion.div variants={itemVariants} className="relative group shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-br from-cyber-primary via-cyber-secondary to-cyber-accent rounded-full blur-lg opacity-20 group-hover:opacity-40 transition duration-700" />
            <div className="absolute -inset-1 bg-gradient-to-br from-cyber-primary to-cyber-accent rounded-full opacity-60" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full bg-cyber-900 p-1 overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}osama.jpeg`} alt="Osama Essam" className="w-full h-full object-cover rounded-full" />
            </div>
            {/* Status badge */}
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-cyber-primary rounded-full border-2 border-cyber-900 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
          </motion.div>

          {/* Info */}
          <div className="text-center lg:text-start space-y-5 flex-1">
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                {isRTL ? 'أسامة عصام خليفة' : 'Osama Essam Khalifa'}
              </h1>
              <p className="text-xl md:text-2xl text-cyber-primary font-bold font-mono">
                {isRTL ? 'مختبر اختراق | باحث أمني' : 'Penetration Tester | Security Researcher'}
              </p>
            </motion.div>

            {/* Contact Info Pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300">
                <MapPin size={14} className="text-cyber-primary" />
                {isRTL ? 'القاهرة، مصر' : 'Cairo, Egypt'}
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300">
                <Phone size={14} className="text-cyber-primary" />
                010620599515
              </span>
              <a href="mailto:osamaessamkhalifa@gmail.com" className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300 hover:border-cyber-primary hover:text-white transition-all">
                <Mail size={14} className="text-cyber-primary" />
                osamaessamkhalifa@gmail.com
              </a>
            </motion.div>

            {/* Summary */}
            <motion.div variants={itemVariants} className="space-y-3 max-w-3xl">
              <p className="text-lg text-cyber-100 leading-relaxed">
                {isRTL
                  ? 'مختبر اختراق وباحث أمني ذو خبرة مثبتة في اكتشاف ثغرات حقيقية في العالم الواقعي، بما في ذلك مشاكل الوصول عن بُعد. خلفية قوية في استغلال الويب، صيد الثغرات، ومختبرات الأمن الهجومي.'
                  : 'Results-driven Penetration Tester and Security Researcher with proven experience in discovering real-world vulnerabilities, including remote access issues. Strong background in web exploitation, bug bounty hunting, and offensive security labs.'
                }
              </p>
              <p className="text-base text-cyber-400 leading-relaxed">
                {isRTL
                  ? 'أساهم بنشاط في بناء مجتمع الأمن السيبراني من خلال محتوى تعليمي ومنصة مخصصة لمشاركة المعرفة.'
                  : 'Actively building cybersecurity community through educational content and a dedicated knowledge-sharing platform.'
                }
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-2.5 bg-cyber-800/40 border border-cyber-700 rounded-xl text-sm text-cyber-300 hover:text-white hover:border-cyber-primary/50 hover:bg-cyber-800 transition-all duration-300"
                >
                  <link.icon size={18} style={{ color: link.color }} className="group-hover:scale-110 transition-transform" />
                  {link.label}
                </a>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 pt-3">
              <a href="mailto:osamaessamkhalifa@gmail.com" className="btn btn-primary flex items-center gap-2 text-lg px-8 py-3 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all">
                <Mail size={20} /> {isRTL ? 'تواصل معي' : 'Contact Me'}
              </a>
              <button className="btn btn-outline flex items-center gap-2 text-lg px-8 py-3 group hover:border-white transition-all">
                <Download size={20} /> {isRTL ? 'تحميل السيرة الذاتية' : 'Download CV'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== KEY ACHIEVEMENTS ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">{isRTL ? 'الإنجازات الرئيسية' : 'Key Achievements'}</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-primary to-cyber-accent mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {achievements.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.08} direction="up">
              <div className="group relative bg-cyber-900/60 border border-cyber-700/50 rounded-2xl p-6 md:p-8 text-center hover:border-cyber-primary/30 transition-all duration-500 overflow-hidden h-full">
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative z-10 space-y-3">
                  <item.icon size={28} className="mx-auto text-cyber-400 group-hover:text-cyber-primary transition-colors" />
                  <div className={`text-3xl md:text-4xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.value}
                  </div>
                  <p className="text-sm text-cyber-400 font-medium leading-tight">{item.label}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== CORE SKILLS ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">{isRTL ? 'المهارات الأساسية' : 'Core Skills'}</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-secondary to-cyber-primary mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, i) => (
            <ScrollReveal key={i} delay={i * 0.07} direction="up">
              <div className="group h-full bg-cyber-900/50 border border-cyber-700/50 rounded-2xl p-6 hover:border-cyber-primary/40 hover:bg-cyber-800/40 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${skill.color}/10 flex items-center justify-center text-${skill.color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <skill.icon size={24} />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-white font-bold text-lg">{skill.label}</h3>
                    <p className="text-cyber-400 text-sm font-mono leading-relaxed">{skill.detail}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">{isRTL ? 'الخبرة العملية' : 'Experience'}</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-danger to-cyber-warning mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="relative bg-cyber-900/40 border border-cyber-700/50 rounded-3xl p-8 md:p-10 space-y-8 overflow-hidden">
            {/* Decorative line */}
            <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-cyber-primary/40 via-cyber-primary/10 to-transparent hidden md:block" />

            {/* Role Header */}
            <div className={`flex items-center gap-4 ${isRTL ? 'md:pr-8' : 'md:pl-8'}`}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-danger/20 to-cyber-warning/10 border border-cyber-danger/20 flex items-center justify-center text-cyber-danger">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {isRTL ? 'باحث أمني / صائد ثغرات' : 'Security Researcher / Bug Bounty Hunter'}
                </h3>
                <p className="text-cyber-primary font-mono text-sm">{isRTL ? 'عمل مستقل' : 'Independent'}</p>
              </div>
            </div>

            {/* Experience Items */}
            <div className={`space-y-4 ${isRTL ? 'md:pr-8' : 'md:pl-8'}`}>
              {[
                isRTL ? 'اكتشاف والإبلاغ عن ثغرات في تطبيقات حقيقية' : 'Identified and reported vulnerabilities in real-world applications',
                isRTL ? 'تخصص في استغلال الويب ومشاكل الوصول عن بُعد' : 'Specialized in web exploitation and remote access issues',
                isRTL ? 'تقديم تقارير عالية الجودة مع خطوات إعادة إنتاج واضحة' : 'Delivered high-quality reports with clear reproduction steps',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-cyber-800/30 border border-cyber-700/30 rounded-xl hover:border-cyber-danger/30 transition-all group">
                  <div className="w-2 h-2 rounded-full bg-cyber-danger mt-2 shrink-0 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-shadow" />
                  <span className="text-cyber-200 text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== PROJECTS ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">{isRTL ? 'المشاريع' : 'Projects'}</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-accent to-cyber-secondary mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {/* YouTube Channel */}
          <ScrollReveal direction="left">
            <div className="group h-full bg-cyber-900/50 border border-cyber-700/50 rounded-2xl p-7 hover:border-red-500/30 transition-all duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 rounded-full blur-[60px] group-hover:bg-red-500/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{isRTL ? 'قناة يوتيوب للأمن السيبراني' : 'Cybersecurity YouTube Channel'}</h3>
                    <p className="text-sm text-cyber-400">{isRTL ? 'محتوى تعليمي في اختبار الاختراق' : 'Educational pentesting content'}</p>
                  </div>
                </div>
                <a href="https://www.youtube.com/@OsamaEssam710" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-mono">
                  <ExternalLink size={14} /> @OsamaEssam710
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Platform */}
          <ScrollReveal direction="right">
            <div className="group h-full bg-cyber-900/50 border border-cyber-700/50 rounded-2xl p-7 hover:border-cyber-primary/30 transition-all duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyber-primary/5 rounded-full blur-[60px] group-hover:bg-cyber-primary/10 transition-colors" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyber-primary/10 flex items-center justify-center text-cyber-primary">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{isRTL ? 'منصة معرفة اختبار الاختراق' : 'Pentesting Knowledge Platform'}</h3>
                    <p className="text-sm text-cyber-400">{isRTL ? 'مصدر عام للـ Writeups و الخرائط التعليمية' : 'Public resource for writeups and roadmaps'}</p>
                  </div>
                </div>
                <a href="https://osama-sn.github.io/cybersecurity-platform/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyber-primary hover:text-emerald-300 transition-colors font-mono">
                  <ExternalLink size={14} /> osama-sn.github.io
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CERTIFICATIONS ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">{isRTL ? 'الشهادات' : 'Certifications'}</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-warning to-cyber-primary mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert, i) => (
            <ScrollReveal key={i} delay={i * 0.05} direction="none">
              <div className="group h-full bg-cyber-900/50 border border-cyber-700/40 rounded-2xl p-5 hover:border-cyber-warning/30 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{cert.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-sm leading-tight truncate">{cert.name}</h4>
                    <p className="text-cyber-500 text-xs mt-0.5">{cert.org}</p>
                  </div>
                </div>
                <div className="mt-auto">
                  {cert.status === 'certified' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyber-primary/10 border border-cyber-primary/20 rounded-full text-xs text-cyber-primary font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary" />
                      {isRTL ? 'معتمد' : 'Certified'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyber-secondary/10 border border-cyber-secondary/20 rounded-full text-xs text-cyber-secondary font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-secondary" />
                      {isRTL ? 'المحتوى مكتمل' : 'Content Completed'}
                    </span>
                  )}
                  {cert.hours && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-cyber-400 mt-2">
                      {cert.hours} {isRTL ? 'ساعة' : 'Hours'}
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Udemy Certificate Link */}
        <ScrollReveal>
          <div className="mt-6 text-center">
            <a
              href="https://www.udemy.com/certificate/UC-f3fee119-3f1d-47c8-a644-f9e3ce0036f3/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyber-800/40 border border-cyber-700/50 rounded-xl text-sm text-cyber-300 hover:text-white hover:border-cyber-primary/40 transition-all font-mono"
            >
              <Award size={16} className="text-cyber-warning" />
              {isRTL ? 'عرض شهادة Udemy' : 'View Udemy Certificate'}
              <ExternalLink size={14} />
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== LANGUAGES ===== */}
      <section>
        <ScrollReveal>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-3 px-6 py-4 bg-cyber-900/50 border border-cyber-700/40 rounded-2xl">
              <span className="text-2xl">🇪🇬</span>
              <div>
                <p className="text-white font-bold text-sm">{isRTL ? 'العربية' : 'Arabic'}</p>
                <p className="text-cyber-400 text-xs">{isRTL ? 'اللغة الأم' : 'Native'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-cyber-900/50 border border-cyber-700/40 rounded-2xl">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="text-white font-bold text-sm">{isRTL ? 'الإنجليزية' : 'English'}</p>
                <p className="text-cyber-400 text-xs">{isRTL ? 'متوسط' : 'Intermediate'}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ===== CTA SECTION ===== */}
      <ScrollReveal direction="up">
        <section className="relative bg-gradient-to-br from-cyber-900 via-cyber-800/80 to-cyber-900 border border-cyber-primary/20 p-12 md:p-16 rounded-[3rem] text-center space-y-8 overflow-hidden group">
          {/* Animated bg */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)] group-hover:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] transition-all duration-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[2px] bg-gradient-to-r from-transparent via-cyber-primary/60 to-transparent" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Zap size={48} className="text-cyber-primary mx-auto" />
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {isRTL ? 'مهتم بالتعاون؟' : "Let's Work Together"}
            </h2>
            <p className="text-cyber-400 text-lg">
              {isRTL
                ? 'دائمًا مستعد لفرص جديدة في مجال الأمن السيبراني واختبار الاختراق'
                : "Always open to new opportunities in cybersecurity and penetration testing"
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a href="mailto:osamaessamkhalifa@gmail.com" className="btn btn-primary text-xl px-12 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105">
                <Mail size={20} className="inline mr-2" />
                {isRTL ? 'راسلني' : 'Get In Touch'}
              </a>
              <a href="https://www.linkedin.com/in/osama-essam-a23382372" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-xl px-12 py-4 rounded-2xl border-2 hover:bg-white/5">
                <Linkedin size={20} className="inline mr-2" />
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="text-center pt-16 border-t border-cyber-800/50 opacity-50">
        <p className="text-sm font-mono tracking-widest text-cyber-500 uppercase">
          &copy; 2026 OSAMA_ESSAM // PENETRATION_TESTER // SECURITY_RESEARCHER
        </p>
      </footer>
    </motion.div>
  );
};

export default About;
