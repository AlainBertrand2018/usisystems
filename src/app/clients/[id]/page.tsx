'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Building, Mail, Phone, MapPin, Globe, CreditCard, FileText, History, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';

export default function ClientDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientData, setClientData] = useState<any>(null);
    const [stats, setStats] = useState({ quotes: 0, totalValue: 0 });

    useEffect(() => {
        const fetchClient = async () => {
            try {
                const docRef = doc(db, 'clients', id as string);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();

                    // Security Firewall: Admins can only view clients from their own business
                    if (currentUser?.role !== 'super_admin' && data.businessId !== currentUser?.businessId) {
                        router.push('/dashboard');
                        return;
                    }

                    setClientData(data);

                    // Fetch basic stats (invoices/quotes for this client)
                    const q = query(collection(db, 'quotes'), where('clientId', '==', id));
                    const qSnap = await getDocs(q);
                    let total = 0;
                    qSnap.forEach(doc => {
                        total += doc.data().total || 0;
                    });
                    setStats({ quotes: qSnap.size, totalValue: total });
                } else {
                    router.push('/clients');
                }
            } catch (err) {
                console.error("Error fetching client:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [id, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'clients', id as string);
            await updateDoc(docRef, {
                ...clientData,
                updatedAt: serverTimestamp()
            });
            alert("Client updated successfully!");
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
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6c757d] font-black text-[10px] uppercase tracking-widest hover:text-[#107d92] transition-colors">
                    <ArrowLeft size={16} /> Back to Directory
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/quotes/new?clientId=${id}`)}
                        className="bg-white border-2 border-gray-100 text-[#1a1a1a] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-[#107d92]/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Quote
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
            </div>

            {/* Client Context Header */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a]">{clientData.name}</h1>
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                            {clientData.status || 'Active'}
                        </span>
                    </div>
                    <p className="text-[#6c757d] font-bold text-[12px] sm:text-sm mt-1">{clientData.company || 'Private Individual'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[#6c757d] uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-xl">
                            <FileText size={14} className="text-[#107d92]" />
                            {stats.quotes} Documents
                        </div>
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[#6c757d] uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-xl">
                            <CreditCard size={14} className="text-emerald-500" />
                            Total MUR {stats.totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 space-y-10">
                        {/* Section 1: Core Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Building size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Business Registration</h3>
                            </div>

                            <div className="flex flex-col items-center pb-4">
                                <ImageUpload
                                    label="Client Avatar"
                                    path={`clients/${id}`}
                                    currentUrl={clientData.photoUrl}
                                    onUploadComplete={(url) => setClientData({ ...clientData, photoUrl: url })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Representative Name</label>
                                    <input value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Company Name</label>
                                    <input value={clientData.company || ''} onChange={e => setClientData({ ...clientData, company: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">BRN (Business Registration Number)</label>
                                    <input value={clientData.brn || ''} onChange={e => setClientData({ ...clientData, brn: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">VAT Number</label>
                                    <input value={clientData.vat || ''} onChange={e => setClientData({ ...clientData, vat: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Communication */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Mail size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Communication Channels</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Primary Email</label>
                                    <input value={clientData.email || ''} onChange={e => setClientData({ ...clientData, email: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Phone Number</label>
                                    <input value={clientData.phone || ''} onChange={e => setClientData({ ...clientData, phone: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Website URL</label>
                                    <input value={clientData.website || ''} onChange={e => setClientData({ ...clientData, website: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Location */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <MapPin size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Registered Address</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Address Line 1 (Building/Street)</label>
                                    <input value={clientData.address || ''} onChange={e => setClientData({ ...clientData, address: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">City / Village</label>
                                        <input value={clientData.city || ''} onChange={e => setClientData({ ...clientData, city: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Country</label>
                                        <input value={clientData.country || 'Mauritius'} readOnly className="w-full bg-gray-100 p-4 rounded-2xl border-2 border-transparent outline-none font-bold text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Activity Log / History Mockup */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Account Activity</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-1 h-10 bg-[#107d92]/20 rounded-full" />
                                <div>
                                    <p className="text-[10px] font-black text-[#1a1a1a] uppercase">New Quote Generated</p>
                                    <p className="text-[10px] font-bold text-[#6c757d] mt-0.5">Jan 24, 2026 • by Admin</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1 h-10 bg-emerald-100 rounded-full" />
                                <div>
                                    <p className="text-[10px] font-black text-[#1a1a1a] uppercase">Payment Received</p>
                                    <p className="text-[10px] font-bold text-[#6c757d] mt-0.5">Jan 18, 2026 • MUR 45,000</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1 h-10 bg-gray-100 rounded-full" />
                                <div>
                                    <p className="text-[10px] font-black text-[#1a1a1a] uppercase">Profile Registered</p>
                                    <p className="text-[10px] font-bold text-[#6c757d] mt-0.5">Jan 10, 2026 • via Portal</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-[#107d92] border-2 border-[#107d92]/5 rounded-2xl hover:bg-[#107d92]/5 transition-colors">
                            View Full History
                        </button>
                    </div>

                    {/* Dangerous Actions */}
                    <div className="bg-rose-50/30 rounded-[40px] border border-rose-100 p-8 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">Restricted Area</h3>
                        <p className="text-[10px] font-bold text-rose-700 leading-relaxed px-1">
                            Archiving a client will hide them from active lists but keep all historical financial records.
                        </p>
                        <button className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95">
                            Archive Client Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
