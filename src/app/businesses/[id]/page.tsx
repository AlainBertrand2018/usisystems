'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import {
    Building2,
    Save,
    ArrowLeft,
    Globe,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Briefcase,
    TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ImageUpload from '@/components/ImageUpload';

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [businessData, setBusinessData] = useState<any>(null);

    useEffect(() => {
        if (user?.role !== 'super_admin') return;

        const fetchBusiness = async () => {
            try {
                const docRef = doc(db, 'businesses', id);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setBusinessData({ id: snapshot.id, ...snapshot.data() });
                }
            } catch (error) {
                console.error("Error fetching business:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusiness();
    }, [id, user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, 'businesses', id);
            await updateDoc(docRef, {
                ...businessData,
                updatedAt: serverTimestamp()
            });
            alert("Business profile updated successfully!");
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== 'super_admin') {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <ShieldCheck size={48} className="text-rose-500" />
                <h1 className="text-2xl font-black text-[#1a1a1a]">UNAUTHORIZED</h1>
                <p className="text-gray-500 font-bold max-w-sm">Tenant configurations are restricted to Platform Administrators.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#107d92]" size={40} />
            </div>
        );
    }

    if (!businessData) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <Building2 size={48} className="text-gray-300" />
                <h1 className="text-2xl font-black text-[#1a1a1a]">TENANT NOT FOUND</h1>
                <button onClick={() => router.back()} className="text-[#107d92] font-bold hover:underline flex items-center gap-1">
                    <ArrowLeft size={16} /> Return to Directory
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* 1. Hero Identity Bar */}
            <div className="bg-white p-8 sm:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 flex-1">
                    <div className="shrink-0">
                        <ImageUpload
                            label="Corporation Logo"
                            path={`logos/${id}`}
                            currentUrl={businessData.logoUrl}
                            onUploadComplete={(url) => setBusinessData({ ...businessData, logoUrl: url })}
                        />
                    </div>
                    <div className="text-center sm:text-left pt-2 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            <h1 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight truncate">{businessData.name}</h1>
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${businessData.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {businessData.status}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[#6c757d]">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <span className="opacity-50 uppercase text-[10px] tracking-widest">ID:</span>
                                <span className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{businessData.id}</span>
                            </p>
                            {businessData.url && (
                                <a href={businessData.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-bold text-[#107d92] hover:underline decoration-2">
                                    <Globe size={14} /> {new URL(businessData.url).hostname}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                    <button
                        onClick={() => router.back()}
                        className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-gray-600 transition-all active:scale-95"
                        title="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={() => setBusinessData({ ...businessData, status: businessData.status === 'active' ? 'suspended' : 'active' })}
                        className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${businessData.status === 'active' ? 'border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                    >
                        {businessData.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#107d92] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#107d92]/20 hover:bg-[#0d6b7d] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Primary Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* A. Business Registry & Legal */}
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-50 space-y-10">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6 text-[#107d92]">
                            <ShieldCheck size={20} />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Registry & Compliance</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Legal Company Name</label>
                                <input
                                    type="text"
                                    value={businessData.name || ''}
                                    onChange={e => setBusinessData({ ...businessData, name: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-gray-100 focus:border-[#107d92] py-2 outline-none font-bold text-lg transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Representative Name</label>
                                <input
                                    type="text"
                                    value={businessData.repName || ''}
                                    onChange={e => setBusinessData({ ...businessData, repName: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-gray-100 focus:border-[#107d92] py-2 outline-none font-bold text-lg transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">Industry Sector</label>
                                <input
                                    type="text"
                                    value={businessData.sector || ''}
                                    onChange={e => setBusinessData({ ...businessData, sector: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-gray-100 focus:border-[#107d92] py-2 outline-none font-bold text-lg transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">BRN</label>
                                    <input
                                        type="text"
                                        value={businessData.brn || ''}
                                        onChange={e => setBusinessData({ ...businessData, brn: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-gray-100 focus:border-[#107d92] py-2 outline-none font-bold text-lg transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-1">VAT</label>
                                    <input
                                        type="text"
                                        value={businessData.vat || ''}
                                        onChange={e => setBusinessData({ ...businessData, vat: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-gray-100 focus:border-[#107d92] py-2 outline-none font-bold text-lg transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B. Channels & Location */}
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-50 space-y-10">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6 text-[#107d92]">
                            <MapPin size={20} />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Channels & Location</h2>
                        </div>

                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Admin Email</label>
                                        <div className="flex items-center gap-3 py-2 border-b-2 border-gray-100 focus-within:border-[#107d92] transition-all">
                                            <Mail size={16} className="text-[#107d92]/40" />
                                            <input
                                                type="email"
                                                value={businessData.email || ''}
                                                onChange={e => setBusinessData({ ...businessData, email: e.target.value })}
                                                className="bg-transparent font-bold text-sm outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Official Phone</label>
                                        <div className="flex items-center gap-3 py-2 border-b-2 border-gray-100 focus-within:border-[#107d92] transition-all">
                                            <Phone size={16} className="text-[#107d92]/40" />
                                            <input
                                                type="text"
                                                value={businessData.phone || ''}
                                                onChange={e => setBusinessData({ ...businessData, phone: e.target.value })}
                                                className="bg-transparent font-bold text-sm outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Accounts Email</label>
                                        <div className="flex items-center gap-3 py-2 border-b-2 border-gray-100 focus-within:border-[#107d92] transition-all">
                                            <CreditCard size={16} className="text-[#107d92]/40" />
                                            <input
                                                type="email"
                                                value={businessData.accountsEmail || ''}
                                                onChange={e => setBusinessData({ ...businessData, accountsEmail: e.target.value })}
                                                className="bg-transparent font-bold text-sm outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Website URL</label>
                                        <div className="flex items-center gap-3 py-2 border-b-2 border-gray-100 focus-within:border-[#107d92] transition-all">
                                            <Globe size={16} className="text-[#107d92]/40" />
                                            <input
                                                type="text"
                                                value={businessData.url || ''}
                                                onChange={e => setBusinessData({ ...businessData, url: e.target.value })}
                                                className="bg-transparent font-bold text-sm outline-none w-full"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-50 flex gap-10">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Full Head Office Address</label>
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-gray-50 rounded-2xl">
                                            <MapPin size={24} className="text-[#107d92]/40" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                value={businessData.address?.office || ''}
                                                onChange={e => setBusinessData({ ...businessData, address: { ...businessData.address, office: e.target.value } })}
                                                placeholder="Office / Suite / Level"
                                                className="w-full bg-transparent border-b border-gray-100 focus:border-[#107d92] py-1 outline-none font-bold text-sm transition-all"
                                            />
                                            <div className="grid grid-cols-2 gap-6">
                                                <input
                                                    type="text"
                                                    value={businessData.address?.street || ''}
                                                    onChange={e => setBusinessData({ ...businessData, address: { ...businessData.address, street: e.target.value } })}
                                                    placeholder="Building / Street"
                                                    className="w-full bg-transparent border-b border-gray-100 focus:border-[#107d92] py-1 outline-none font-bold text-sm transition-all"
                                                />
                                                <input
                                                    type="text"
                                                    value={businessData.address?.city || ''}
                                                    onChange={e => setBusinessData({ ...businessData, address: { ...businessData.address, city: e.target.value } })}
                                                    placeholder="City / Region"
                                                    className="w-full bg-transparent border-b border-gray-100 focus:border-[#107d92] py-1 outline-none font-bold text-sm transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SaaS Sidebar Column */}
                <div className="space-y-8">
                    {/* Subscription & Billing */}
                    <div className="bg-[#1a1a1a] rounded-[40px] p-8 shadow-2xl text-white space-y-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#107d92]/10 rounded-full -mr-10 -mt-10 blur-3xl transition-all group-hover:bg-[#107d92]/20" />

                        <div className="flex items-center gap-3 relative">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <TrendingUp size={20} className="text-[#107d92]" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">Financial Status</h2>
                        </div>

                        <div className="space-y-8 relative">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Contract Type</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-black text-white uppercase tracking-tighter">
                                        {businessData.subscription?.type || 'Standard'}
                                    </p>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Monthly Billing</p>
                                    <p className="text-lg font-black text-[#107d92]">
                                        MUR {parseFloat(businessData.subscription?.amount || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Renewal Cycle</p>
                                    <p className="text-lg font-black text-white/80">
                                        {businessData.subscription?.nextPaymentDate || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <button type="button" className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#107d92] hover:text-white transition-all shadow-lg active:scale-95">
                                Upgrade Plan Tier
                            </button>
                        </div>
                    </div>

                    {/* System Metadata */}
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-50 space-y-6">
                        <h3 className="text-[10px] font-black text-[#1a1a1a] uppercase tracking-widest border-b border-gray-50 pb-4">Administrative Log</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-tighter">Onboarded On</span>
                                <span className="text-[#1a1a1a] font-black">
                                    {businessData.createdAt?.seconds
                                        ? new Date(businessData.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-tighter">Last Update</span>
                                <span className="text-[#1a1a1a] font-black">
                                    {businessData.updatedAt?.seconds
                                        ? new Date(businessData.updatedAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-4 border-t border-gray-50">
                                <span className="text-gray-400 font-bold uppercase tracking-tighter">Provisioned By</span>
                                <span className="text-[#107d92] font-black lowercase tracking-tight">{businessData.addedBy || 'System'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
