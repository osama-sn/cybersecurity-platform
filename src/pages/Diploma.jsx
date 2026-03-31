import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Shield, Trophy, Target, BookOpen, Users, CreditCard, 
  FileText, CheckCircle2, Award, Briefcase, Zap, Brain, Terminal, 
  Heart, LineChart, ChevronDown, MonitorPlay, Code, Database 
} from 'lucide-react';
import ScrollReveal from '../components/animations/ScrollReveal';
import { useLanguage } from '../context/LanguageContext';

const Diploma = () => {
  const { isRTL } = useLanguage();
  const [activeModule, setActiveModule] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const features = [
    { icon: Trophy, title: 'Leaderboard', desc: 'باسمك ونقطك… كل حاجة بتعملها محسوبة', color: 'text-yellow-400' },
    { icon: Zap, title: 'إشادة علنية', desc: 'بوست أسبوعي على LinkedIn لأفضل المتدربين', color: 'text-blue-400' },
    { icon: Terminal, title: 'مختبرات حقيقية', desc: 'اشتراك مجاني على Hack The Box للـ Top of the Month', color: 'text-cyber-primary' },
    { icon: Award, title: 'تدريب مجاني', desc: 'الأول ياخد تدريب Pentesting كامل مجانًا', color: 'text-purple-400' },
    { icon: Target, title: 'خصومات قوية', desc: 'للتاني والتالت في الترتيب', color: 'text-cyber-danger' },
    { icon: Briefcase, title: 'ترشيحات عمل', desc: 'ترشيحات شغل مباشرة للمتميزين', color: 'text-cyber-secondary' },
    { icon: Users, title: 'Community', desc: 'مجتمع فيه ملخصات وماتريال تقيلة', color: 'text-orange-400' },
    { icon: CreditCard, title: 'تسهيلات دفع', desc: 'حل لمشكلة الدفع وتقسيط على 3 دفعات', color: 'text-emerald-400' },
    { icon: Heart, title: 'Referral System', desc: 'خصم يوصل لـ 1500 جنيه', color: 'text-pink-400' },
    { icon: FileText, title: 'دعم وظيفي', desc: 'تعديل CV + Template جاهز', color: 'text-gray-300' },
    { icon: Code, title: 'Cheatsheets', desc: 'شيتات بكل Commands الأدوات', color: 'text-cyber-accent' },
    { icon: Shield, title: 'شهادة معتمدة', desc: 'شهادة إتمام معتمدة من TechPlus', color: 'text-teal-400' },
  ];

  const modules = [
    {
      title: 'الأسبوع 1: Introduction',
      icon: BookOpen,
      desc: 'فهم الـ Pentesting process كاملة والمشي على Methodology صح',
      items: [
        'التعريف بمسار Penetration Tester',
        'Penetration Testing Overview & Process',
        'Pre-Engagement & Information Gathering',
        'Vulnerability Assessment & Exploitation',
        'Post-Exploitation & Lateral Movement',
        'Proof-of-Concept & Report Writing'
      ],
      outcome: 'تفهم الـ Pentesting process كاملة، تمشي على Methodology صح في أي Target، وتبدأ تفكر بعقلية Pentester'
    },
    {
      title: 'الأسبوع 2: Recon & Enumeration',
      icon: MonitorPlay,
      desc: 'جمع المعلومات والتعداد باستخدام Nmap',
      items: [
        'Network Enumeration with Nmap',
        'Introduction to Nmap & Host Discovery',
        'Host and Port Scanning & Saving Results',
        'Service Enumeration & Nmap Scripting Engine',
        'Network Performance Tuning',
        'Firewall and IDS/IPS Evasion + Easy/Med/Hard Labs'
      ],
      outcome: 'تعمل Enumeration كامل لأي Network، تستخدم Nmap باحتراف، تحدد attack surface بدقة، وتتعامل مع Firewalls'
    },
    {
      title: 'الأسبوع 3-4: Footprinting',
      icon: Target,
      desc: 'اكتشاف الخدمات ونقاط الضعف',
      items: [
        'Domain Information & Cloud Resources',
        'Enumerating Staff, FTP, SMB, NFS',
        'DNS, SMTP, IMAP/POP3, SNMP',
        'MySQL, MSSQL, Oracle TNS, IPMI',
        'Linux/Windows Remote Management Protocols',
        'Footprinting Labs + Skills Assessment'
      ],
      outcome: 'تجمع معلومات عن أي Target، تكتشف Services و Weak Points، وتبني صورة كاملة قبل الهجوم'
    },
    {
      title: 'الأسبوع 5: Vulnerability Assessment',
      icon: Shield,
      desc: 'تقييم الثغرات واكتشافها',
      items: [
        'Security Assessments & Standards',
        'CVSS & CVE Systems Overview',
        'Vulnerability Scanning Principles',
        'Getting Started with Nessus & OpenVAS',
        'Scanning Issues & Results Exporting',
        'Skills Assessments & Reporting'
      ],
      outcome: 'تحدد الثغرات الحقيقية، تحلل النتائج وتبني Attack Plan، وتستخدم Tools بشكل احترافي'
    },
    {
      title: 'الأسبوع 6-8: Exploitation & Payloads',
      icon: Terminal,
      desc: 'نقل الملفات والهجوم وبناء الـ Shells',
      items: [
        'Windows & Linux File Transfer Methods',
        'Living off The Land & Evasion',
        'Anatomy of a Shell (Bind & Reverse)',
        'Introduction to Payloads & MSFvenom',
        'Infiltrating Windows & Linux',
        'Web Shells (Laudanum, Antak, PHP)'
      ],
      outcome: 'تدخل على Systems، تبني Payloads، وتستخدم Shells باحتراف، وتتعامل مع القيود'
    },
    {
      title: 'الأسبوع 9: Metasploit Framework',
      icon: Zap,
      desc: 'استخدام إطار العمل الأقوى للاختراق',
      items: [
        'Intro to MSFconsole, Modules, Targets',
        'Payloads, Encoders, Databases',
        'Plugins, Mixins, Sessions & Jobs',
        'Meterpreter Deep Dive',
        'Writing & Importing Modules',
        'Firewall/IDS/IPS evasion with MSF'
      ],
      outcome: 'تستخدم Metasploit بشكل احترافي، تدير Sessions و Meterpreter، وتبني Exploit كامل'
    },
    {
      title: 'الأسبوع 10-14: Web Security',
      icon: Code,
      desc: 'الفحص والهجوم على تطبيقات الويب',
      items: [
        'Information Gathering (Web Edition)',
        'Using Web Proxies (Burp Suite, ZAP)',
        'Login Brute Forcing (Hydra, Medusa)',
        'Attacking Web Apps with Ffuf',
        'Cross-Site Scripting (XSS) Discovery & Exploitation',
        'File Inclusion (LFI, RFI, PHP Wrappers)'
      ],
      outcome: 'تفصص وتهاجم تطبيقات الويب، تكتشف وتستغل XSS والـ Inclusions، وتعمل Fuzzing قوي'
    },
    {
      title: 'Advanced Web: SQLi & SQLMap',
      icon: Database,
      desc: 'فهم عميق لقواعد البيانات وثغرات الـ SQL Injection',
      items: [
        'Intro to Databases & SQL Statements',
        'Subverting Query Logic, Union Injections',
        'Database Enum, Reading/Writing Files',
        'SQLMap Overview & Tuning',
        'Advanced DB Enum & Bypassing Defenses',
        'OS Exploitation & Skills Assessment'
      ],
      outcome: 'تستخرج بيانات، تفهم SQL Injection بعمق، وتعمل Automation كامل للهجوم'
    }
  ];

  const certificates = [
    { title: 'OSCP', desc: 'من أقوى الشهادات. Practical + Problem Solving بامتياز.', icon: '💀' },
    { title: 'PNPT', desc: 'شهادة واقعية جدًا. فيها Reporting + Communication حقيقي.', icon: '🔥' },
    { title: 'CRTO', desc: 'للـ Red Teaming والتحرك جوا الشبكات (Lateral Movement).', icon: '⚔️' },
    { title: 'CRTP', desc: 'تركيز أعمق على Active Directory Exploitation لمتخصصي الريد تيم.', icon: '🧠' },
    { title: 'eWPTX', desc: 'متقدمة جدا في Web Pentesting بتخليك خبير Web Apps.', icon: '🌐' },
    { title: 'eCPPT', desc: 'متوسط/متقدم، خطوة ممتازة جدا تركزت على Network & Pivoting.', icon: '🧩' },
    { title: 'CPTS', desc: 'مسار شامل وحديث (Network, Web, AD) Hands-on بقوة عالية.', icon: '💣' },
    { title: 'eJPT', desc: 'أفضل بداية وتبني أساس قوي جدًا - وده هدف ليفل 1 عندنا!', icon: '🚀' },
  ];

  return (
    <div className="space-y-16 pb-20 font-arabic" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* 1. Hero Section */}
      <section className="relative pt-10 min-h-[50vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="relative z-10 max-w-4xl space-y-8">
          <motion.div variants={{hidden: {scale:0.8, opacity:0}, visible:{scale:1, opacity:1}}} className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-900/80 border border-cyber-primary/50 rounded-full text-cyber-primary">
            <Rocket size={18} />
            <span className="font-bold tracking-wide">LEVEL 1 / eJPT TRACK (3 MONTHS)</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Penetration Testing Diploma<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-primary to-cyber-secondary">From Zero → Certification Ready</span>
          </h1>

          <div className="card bg-cyber-900/60 border-l-4 border-l-cyber-danger p-6 max-w-3xl mx-auto shadow-2xl backdrop-blur">
            <p className="text-xl md:text-2xl text-cyber-200 font-bold leading-relaxed">
              خليني أتكلم معاك بصراحة 👇<br />
              المجال ده مش سهل… ومش لأي حد!<br />
              بس لو انت مستعد تتعب، تفهم، وتكمل للآخر… فانت داخل على طريق هيغيّر مستقبلك 💀🔥
            </p>
          </div>
        </motion.div>
      </section>

      {/* 2. Perks / Features */}
      <section className="px-4">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-4">🎁 المميزات اللي هتاخدها معانا</h2>
            <div className="h-1 w-20 bg-cyber-primary mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <ScrollReveal key={i} delay={i * 0.05} direction="up">
              <div className="bg-cyber-900/50 border border-cyber-800 p-6 rounded-2xl hover:border-cyber-primary/50 hover:bg-cyber-800 transition-all group h-full">
                <div className={`p-4 bg-cyber-950 rounded-xl inline-block mb-4 shadow-lg ${feature.color}`}>
                  <feature.icon size={28} className="group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-cyber-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 3. Why HTB and Why this track */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <ScrollReveal direction="left">
            <div className="card bg-cyber-900/40 border border-cyber-secondary/30 h-full p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-secondary/10 rounded-bl-full group-hover:scale-150 transition-transform" />
              <Target size={40} className="text-cyber-secondary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">❓ ليه Hack The Box؟</h3>
              <p className="text-cyber-300 text-lg leading-relaxed relative z-10">
                لأن ببساطة… Hack The Box هي أقرب حاجة لسوق العمل الحقيقي. 
                <br /><br />
                <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-cyber-secondary"/> بتتعلم على Labs حقيقية</span>
                <span className="flex items-center gap-2 mt-2"><Brain size={16} className="text-cyber-secondary"/> بتبني عقلية Pentester بجد</span>
                <span className="flex items-center gap-2 mt-2"><Target size={16} className="text-cyber-secondary"/> مش مجرد استخدام Tools</span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="card bg-cyber-900/40 border border-cyber-primary/30 h-full p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-primary/10 rounded-bl-full group-hover:scale-150 transition-transform" />
              <Trophy size={40} className="text-cyber-primary mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">🎯 ليه بدأنا بالمسار ده؟</h3>
              <p className="text-cyber-300 text-lg leading-relaxed relative z-10">
                لأننا بنمشيك صح مش بسرعة! 
                <br /><br />
                تبدأ بـ eJPT <strong>تبني أساس قوي</strong>، وبعد كده تقدر تدخل على أعظم الشهادات (OSCP / PNPT / CPTS) وانت جاهز فعلاً، وتبقى <strong>فاهم مشافظ</strong>.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Curriculum Modules */}
      <section className="px-4 max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-4">📚 الخطة الدراسية للمستوى الأول</h2>
            <div className="h-1 w-20 bg-cyber-primary mx-auto rounded-full" />
            <p className="text-cyber-400 mt-4">من الصفر حتى التأسيس الكامل (3 شهور)</p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {modules.map((mod, i) => (
            <ScrollReveal key={i} delay={i * 0.05} direction="up">
              <div 
                className={`card bg-cyber-900/50 border transition-all duration-300 cursor-pointer overflow-hidden ${activeModule === i ? 'border-cyber-primary shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-cyber-800 hover:border-cyber-600'}`}
                onClick={() => setActiveModule(activeModule === i ? null : i)}
              >
                <div className="flex items-center gap-4 p-4 md:p-6">
                  <div className={`p-3 rounded-xl ${activeModule === i ? 'bg-cyber-primary/20 text-cyber-primary' : 'bg-cyber-800 text-cyber-400'}`}>
                    <mod.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg md:text-xl font-bold ${activeModule === i ? 'text-white' : 'text-cyber-200'}`}>
                      {mod.title}
                    </h3>
                    <p className="text-cyber-400 text-sm mt-1">{mod.desc}</p>
                  </div>
                  <ChevronDown className={`text-cyber-500 transition-transform duration-300 ${activeModule === i ? 'rotate-180' : ''}`} />
                </div>
                
                <AnimatePresence>
                  {activeModule === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-cyber-800 bg-cyber-950/50"
                    >
                      <div className="p-6 md:p-8 space-y-6">
                        <ul className="grid md:grid-cols-2 gap-3">
                          {mod.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-cyber-300 text-sm">
                              <span className="text-cyber-primary shrink-0 mt-0.5">▹</span> {item}
                            </li>
                          ))}
                        </ul>
                        <div className="bg-cyber-900 p-4 rounded-xl border-l-4 border-cyber-secondary relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-cyber-secondary/10 rounded-bl-full" />
                          <p className="text-white font-bold mb-1 flex items-center gap-2">
                            <Target size={16} className="text-cyber-secondary" /> المخرجات (Outcome)
                          </p>
                          <p className="text-cyber-300 text-sm">{mod.outcome}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. Certifications Overview */}
      <section className="px-4 bg-cyber-900/40 py-16 border-y border-cyber-800 relative z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] z-[-1]" />
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
             <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white mb-4">🎓 دليل شهادات المجال</h2>
              <div className="h-1 w-20 bg-cyber-secondary mx-auto rounded-full" />
              <p className="text-cyber-400 mt-4 max-w-2xl mx-auto">علشان تبقى فاهم الصورة كاملة، وتعرف كل شهادة مكانها فين وقوتها إيه.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certificates.map((cert, i) => (
              <ScrollReveal key={i} delay={i * 0.05} direction="up">
                <div className="p-6 bg-cyber-950/80 border border-cyber-800 rounded-2xl hover:border-cyber-secondary/50 transition-all group h-full relative">
                  <span className="text-4xl absolute top-4 left-4 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">{cert.icon}</span>
                  <h3 className="text-2xl font-black text-white mb-2">{cert.title}</h3>
                  <p className="text-cyber-400 text-sm leading-relaxed relative z-10 pt-4">{cert.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How we teach & Requirements */}
      <section className="px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Requirements */}
        <ScrollReveal direction="right">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap className="text-cyber-warning" /> متطلبات الكورس
            </h3>
            <div className="bg-cyber-900/60 border border-cyber-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h4 className="text-white font-bold mb-3 flex items-center gap-2"><Brain size={18} className="text-cyber-primary"/> أساسيات يفضل معرفتها:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyber-800 rounded-lg text-sm text-cyber-300">Networking</span>
                  <span className="px-3 py-1 bg-cyber-800 rounded-lg text-sm text-cyber-300">Linux CLI</span>
                  <span className="px-3 py-1 bg-cyber-800 rounded-lg text-sm text-cyber-300">Basics of Programming</span>
                </div>
                <p className="text-sm text-cyber-500 mt-3 italic">ولو فيه أساسيات واقعة منك؟ متقلقش هنراجعها أثناء الشرح!</p>
              </div>
              <div className="border-t border-cyber-800 pt-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2"><Terminal size={18} className="text-cyber-secondary"/> أجهزة وأدوات:</h4>
                <ul className="space-y-2 text-cyber-300 text-sm">
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyber-primary"/> لاب توب بمواصفات تسمح بالتشغيل المعقول</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyber-primary"/> إنترنت مستقر</li>
                  <li className="flex gap-2"><CheckCircle2 size={16} className="text-cyber-primary"/> متصفح (مفيش داعي تسطب أدوات معقدة، كل الشغل من خلال الـ Box على المنصة)</li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* How we teach */}
        <ScrollReveal direction="left">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <LineChart className="text-cyber-primary" /> منهجيتنا في التدريس
            </h3>
            <div className="bg-cyber-900/60 border border-cyber-800 rounded-2xl p-6 md:p-8">
              <ul className="space-y-5">
                {[
                  { icon: BookOpen, text: 'هنشرح النظري خطوة خطوة وهنسألك للتأكد من استيعابك.' },
                  { icon: MonitorPlay, text: 'تطبيق عملي مباشر على Labs حقيقية.' },
                  { icon: Bug, text: 'حل اللاب معاك كـ Guidance، لكن مش هنجيب الـ Flag! عشان توصلها بإيدك وتتعلم.' },
                  { icon: FileText, text: 'كل الـ Sessions والـ Notes متقسمة على المنصة بشكل خرافي.' },
                  { icon: Brain, text: 'Skill Assessments دورية وهنساعدك فيها لحد ما تثبت المعلومات.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="mt-1 p-2 bg-cyber-800 rounded-xl text-cyber-400 group-hover:text-cyber-primary group-hover:bg-cyber-900 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-cyber-300 leading-relaxed font-medium">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 7. Master the Field (Tips) & CTA */}
      <section className="px-4 max-w-5xl mx-auto">
        <ScrollReveal direction="up">
          <div className="relative bg-gradient-to-br from-cyber-900 via-cyber-800 to-cyber-900 border border-cyber-primary/40 rounded-[3rem] p-8 md:p-14 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
            
            <div className="relative z-10 text-center mb-10">
              <Trophy size={48} className="text-cyber-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-5xl font-black text-white">إزاي تماستر المجال ده؟</h2>
              <p className="text-cyber-400 mt-4 text-lg">الخلاصة للوصول للاحترافية</p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
              {[
                'متستعجلش… النجاح محتاج وقت وصبر.',
                'اللي بيفرق محترف عن مبتدئ: الوقت والمجهود.',
                'مفيش حاجة سهلة، لو كانت سهلة كان الكل عملها!',
                'افهم متجريش تحفظ… الـ tools بتتغير بس المفهوم ثابت.',
                'المجال محتاج ناس تقيلة بجد مش سطحية.',
                'الدافع والنوايا السليمة بيختصروا عليك طريق طويل.',
                'لازم صاحب يشجعك ويشاركك نفس الهدف.',
                'متشتتش نفسك، اختار مسار وكمله للآخر.'
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-cyber-primary shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-cyber-200">{tip}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center relative z-10 pt-10 border-t border-cyber-800">
              <h3 className="text-2xl font-bold text-white mb-6">جاهز تبدأ الطريق وتغيّر مسارك؟</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <a href="mailto:osamaessamkhalifa@gmail.com" className="btn btn-primary px-10 py-4 text-xl rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform flex items-center justify-center gap-2">
                   <Rocket size={24} /> أحجز مكانك الآن
                 </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
};

export default Diploma;
