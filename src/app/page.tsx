'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowRight, FilePlus, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function SplashPage() {
    const router = useRouter();
    const [showLogin, setShowLogin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent, action: string) => {
        e.preventDefault();
        setLoading(true);

        // Simulate authentication
        setTimeout(() => {
            localStorage.setItem('unideals_auth', 'true');
            if (action === 'new_quotation') {
                router.push('/quotations?action=new_quotation');
            } else {
                router.push('/dashboard');
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col font-sans overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#107d92]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#107d92]/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Header / Logo Section */}
            <header className="relative z-10 px-8 py-10 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-4"
                >
                    <div className="w-12 h-12 bg-[#107d92] rounded-2xl flex items-center justify-center shadow-lg shadow-[#107d92]/20">
                        <span className="text-white font-black text-2xl">U</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">UNIDEALS</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#107d92] opacity-80">Agentic CRM Systems</p>
                    </div>
                </motion.div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6">
                        Business Operations, <br />
                        <span className="text-[#107d92]">Intelligently Guided.</span>
                    </h2>
                    <p className="text-[#6c757d] text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                        The all-in-one platform for Quotations, Invoicing, and Business Intelligence.
                        Designed for precision, built for speed.
                    </p>
                </motion.div>

                {/* Call to Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-6 w-full max-w-md"
                >
                    <button
                        onClick={() => setShowLogin(true)}
                        className="flex-1 bg-[#107d92] text-white px-8 py-5 rounded-[24px] font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#107d92]/20 flex items-center justify-center gap-3"
                    >
                        Access Dashboard <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => setShowLogin(true)}
                        className="flex-1 bg-white border-2 border-[#1a1a1a]/5 text-[#1a1a1a] px-8 py-5 rounded-[24px] font-black text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        New Quotation <FilePlus size={20} />
                    </button>
                </motion.div>

                {/* Features Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-24 w-full"
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#107d92]">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#6c757d]">Secure Auth</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#107d92]">
                            <Zap size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#6c757d]">Real-time Sync</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 col-span-2 md:col-span-1">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#107d92]">
                            <BarChart3 size={20} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-[#6c757d]">Live Analytics</span>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-10 text-center">
                <p className="text-[10px] font-black text-[#6c757d] uppercase tracking-[0.3em] opacity-40">
                    &copy; 2026 UNIDEALS MAURITIUS • PRIVATE ACCESS ONLY
                </p>
            </footer>

            {/* Login Modal Overlay */}
            <AnimatePresence>
                {showLogin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 w-full max-w-sm"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-[#107d92]/10 text-[#107d92] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <LogIn size={32} />
                                </div>
                                <h3 className="text-2xl font-black">Authorized Access</h3>
                                <p className="text-sm text-[#6c757d] mt-1 font-medium">Please sign in to continue</p>
                            </div>

                            <form onSubmit={(e) => handleLogin(e, 'dashboard')} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@unideals.mu"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold placeholder:text-gray-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] ml-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    className="w-full bg-[#107d92] text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#107d92]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Authenticating...' : 'Sign In'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLogin(false)}
                                    className="w-full py-4 text-[#6c757d] font-bold text-sm hover:text-[#1a1a1a] transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
