'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, User, Mail, Phone, Building, MapPin, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from './ImageUpload';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (client: any) => void;
}

export default function ClientModal({ isOpen, onClose, onSuccess }: ClientModalProps) {
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        brn: '',
        vat: '',
        photoUrl: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const docRef = await addDoc(collection(db, 'clients'), {
                ...formData,
                status: 'active',
                addedBy: currentUser?.email || 'system',
                businessId: currentUser?.businessId || 'N/A',
                createdAt: serverTimestamp()
            });
            const clientData = {
                id: docRef.id,
                ...formData,
                status: 'active',
                createdAt: new Date()
            };
            if (onSuccess) onSuccess(clientData);
            alert('Client added successfully!');
            onClose();
            setFormData({ name: '', company: '', email: '', phone: '', address: '', brn: '', vat: '', photoUrl: '' });
        } catch (error) {
            console.error("Error adding client:", error);
            alert('Failed to add client.');
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
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Register New Client</h2>
                            <p className="text-[#6c757d] text-sm font-bold mt-1">Add a new business contact</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col items-center pb-2">
                            <ImageUpload
                                path="clients"
                                currentUrl={formData.photoUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, photoUrl: url })}
                                label="Customer Avatar"
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
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Contact Person Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Company Name</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Business / Entity Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            placeholder="client@mail.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            placeholder="+230..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm min-h-[100px]"
                                        placeholder="Business Address"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">BRN</label>
                                    <input
                                        type="text"
                                        value={formData.brn}
                                        onChange={(e) => setFormData({ ...formData, brn: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Business Reg No."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">VAT No.</label>
                                    <input
                                        type="text"
                                        value={formData.vat}
                                        onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Tax Number"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#107d92] text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-[#107d92]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />}
                            <span>Save Client Profile</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
