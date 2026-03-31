import React from 'react';
import { Mail, Github, Linkedin, Youtube, ExternalLink, Download, Shield, Target, Terminal, Brain, Briefcase, Award, BookOpen, Globe, ChevronRight, MapPin, Phone, GraduationCap, Bug, Wrench, FileText, Trophy, Zap, Code, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/animations/ScrollReveal';

const About = () => {
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
    { icon: Bug, label: 'Advanced Web Exploitation', detail: 'OOB XXE, Blind SQLi, Server-Side Forgery, RCE, DOM-XSS', color: 'cyber-primary' },
    { icon: Target, label: 'Vulnerability Research & Recon', detail: 'Advanced Fuzzing, Asset Discovery, OSINT Intelligence', color: 'cyber-secondary' },
    { icon: Terminal, label: 'Infrastructure Penetration', detail: 'Privilege Escalation, Active Directory Exploitation, Lateral Movement', color: 'cyber-accent' },
    { icon: Wrench, label: 'Offensive Security Tooling', detail: 'Burp Suite Pro, Metasploit Framework, Nmap, Custom Scripts', color: 'cyber-danger' },
    { icon: Globe, label: 'Enterprise Networking', detail: 'Cisco Routing/Switching, Deep Packet Inspection', color: 'cyber-warning' },
    { icon: FileText, label: 'Executive Reporting', detail: 'Actionable PoCs, Risk Assessment, Critical Impact Analysis', color: 'cyber-primary' },
  ];

  const achievements = [
    { icon: Shield, value: 'CRITICAL', label: 'Remote Access Zero-Days & High-Impact Vulnerabilities Discovered', color: 'from-red-500 to-orange-500' },
    { icon: Trophy, value: '100+', label: 'Advanced Web Security Labs Mastered on PortSwigger', color: 'from-cyber-primary to-emerald-400' },
    { icon: Award, value: 'ELITE', label: 'Completed Extensive Penetration Testing Paths', color: 'from-cyber-secondary to-blue-400' },
    { icon: Users, value: '2K+', label: 'Professionals Impacted Through Knowledge Platform', color: 'from-cyber-accent to-purple-400' },
  ];

  const certifications = [
    { name: 'CPTS', org: 'Hack The Box', status: 'completed', icon: '💀' },
    { name: 'OSCP', org: 'Offensive Security', status: 'completed', icon: '🛡️' },
    { name: 'PNPT', org: 'TCM Security', status: 'completed', icon: '🎯' },
    { name: 'eCPPT', org: 'INE', status: 'completed', icon: '⚔️' },
    { name: 'eJPT', org: 'INE', status: 'completed', icon: '🔧' },
    { name: 'CCNA', org: 'Cisco', status: 'certified', icon: '🌐' },
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
      dir="ltr"
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
          <div className="text-center lg:text-left space-y-5 flex-1">
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                Osama Essam
              </h1>
              <p className="text-xl md:text-2xl text-cyber-primary font-bold font-mono">
                Senior Penetration Tester | Offensive Security Researcher
              </p>
            </motion.div>

            {/* Contact Info Pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300">
                <MapPin size={14} className="text-cyber-primary" />
                Cairo, Egypt
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300">
                <Phone size={14} className="text-cyber-primary" />
                +20 10620599515
              </span>
              <a href="mailto:osamaessamkhalifa@gmail.com" className="flex items-center gap-2 px-3 py-1.5 bg-cyber-800/60 border border-cyber-700/50 rounded-full text-sm text-cyber-300 hover:border-cyber-primary hover:text-white transition-all">
                <Mail size={14} className="text-cyber-primary" />
                osamaessamkhalifa@gmail.com
              </a>
            </motion.div>

            {/* Summary */}
            <motion.div variants={itemVariants} className="space-y-3 max-w-3xl">
              <p className="text-lg text-cyber-100 leading-relaxed font-medium">
                Elite Penetration Tester and Offensive Security Researcher with a proven track record of discovering critical vulnerabilities in enterprise environments, including high-impact Remote Code Execution and Remote Access flaws.
              </p>
              <p className="text-base text-cyber-400 leading-relaxed">
                Master of offensive security tactics, advanced web exploitation, and intricate network penetration testing methodologies. Actively shaping the cybersecurity landscape by engineering elite educational resources and elevating industry standards through cutting-edge threat research.
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
                <Mail size={20} /> Establish Contact
              </a>
              <button className="btn btn-outline flex items-center gap-2 text-lg px-8 py-3 group hover:border-white transition-all">
                <Download size={20} /> Download Executive CV
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== KEY ACHIEVEMENTS ===== */}
      <section>
        <ScrollReveal>
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">Impact & Milestones</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-primary to-cyber-accent mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {achievements.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.08} direction="up">
              <div className="group relative bg-cyber-900/60 border border-cyber-700/50 rounded-2xl p-6 md:p-8 text-center hover:border-cyber-primary/30 transition-all duration-500 overflow-hidden h-full flex flex-col justify-center">
                {/* Gradient bg on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                <div className="relative z-10 space-y-4">
                  <item.icon size={32} className="mx-auto text-cyber-400 group-hover:text-cyber-primary transition-colors" />
                  <div className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.value}
                  </div>
                  <p className="text-xs md:text-sm text-cyber-400 font-medium leading-tight">{item.label}</p>
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
            <h2 className="text-3xl md:text-4xl font-black text-white">Technical Arsenal</h2>
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
            <h2 className="text-3xl md:text-4xl font-black text-white">Tactical Experience</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-danger to-cyber-warning mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="relative bg-cyber-900/40 border border-cyber-700/50 rounded-3xl p-8 md:p-10 space-y-8 overflow-hidden">
            {/* Decorative line */}
            <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-cyber-primary/40 via-cyber-primary/10 to-transparent hidden md:block" />

            {/* Role Header */}
            <div className="flex items-center gap-4 pl-0 md:pl-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyber-danger/20 to-cyber-warning/10 border border-cyber-danger/20 flex items-center justify-center text-cyber-danger shrink-0">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Senior Security Researcher & Bug Bounty Hunter
                </h3>
                <p className="text-cyber-primary font-mono text-sm mt-1">Independent Operations</p>
              </div>
            </div>

            {/* Experience Items */}
            <div className="space-y-4 pl-0 md:pl-8">
              {[
                'Identified and exploited zero-day logic flaws and critical vulnerabilities in hardened enterprise applications.',
                'Specialized in advanced web exploitation, targeting complex authentication flows, SSRF integrations, and remote access systems.',
                'Generated comprehensive, executive-level technical reports outlining critical attack vectors with actionable remediation blueprints.',
                'Executed stealth-focused reconnaissance to map extensive external attack surfaces across corporate perimeters.'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-cyber-800/30 border border-cyber-700/30 rounded-xl hover:border-cyber-danger/30 transition-all group">
                  <div className="w-2 h-2 rounded-full bg-cyber-danger mt-2 shrink-0 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-shadow" />
                  <span className="text-cyber-200 text-base leading-relaxed">{item}</span>
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
            <h2 className="text-3xl md:text-4xl font-black text-white">Engineering & Development</h2>
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
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                    <Youtube size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Elite Cyber Research Channel</h3>
                    <p className="text-sm text-cyber-400 mt-1">Advanced Pentesting & Exploitation Tactics</p>
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
                  <div className="w-12 h-12 rounded-xl bg-cyber-primary/10 flex items-center justify-center text-cyber-primary shrink-0">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Elite Infosec Knowledge Base</h3>
                    <p className="text-sm text-cyber-400 mt-1">High-Tier Writeups & Strategic Attack Roadmaps</p>
                  </div>
                </div>
                <a href="https://osama-sn.github.io/cybersecurity-platform/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-cyber-primary hover:text-emerald-300 transition-colors font-mono">
                  <ExternalLink size={14} /> Platform Portal
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
            <h2 className="text-3xl md:text-4xl font-black text-white">Security Clearances & Certifications</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-cyber-warning to-cyber-primary mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert, i) => (
            <ScrollReveal key={i} delay={i * 0.05} direction="none">
              <div className="group h-full bg-cyber-900/50 border border-cyber-700/40 rounded-2xl p-6 hover:border-cyber-warning/30 hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-warning/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <span className="text-3xl drop-shadow-md">{cert.icon}</span>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-lg tracking-wide">{cert.name}</h4>
                    <p className="text-cyber-500 font-mono text-sm mt-1">{cert.org}</p>
                  </div>
                </div>
                <div className="mt-auto relative z-10">
                  {cert.status === 'certified' ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-primary/10 border border-cyber-primary/30 rounded-full text-xs text-cyber-primary font-bold tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      CERTIFIED PROFESSIONAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-secondary/10 border border-cyber-secondary/30 rounded-full text-xs text-cyber-secondary font-bold tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-secondary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      ACADEMIC REQUIREMENTS MET
                    </span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== COMMAND CENTER (CTA) ===== */}
      <ScrollReveal direction="up">
        <section className="relative bg-gradient-to-br from-cyber-900 via-cyber-800/80 to-cyber-900 border border-cyber-primary/30 p-12 md:p-16 rounded-[3rem] text-center space-y-8 overflow-hidden group mt-12">
          {/* Animated bg */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_60%)] group-hover:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] transition-all duration-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[3px] bg-gradient-to-r from-transparent via-cyber-primary/80 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Shield size={56} className="text-cyber-primary mx-auto opacity-90" />
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Ready to Secure Your Perimeter?
            </h2>
            <p className="text-cyber-300 text-lg leading-relaxed">
              Open to elite penetration testing engagements and collaborative security research opportunities capable of shaping the future of enterprise defense.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <a href="mailto:osamaessamkhalifa@gmail.com" className="btn btn-primary text-xl px-12 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 font-bold uppercase tracking-wider">
                <Terminal size={20} className="inline mr-2" />
                Initiate Protocol
              </a>
              <a href="https://www.linkedin.com/in/osama-essam-a23382372" target="_blank" rel="noopener noreferrer" className="btn btn-outline text-xl px-12 py-4 rounded-2xl border-2 hover:bg-white/5 font-bold uppercase tracking-wider text-cyber-200">
                <Linkedin size={20} className="inline mr-2" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="text-center pt-20 pb-4 border-t border-cyber-800/50 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-sm font-mono tracking-widest text-cyber-400 uppercase">
          &copy; 2026 // SYSTEM_OVERRIDE_ESTABLISHED // PENTESTER_OSAMA
        </p>
      </footer>
    </motion.div>
  );
};

export default About;
