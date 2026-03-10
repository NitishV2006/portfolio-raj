import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Terminal, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AcademicMonitorWIP = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-nothing-red selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}
            />

            <motion.div
                className="relative z-10 max-w-2xl w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="nothing-card p-12 flex flex-col items-center text-center space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 bg-nothing-red animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Repository Status</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.85]">
                        ACADEMIC <br />
                        MONITOR
                    </h1>

                    {/* Loader Animation */}
                    <div className="relative py-8">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                className="w-32 h-32 border border-white/5 rounded-full"
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                        <div className="relative flex flex-col items-center">
                            <Loader2 size={48} className="text-nothing-red animate-spin mb-4" />
                            <div className="h-1 w-48 bg-white/5 relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-nothing-red"
                                    animate={{ left: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ width: '40%' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xl font-bold tracking-tighter uppercase">
                            Work in Progress{dots}
                        </p>
                        <p className="text-xs text-white/40 max-w-sm mx-auto leading-relaxed uppercase">
                            This repository is currently being migrated and privatized for security optimization. Public access will be restored shortly.
                        </p>
                    </div>

                    {/* Technical Info */}
                    <div className="grid grid-cols-2 gap-4 w-full pt-8">
                        <div className="border border-white/5 p-4 flex flex-col items-start gap-2">
                            <Terminal size={14} className="text-white/20" />
                            <span className="text-[8px] text-white/20 uppercase tracking-widest">Process</span>
                            <span className="text-[10px] font-bold uppercase">Encrypted Migration</span>
                        </div>
                        <div className="border border-white/5 p-4 flex flex-col items-start gap-2">
                            <AlertCircle size={14} className="text-white/20" />
                            <span className="text-[8px] text-white/20 uppercase tracking-widest">Access</span>
                            <span className="text-[10px] font-bold uppercase text-nothing-red">Restricted</span>
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="nothing-button inline-flex items-center gap-2 mt-8"
                    >
                        <ArrowLeft size={16} /> RETURN TO PORTFOLIO
                    </Link>
                </div>
            </motion.div>

            {/* Footer Label */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 text-[8px] uppercase tracking-[0.5em] font-mono">
                System 1.0 // Nothing OS Aesthetics
            </div>
        </div>
    );
};

export default AcademicMonitorWIP;
