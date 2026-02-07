'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Shield, Mail, User, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '@/context/AuthContext';
import ImageUpload from './ImageUpload';
import { validatePassword } from '@/lib/validation';
import PasswordStrength from './PasswordStrength';
import { Key, RefreshCw } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserModal({ isOpen, onClose }: UserModalProps) {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        role: 'user' as 'super_admin' | 'admin' | 'user',
        password: '',
        photoURL: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { isValid } = validatePassword(formData.password);
        if (!isValid) {
            alert('Password must be 8+ chars and contain uppercase, lowercase, digit, and symbol.');
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, 'users'), {
                ...formData,
                addedBy: currentUser?.email || 'system',
                businessId: currentUser?.businessId || 'N/A',
                createdAt: serverTimestamp(),
                status: 'active'
            });
            alert('User account created!');
            onClose();
            setFormData({ displayName: '', email: '', role: 'user', password: '', photoURL: '' });
        } catch (error) {
            console.error("Error adding user:", error);
            alert('Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Create System User</h2>
                            <p className="text-[#6c757d] text-sm font-bold mt-1">Add a new internal team member</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col items-center pb-4 border-b border-gray-50">
                            <ImageUpload
                                path="users-photos"
                                currentUrl={formData.photoURL}
                                onUploadComplete={(url) => setFormData({ ...formData, photoURL: url })}
                                label="Profile Photo"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="User's Full Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="user@unideals.crm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase tracking-wider">Access Key (Password)</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-2) + Math.random().toString(36).toUpperCase().slice(-2) + "@" + (Math.floor(Math.random() * 90) + 10) + "U" })}
                                        className="text-[10px] font-black text-[#107d92] flex items-center gap-1 hover:underline active:scale-95 transition-all"
                                    >
                                        <RefreshCw size={10} /> Regenerate
                                    </button>
                                </div>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-blue-50/30 border-2 border-dashed border-blue-100 focus:border-solid focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-black text-sm transition-all shadow-sm tracking-widest text-[#107d92]"
                                        placeholder="Set initial password"
                                    />
                                </div>
                                <PasswordStrength password={formData.password} />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">System Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['user', 'admin'] as const).filter(r => {
                                        if (r === 'admin' && currentUser?.role !== 'super_admin') return false;
                                        return true;
                                    }).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: r })}
                                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${formData.role === r
                                                ? 'bg-[#107d92]/5 border-[#107d92] text-[#107d92]'
                                                : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {currentUser?.role !== 'super_admin' && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-2 px-1 italic">
                                        * Only Super Admins can assign Admin roles.
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#107d92] text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-[#107d92]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Shield size={22} />}
                            <span>Create Account</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
