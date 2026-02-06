'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SplashPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); // Add error state

    const handleCTA = (action: string) => {
        setPendingAction(action);
        setShowLogin(true);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email); // Use the login function from AuthContext
            localStorage.setItem('unideals_auth', 'true');
            if (pendingAction === 'new_quote') {
                router.push('/quotations?action=new');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("Unauthorized access. Access is restricted to pre-registered members.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 pb-20 font-sans">
            {/* Logo Center */}
            <div className="flex flex-col items-center mb-20">
                <img
                    src="/images/unideal_logo.webp"
                    alt="UniDeals Logo"
                    className="w-56 lg:w-72"
                />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-5 w-full max-w-xs transition-all">
                <button
                    onClick={() => handleCTA('dashboard')}
                    className="w-full bg-[#107d92] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#107d92]/10 active:scale-95 transition-all"
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => handleCTA('new_quote')}
                    className="w-full bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] py-5 rounded-[24px] font-black text-lg active:scale-95 transition-all"
                >
                    New Quotation
                </button>
            </div>

            {/* Login Modal */}
            <AnimatePresence>
                {showLogin && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 w-full max-w-sm relative h-[80vh] flex flex-col justify-center"
                        >
                            <button
                                onClick={() => setShowLogin(false)}
                                className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-[#107d92]/10 text-[#107d92] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <LogIn size={32} />
                                </div>
                                <h3 className="text-2xl font-black">Secure Access</h3>
                                <p className="text-sm text-[#6c757d] mt-1 font-medium">Please sign in to continue</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] ml-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@unideals.mu"
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-[20px] px-5 py-4 outline-none transition-all font-bold"
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
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-[20px] px-5 py-4 outline-none transition-all font-bold"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {error && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">
                                        {error}
                                    </p>
                                )}
                                <button
                                    disabled={loading}
                                    className="w-full bg-[#107d92] text-white py-5 rounded-[20px] font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#107d92]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={24} className="animate-spin" /> : 'Sign In'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="fixed bottom-10 text-center">
                <p className="text-[10px] font-black text-[#6c757d] uppercase tracking-[0.4em] opacity-30">
                    &copy; 2026 UNIDEALS MAURITIUS
                </p>
            </footer>
        </div>
    );
}
