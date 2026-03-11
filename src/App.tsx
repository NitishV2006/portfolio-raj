/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Download,
  Menu,
  X,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Globe,
  Award,
  FileCheck,
  Send,
  Terminal,
  Layers,
  BrainCircuit,
  ArrowUpRight,
  Plus,
  Loader2,
  CheckCircle2,
  Briefcase,
  Trophy,
  BadgeCheck,
  Calendar,
  Medal,
  Award as AwardIcon
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DitherShader } from "@/components/ui/dither-shader";
import { supabase } from '@/lib/supabase';
import AcademicMonitorWIP from '@/components/academic-monitor-wip';
import profileImg from './images/profile.png';

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '#home' },
    { name: 'ABOUT', href: '#about' },
    { name: 'SKILLS', href: '#skills' },
    { name: 'PROJECTS', href: '#projects' },
    { name: 'EXPERIENCE', href: '#experience' },
    { name: 'CERTIFICATIONS', href: '#certifications' },
    { name: 'ACHIEVEMENTS', href: '#achievements' },
    { name: 'CONTACT', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.a
          href="#home"
          className="text-2xl font-mono font-bold tracking-tighter dot-matrix"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          N<span className="text-nothing-red">.</span>V
        </motion.a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              className="text-xs font-mono font-bold text-white/50 hover:text-white transition-colors tracking-widest"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-mono font-bold text-white/70 hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-2 h-2 bg-nothing-red" />
      <motion.h2
        className="text-4xl md:text-6xl font-mono font-bold tracking-tighter uppercase"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        {title}
      </motion.h2>
    </div>
    {subtitle && (
      <motion.p
        className="text-white/40 max-w-2xl font-mono text-sm uppercase tracking-wider"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const BentoCard = ({ children, className = "", title, icon: Icon }: { children: React.ReactNode, className?: string, title?: string, icon?: any }) => (
  <motion.div
    className={`nothing-card flex flex-col ${className}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className="flex justify-between items-start mb-6">
      {title && <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-white/40">{title}</h3>}
      {Icon && <Icon size={18} className="text-white/20" />}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </motion.div>
);

// --- Main App ---

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      console.error('Supabase client is not initialized. Please check your environment variables.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    setStatus('loading');

    try {
      // Run both operations in parallel to reduce total wait time
      const [supabaseResult, emailResult] = await Promise.all([
        supabase.from('contact_submissions').insert([formData]),
        fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      ]);

      if (supabaseResult.error) throw supabaseResult.error;

      if (!emailResult.ok) {
        const errorData = await emailResult.json();
        console.warn('Email notification failed but data was saved:', errorData.error);
        // We still consider it a success if data was saved to DB
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <CheckCircle2 className="text-nothing-red w-12 h-12" />
        <h3 className="font-mono text-2xl font-bold tracking-tighter uppercase">Message Sent</h3>
        <p className="font-mono text-xs text-white/40 uppercase">Thank you for reaching out. I'll get back to you soon.</p>
        <button
          onClick={() => setStatus('idle')}
          className="font-mono text-[10px] text-nothing-red uppercase tracking-widest hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${supabase ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            {supabase ? 'Supabase Connected' : 'Supabase Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            Email Notifications: Resend Required
          </span>
        </div>

      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 border-b border-white/10 pb-2">
            <label className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-transparent font-mono text-sm uppercase focus:outline-none"
              placeholder="ENTER NAME"
            />
          </div>
          <div className="space-y-2 border-b border-white/10 pb-2">
            <label className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-transparent font-mono text-sm uppercase focus:outline-none"
              placeholder="ENTER EMAIL"
            />
          </div>
        </div>
        <div className="space-y-2 border-b border-white/10 pb-2">
          <label className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Message</label>
          <textarea
            rows={3}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full bg-transparent font-mono text-sm uppercase focus:outline-none resize-none"
            placeholder="YOUR MESSAGE"
          />
        </div>
        <button
          disabled={status === 'loading'}
          className="nothing-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>SENDING... <Loader2 size={16} className="animate-spin" /></>
          ) : (
            <>SEND MESSAGE <Send size={16} /></>
          )}
        </button>
        {status === 'error' && (
          <p className="font-mono text-[10px] text-red-500 uppercase text-center">
            {!supabase
              ? 'Supabase not configured. Check Secrets panel.'
              : 'Submission failed. Check RESEND_API_KEY and CONTACT_EMAIL in Secrets.'}
          </p>
        )}
      </form>
    </div>
  );
};

const Portfolio = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black selection:bg-nothing-red selection:text-white">
      <Navbar />

      <main className="relative z-10 pt-32 pb-24">
        {/* Hero Section */}
        <section id="home" className="min-h-[80vh] flex flex-col items-center justify-center px-6 mb-24">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div
              className="lg:col-span-8 nothing-card flex flex-col justify-center min-h-[400px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-nothing-red animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Status: Available for new opportunities</span>
              </div>
              <motion.h1
                className="text-6xl md:text-8xl lg:text-9xl font-mono font-bold tracking-tighter leading-[0.85] uppercase mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                NITISH <br />
                VELLANKI
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-white/50 max-w-xl font-mono uppercase tracking-tight leading-tight"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                AI Engineer / Full Stack Developer / Machine Learning Enthusiast.
              </motion.p>
            </motion.div>

            <motion.div
              className="lg:col-span-4 nothing-card flex flex-col justify-between bg-white text-black"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <Plus size={24} />
                <span className="font-mono font-bold text-xs uppercase tracking-widest">Connect</span>
              </div>
              <div className="space-y-4">
                <a href="#contact" className="block text-4xl font-mono font-bold tracking-tighter hover:text-nothing-red transition-colors">SAY HI <ArrowUpRight className="inline" size={32} /></a>
                <div className="h-px bg-black/10 w-full" />
                <div className="flex gap-4">
                  <a href="https://github.com/nitishv2006" target="_blank" rel="noopener noreferrer">
                    <Github size={20} className="cursor-pointer hover:text-nothing-red" />
                  </a>
                  <a href="https://www.linkedin.com/in/vellanki-nitish-bala-souri-raj-0377b0368?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer">
                    <Linkedin size={20} className="cursor-pointer hover:text-nothing-red" />
                  </a>
                  <a href="mailto:nitishraj17042006@gmail.com">
                    <Mail size={20} className="cursor-pointer hover:text-nothing-red" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>


        {/* About Section */}
        <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="ABOUT" subtitle="Technical background and core focus areas." />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BentoCard className="lg:col-span-2" title="Profile">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-48 aspect-square border border-white/10 overflow-hidden">
                  <DitherShader
                    src={profileImg}
                    gridSize={1}
                    ditherMode="bayer"
                    colorMode="original"
                    invert={false}
                    animated={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xl font-mono text-white/80 leading-tight uppercase">
                    Computer Science undergraduate focused on <span className="text-nothing-red">Artificial Intelligence</span> and scalable systems.
                  </p>
                  <p className="text-white/40 font-mono text-sm leading-relaxed uppercase">
                    Bridging complex AI research with practical applications. Solving real-world problems through data-driven insights and robust engineering.
                  </p>
                </div>
              </div>
            </BentoCard>

            <BentoCard title="Focus" icon={BrainCircuit}>
              <ul className="space-y-3 font-mono text-xs uppercase tracking-widest text-white/60">
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-nothing-red" /> Machine Learning</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-nothing-red" /> Computer Vision</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-nothing-red" /> Backend Systems</li>
                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-nothing-red" /> API Development</li>
              </ul>
            </BentoCard>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="SKILLS" subtitle="Technical toolkit and infrastructure expertise." />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Python', category: 'LANG' },
              { name: 'Java', category: 'LANG' },
              { name: 'SQL', category: 'LANG' },
              { name: 'TypeScript', category: 'LANG' },
              { name: 'FastAPI', category: 'BACK' },
              { name: 'Node.js', category: 'BACK' },
              { name: 'PyTorch', category: 'AI' },
              { name: 'OpenCV', category: 'AI' },
              { name: 'PostgreSQL', category: 'DB' },
              { name: 'MongoDB', category: 'DB' },
              { name: 'Docker', category: 'OPS' },
              { name: 'AWS', category: 'OPS' },
            ].map((skill, i) => (
              <motion.div
                key={skill.name}
                className="nothing-card p-4 flex flex-col justify-between aspect-square"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="font-mono text-[8px] text-white/20 tracking-[0.4em]">{skill.category}</span>
                <span className="font-mono font-bold text-sm uppercase tracking-tighter">{skill.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="PROJECTS" subtitle="Selected work in AI and software development." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Skill Connect',
                desc: 'Student collaboration platform with RBAC and secure matching.',
                tags: ['REACT', 'FASTAPI', 'POSTGRES'],
                id: '01',
                github: 'https://github.com/NitishV2006/skillconnect2025',
                live: 'https://skillconnect2025.onrender.com/'
              },
              {
                title: '2D-to-3D AI',
                desc: 'Computer vision system for immersive 3D representation.',
                tags: ['PYTHON', 'OPENCV', 'PYTORCH'],
                id: '02',
                github: 'https://github.com/Nitish2006/STL',
                live: 'https://stl-o9nx.onrender.com/'
              },
              {
                title: 'Event Spark',
                desc: 'Campus event discovery and management platform.',
                tags: ['NODE.JS', 'MONGODB', 'REACT'],
                id: '03',
                github: 'https://github.com/Nitish2006/Mini',
                live: 'https://mini-t2q9.onrender.com/'
              },
              {
                title: 'Academic Monitor',
                desc: 'Face recognition based attendance tracking system.',
                tags: ['PYTHON', 'OPENCV', 'SQLITE'],
                id: '04',
                github: 'https://github.com/nitishv2006/academic-monitor'
              }
            ].map((project, i) => (
              <motion.div
                key={project.title}
                className="nothing-card group relative overflow-hidden min-h-[300px] flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-4xl font-bold text-white/5">{project.id}</span>
                  <div className="flex gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-mono border border-white/10 px-2 py-1 text-white/40">{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-mono font-bold tracking-tighter uppercase mb-2 group-hover:text-nothing-red transition-colors">{project.title}</h3>
                  <p className="text-white/40 font-mono text-xs uppercase leading-tight mb-6">{project.desc}</p>

                  <div className="flex flex-wrap gap-6">
                    {project.title === 'Academic Monitor' ? (
                      <Link to="/academic-monitor" className="inline-flex items-center gap-2 font-mono text-xs font-bold hover:text-nothing-red transition-colors">
                        VIEW SOURCE <ArrowUpRight size={14} />
                      </Link>
                    ) : (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-bold hover:text-nothing-red transition-colors">
                        VIEW SOURCE <ArrowUpRight size={14} />
                      </a>
                    )}

                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono text-xs font-bold text-nothing-red hover:underline transition-all">
                        VIEW LIVE <Globe size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="EXPERIENCE" subtitle="Professional journey and industry roles." />

          <div className="relative border-l border-white/10 ml-4 space-y-12">
            {[
              {
                role: "AI & Machine Learning Intern",
                company: "GDG (EduSkill AP)",
                duration: "Apr 2025 – Jun 2025",
                points: [
                  "Built an end-to-end object classification pipeline from data preparation to model evaluation.",
                  "Implemented feature extraction using OpenCV and trained machine learning models using SVM.",
                  "Improved model accuracy through iterative experimentation on real-world datasets.",
                  "Worked on computer vision workflows and machine learning optimization techniques."
                ]
              },
              {
                role: "AI & Prompt Engineering Intern",
                company: "VaultofCodes",
                duration: "Jun 2025 – Jul 2025",
                points: [
                  "Researched and implemented advanced prompt engineering techniques for large language models.",
                  "Improved response accuracy and task alignment using structured prompt design.",
                  "Analyzed prompt behavior and documented performance trade-offs for optimization.",
                  "Contributed to AI feature experimentation and evaluation pipelines."
                ]
              }
            ].map((exp, i) => (
              <motion.div
                key={i}
                className="relative pl-12"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute left-[-5px] top-2 w-[9px] h-[9px] bg-nothing-red" />
                <div className="nothing-card">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-2xl font-mono font-bold tracking-tighter uppercase">{exp.role}</h3>
                      <p className="text-nothing-red font-mono text-sm font-bold uppercase tracking-widest">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] border border-white/10 px-3 py-1">
                      <Calendar size={12} />
                      {exp.duration}
                    </div>
                  </div>
                  <ul className="space-y-3 font-mono text-xs uppercase tracking-tight text-white/60 leading-relaxed">
                    {exp.points.map((point, j) => (
                      <li key={j} className="flex gap-4">
                        <span className="text-nothing-red shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="CERTIFICATIONS" subtitle="Validated technical credentials and expertise." />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Database Management Systems", issuer: "NPTEL", icon: Database },
              { name: "Data Analysis", issuer: "Microsoft", icon: FileCheck },
              { name: "Developing Solutions for Microsoft Azure (AZ-204T00)", issuer: "Microsoft", icon: Globe },
              { name: "Python Programming", issuer: "Cisco", icon: Code2 },
              { name: "Power BI for Data Analysis", issuer: "Office Master", icon: Layers },
              { name: "AI Agent Architect Challenge", issuer: "Lyzr AI", icon: BrainCircuit }
            ].map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="nothing-card h-full group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-2 border border-white/10 group-hover:border-nothing-red transition-colors">
                      <cert.icon size={20} className="text-nothing-red" />
                    </div>
                    <BadgeCheck size={18} className="text-white/20 group-hover:text-nothing-red/50 transition-colors" />
                  </div>
                  <h3 className="font-mono font-bold text-sm uppercase tracking-tight mb-2 leading-tight group-hover:text-nothing-red transition-colors">{cert.name}</h3>
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{cert.issuer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section id="achievements" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="ACHIEVEMENTS" subtitle="Recognition and milestones in tech and leadership." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Rank 61 — NEC 2025 (Advanced Track)",
                desc: "Secured Rank 61 among 4000+ teams in NEC 2025 conducted by E-Cell IIT Bombay.",
                icon: Trophy
              },
              {
                title: "CodeChef 2★ Competitive Programmer",
                desc: "Solved 400+ competitive programming problems on CodeChef.",
                icon: Medal
              },
              {
                title: "Web Development Lead — EDCELL VIIT",
                desc: "Led web development initiatives for the Entrepreneurship Development Cell. Organized hackathons and technical workshops.",
                icon: AwardIcon
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <BentoCard title="ACHIEVEMENT" icon={item.icon} className="h-full">
                  <h3 className="text-2xl font-mono font-bold tracking-tighter uppercase mb-4 text-white group-hover:text-nothing-red transition-colors">{item.title}</h3>
                  <div className="h-px bg-white/10 w-full mb-4" />
                  <p className="font-mono text-xs uppercase tracking-tight text-white/40 leading-relaxed">
                    {item.desc}
                  </p>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 px-6 max-w-7xl mx-auto">
          <SectionHeading title="CONTACT" subtitle="Let's build something amazing together." />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <BentoCard title="Email" icon={Mail}>
                <p className="text-xl font-mono font-bold tracking-tighter uppercase break-all">nitishraj17042006@gmail.com</p>
              </BentoCard>
              <div className="grid grid-cols-2 gap-6">
                <BentoCard title="Github" icon={Github}>
                  <a href="https://github.com/nitishv2006" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-sm hover:text-nothing-red transition-colors">/nitishv2006</a>
                </BentoCard>
                <BentoCard title="Linkedin" icon={Linkedin}>
                  <a href="https://www.linkedin.com/in/vellanki-nitish-bala-souri-raj-0377b0368" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-sm hover:text-nothing-red transition-colors">/in/nitish-vellanki</a>
                </BentoCard>
              </div>
            </div>

            <BentoCard className="lg:col-span-7" title="Message">
              <ContactForm />
            </BentoCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-2xl font-mono font-bold tracking-tighter mb-1 uppercase">NITISH VELLANKI</p>
            <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">© {new Date().getFullYear()} ALL RIGHTS RESERVED / BUILT WITH CODE</p>
          </div>
          <div className="flex gap-8">
            <a href="https://github.com/nitishv2006" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-nothing-red transition-colors font-mono text-xs font-bold uppercase tracking-widest">GITHUB</a>
            <a href="https://www.linkedin.com/in/vellanki-nitish-bala-souri-raj-0377b0368?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-nothing-red transition-colors font-mono text-xs font-bold uppercase tracking-widest">LINKEDIN</a>
            <a href="mailto:nitishraj17042006@gmail.com" className="text-white/40 hover:text-nothing-red transition-colors font-mono text-xs font-bold uppercase tracking-widest">EMAIL</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/academic-monitor" element={<AcademicMonitorWIP />} />
    </Routes>
  );
}
