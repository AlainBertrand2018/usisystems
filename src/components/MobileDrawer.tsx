'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileCheck, Receipt, PieChart, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const docLinks = [
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: FileCheck },
    { name: 'Receipts', href: '/receipts', icon: Receipt },
    { name: 'Statements', href: '/statements', icon: PieChart },
];

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] lg:hidden shadow-2xl flex flex-col pt-safe"
                    >
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <img src="/images/unideal_logo.webp" alt="Logo" className="w-24" loading="lazy" />
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c757d] mb-4 pl-2">Financial Documents</p>
                                <div className="space-y-1">
                                    {docLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${isActive
                                                    ? 'bg-[#107d92] text-white shadow-lg shadow-[#107d92]/20'
                                                    : 'text-[#6c757d] hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                <span className="text-sm">{link.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
                                <p className="text-[10px] font-black uppercase text-[#6c757d]">Active Account</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#107d92] rounded-xl flex items-center justify-center text-white overflow-hidden">
                                        {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" loading="lazy" /> : <User size={20} />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-black text-[#1a1a1a] truncate">{user?.displayName || 'Admin User'}</p>
                                        <p className="text-[10px] font-bold text-[#6c757d] uppercase">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-50">
                            <button
                                onClick={() => { logout(); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
