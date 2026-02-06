'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, User, Mail, Shield, Phone, Briefcase, Camera } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const docRef = doc(db, 'users', id as string);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();

                    // Security Firewall: Non-SuperAdmins cannot view SuperAdmins
                    if (data.role === 'super_admin' && currentUser?.role !== 'super_admin') {
                        router.push('/dashboard');
                        return;
                    }

                    // Security Firewall: Admins can only view users from their own business
                    if (currentUser?.role === 'admin' && data.businessId !== currentUser.businessId) {
                        router.push('/dashboard');
                        return;
                    }

                    setUserData(data);
                } else {
                    router.push('/users');
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'users', id as string);
            await updateDoc(docRef, {
                ...userData,
                updatedAt: serverTimestamp()
            });
            alert("Profile updated successfully!");
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#107d92]" size={32} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6c757d] font-black text-[10px] uppercase tracking-widest hover:text-[#107d92] transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#107d92] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-[#107d92]/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-[#107d92] to-[#0a4d5a]" />

                <div className="px-10 pb-10 -mt-12 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <ImageUpload
                            path="users-photos"
                            currentUrl={userData.photoURL}
                            onUploadComplete={(url) => setUserData({ ...userData, photoURL: url })}
                        />
                        <div className="flex-1 pb-2">
                            <h1 className="text-3xl font-black text-[#1a1a1a]">{userData.displayName}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="px-3 py-1 bg-[#107d92]/10 text-[#107d92] rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {userData.role?.replace('_', ' ')}
                                </span>
                                <p className="text-[#6c757d] text-sm font-bold truncate">Joined {userData.createdAt?.seconds ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Sections */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c757d] border-b border-gray-100 pb-2">Personal Identity</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input value={userData.displayName} onChange={e => setUserData({ ...userData, displayName: e.target.value })} className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Professional Position</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input value={userData.position || ''} onChange={e => setUserData({ ...userData, position: e.target.value })} className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c757d] border-b border-gray-100 pb-2">Communication</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input readOnly value={userData.email} className="w-full bg-gray-100 p-4 pl-12 rounded-2xl border-2 border-transparent outline-none font-bold text-gray-400 cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">WhatsApp Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input value={userData.whatsapp || ''} onChange={e => setUserData({ ...userData, whatsapp: e.target.value })} className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        {currentUser?.role === 'super_admin' && (
                            <div className="md:col-span-2 space-y-6 pt-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 border-b border-rose-50 pb-2">Administrative Controls</h3>
                                <div className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 flex items-start gap-4">
                                    <Shield className="text-rose-500 shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="text-xs font-black text-rose-900 uppercase tracking-tight">Access Level Management</p>
                                        <p className="text-[10px] font-bold text-rose-700/70 mt-1 leading-relaxed">
                                            Modifying user roles affects deep system permissions. This action is logged.
                                        </p>
                                        <div className="flex gap-2 mt-4">
                                            {['user', 'admin'].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setUserData({ ...userData, role: r })}
                                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${userData.role === r ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-rose-100 text-rose-300 hover:border-rose-200'}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
