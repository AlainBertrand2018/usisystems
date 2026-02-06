'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Building, CreditCard, CheckCircle,
    ArrowRight, ArrowLeft, Loader2, Shield,
    Mail, Phone, Globe, Briefcase, MapPin, Key
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from './ImageUpload';

interface AdminOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminOnboardingModal({ isOpen, onClose }: AdminOnboardingModalProps) {
    const { user: currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        // Admin Personal
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminPosition: '',
        adminWhatsapp: '',
        adminPassword: Math.random().toString(36).slice(-8).toUpperCase(), // Initial random password
        adminPhotoURL: '',

        // Business Details
        bizName: '',
        bizBRN: '',
        bizVAT: '',
        bizOffice: '',
        bizBuilding: '',
        bizStreet: '',
        bizCity: '',
        bizCountry: 'Mauritius',
        bizPhone: '',
        bizEmail: '',
        bizAccountsEmail: '',
        bizURL: '',
        bizSector: '',

        // Subscription
        subType: 'Monthly' as 'Monthly' | 'Yearly' | 'Lifetime',
        subAmount: 2100,
        subPaymentDate: new Date().toISOString().split('T')[0],
        subStartDate: new Date().toISOString().split('T')[0],
        subNextDate: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const updateSubPrice = (type: string) => {
        let price = 2100;
        let nextDate = '';
        const start = new Date(formData.subStartDate);

        if (type === 'Monthly') {
            price = 2100;
            start.setMonth(start.getMonth() + 1);
            nextDate = start.toISOString().split('T')[0];
        } else if (type === 'Yearly') {
            price = 18000;
            start.setFullYear(start.getFullYear() + 1);
            nextDate = start.toISOString().split('T')[0];
        } else if (type === 'Lifetime') {
            price = 72000;
            nextDate = 'NONE';
        }

        setFormData(prev => ({
            ...prev,
            subType: type as any,
            subAmount: price,
            subNextDate: nextDate
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Create Business
            const bizRef = await addDoc(collection(db, 'businesses'), {
                name: formData.bizName,
                brn: formData.bizBRN,
                vat: formData.bizVAT,
                address: {
                    office: formData.bizOffice,
                    building: formData.bizBuilding,
                    street: formData.bizStreet,
                    city: formData.bizCity,
                    country: formData.bizCountry
                },
                phone: formData.bizPhone,
                email: formData.bizEmail,
                accountsEmail: formData.bizAccountsEmail,
                url: formData.bizURL,
                sector: formData.bizSector,
                subscription: {
                    type: formData.subType,
                    amount: formData.subAmount,
                    paymentDate: formData.subPaymentDate,
                    startDate: formData.subStartDate,
                    nextPaymentDate: formData.subNextDate
                },
                addedBy: currentUser?.email,
                createdAt: serverTimestamp(),
                status: 'active'
            });

            // 2. Create Admin User
            await addDoc(collection(db, 'users'), {
                email: formData.adminEmail.toLowerCase().trim(),
                firstName: formData.adminFirstName,
                lastName: formData.adminLastName,
                displayName: `${formData.adminFirstName} ${formData.adminLastName}`,
                position: formData.adminPosition,
                whatsapp: formData.adminWhatsapp,
                password: formData.adminPassword, // Note: In production we would use Auth.createUser
                photoURL: formData.adminPhotoURL,
                role: 'admin',
                businessId: bizRef.id,
                addedBy: currentUser?.email,
                createdAt: serverTimestamp(),
                initialized: false // They need to set up their own profile/change password on first login
            });

            setStep(5); // Success step
        } catch (error) {
            console.error("Onboarding Error:", error);
            alert("Process failed. Please check logs.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Progress */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#107d92] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#107d92]/20">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[#1a1a1a]">Provision New Business</h2>
                                <p className="text-[#6c757d] text-sm font-bold mt-1 tracking-tight">Onboarding Step {step} of 4</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#107d92]' : 'w-2 bg-gray-200'}`} />
                            ))}
                        </div>

                        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-white rounded-2xl transition-all text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="flex flex-col items-center pb-6 border-b border-gray-50">
                                        <ImageUpload
                                            path="user_photos"
                                            currentUrl={formData.adminPhotoURL}
                                            onUploadComplete={(url) => setFormData({ ...formData, adminPhotoURL: url })}
                                            label="Admin Profile Photo"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Admin Email</label>
                                            <input value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" placeholder="admin@client.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Temporary Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input readOnly value={formData.adminPassword} className="w-full bg-blue-50/50 p-4 pl-12 rounded-2xl border-2 border-dashed border-blue-200 outline-none font-black text-[#107d92]" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">First Name</label>
                                            <input value={formData.adminFirstName} onChange={e => setFormData({ ...formData, adminFirstName: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Last Name</label>
                                            <input value={formData.adminLastName} onChange={e => setFormData({ ...formData, adminLastName: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Position</label>
                                            <input value={formData.adminPosition} onChange={e => setFormData({ ...formData, adminPosition: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" placeholder="e.g. Managing Director" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">WhatsApp</label>
                                            <input value={formData.adminWhatsapp} onChange={e => setFormData({ ...formData, adminWhatsapp: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" placeholder="+230..." />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Business Name</label>
                                            <input value={formData.bizName} onChange={e => setFormData({ ...formData, bizName: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Sector</label>
                                            <input value={formData.bizSector} onChange={e => setFormData({ ...formData, bizSector: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">BRN</label>
                                            <input value={formData.bizBRN} onChange={e => setFormData({ ...formData, bizBRN: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">VAT</label>
                                            <input value={formData.bizVAT} onChange={e => setFormData({ ...formData, bizVAT: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Main Phone</label>
                                            <input value={formData.bizPhone} onChange={e => setFormData({ ...formData, bizPhone: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Admin Email (Official)</label>
                                            <input value={formData.bizEmail} onChange={e => setFormData({ ...formData, bizEmail: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Accounts Email</label>
                                            <input value={formData.bizAccountsEmail} onChange={e => setFormData({ ...formData, bizAccountsEmail: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">URL</label>
                                            <input value={formData.bizURL} onChange={e => setFormData({ ...formData, bizURL: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm" />
                                        </div>
                                        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Office/Unit</label>
                                                <input value={formData.bizOffice} onChange={e => setFormData({ ...formData, bizOffice: e.target.value })} className="w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-[#107d92] outline-none font-bold text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Building</label>
                                                <input value={formData.bizBuilding} onChange={e => setFormData({ ...formData, bizBuilding: e.target.value })} className="w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-[#107d92] outline-none font-bold text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Street</label>
                                                <input value={formData.bizStreet} onChange={e => setFormData({ ...formData, bizStreet: e.target.value })} className="w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-[#107d92] outline-none font-bold text-xs" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">City</label>
                                                <input value={formData.bizCity} onChange={e => setFormData({ ...formData, bizCity: e.target.value })} className="w-full bg-gray-50 p-3 rounded-xl border border-transparent focus:border-[#107d92] outline-none font-bold text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex gap-4">
                                        {['Monthly', 'Yearly', 'Lifetime'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => updateSubPrice(t)}
                                                className={`flex-1 p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${formData.subType === t ? 'border-[#107d92] bg-[#107d92]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            >
                                                <CreditCard size={32} className={formData.subType === t ? 'text-[#107d92]' : 'text-gray-400'} />
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d]">{t}</p>
                                                    <p className={`text-xl font-black mt-1 ${formData.subType === t ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
                                                        MUR {t === 'Monthly' ? '2,100' : t === 'Yearly' ? '18,500' : '72,000'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 font-sans">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Activation Date</label>
                                            <input type="date" value={formData.subStartDate} onChange={e => setFormData({ ...formData, subStartDate: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-[#6c757d] px-1">Next Billing Date</label>
                                            <input disabled value={formData.subNextDate} className="w-full bg-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="bg-[#107d92]/5 rounded-[32px] p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black text-[#1a1a1a]">{formData.bizName}</h3>
                                                <p className="text-[#6c757d] font-bold text-sm tracking-tight">{formData.bizSector}</p>
                                            </div>
                                            <div className="bg-[#107d92] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {formData.subType} - MUR {formData.subAmount}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-[#107d92]/10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-[#6c757d] uppercase tracking-widest">Administrator</p>
                                                <p className="font-bold text-[#1a1a1a]">{formData.adminFirstName} {formData.adminLastName}</p>
                                                <p className="text-xs text-[#6c757d] font-bold underline">{formData.adminEmail}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-[#6c757d] uppercase tracking-widest">Location</p>
                                                <p className="font-bold text-[#1a1a1a] leading-tight">{formData.bizCity}, {formData.bizCountry}</p>
                                                <p className="text-[10px] font-black text-[#6c757d] tracking-tight">BRN: {formData.bizBRN}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl flex gap-3 text-xs font-bold leading-relaxed">
                                        <div className="shrink-0 mt-0.5"><Shield size={16} /></div>
                                        <p>Confirming this action will create two database records & generate credentials. Authentication details will be logged under your ID: {currentUser?.email}</p>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div key="s5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center space-y-6 pt-6 pb-10">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-black text-[#1a1a1a]">Provisioning Complete</h3>
                                        <p className="text-[#6c757d] font-bold text-sm max-w-sm">
                                            {formData.bizName} is now active. Send the official onboarding instructions to {formData.adminFirstName}.
                                        </p>
                                    </div>

                                    {/* Onboarding Email Template */}
                                    <div className="w-full bg-gray-50 border border-gray-100 rounded-[32px] p-6 space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#107d92]">Onboarding Email Draft</span>
                                            <button
                                                onClick={() => {
                                                    const body = `Subject: Welcome to UniDeals CRM - ${formData.bizName}\n\nDear ${formData.adminFirstName},\n\nYour business environment at UniDeals Mauritius has been successfully provisioned.\n\nACCESS CREDENTIALS:\n-------------------\nPortal: ${window.location.origin}\nLogin: ${formData.adminEmail}\nAccess Key: ${formData.adminPassword}\n\nQUICK START GUIDE:\n1. Log in using the credentials above.\n2. Go to 'Business Setup' to upload your logo and verify company details.\n3. Head to 'User Management' to invite your team members.\n4. Start creating your first Quotation by clicking 'New Quotation'.\n\nSUBSCRIPTION DETAILS:\nType: ${formData.subType}\nStart Date: ${formData.subStartDate}\nNext Payment: ${formData.subNextDate}\n\nSupport: contact@unideals.online\n\nWelcome aboard!\nAlain BERTRAND\nSuper Admin, UniDeals CRM`;
                                                    navigator.clipboard.writeText(body);
                                                    alert('Onboarding instructions copied to clipboard!');
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase text-[#107d92] bg-white px-4 py-2 rounded-full border border-[#107d92]/20 hover:bg-[#107d92] hover:text-white transition-all shadow-sm"
                                            >
                                                <Mail size={14} /> Copy to Clipboard
                                            </button>
                                        </div>
                                        <div className="bg-white rounded-2xl p-6 text-[10px] lg:text-xs font-mono text-gray-600 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap border border-gray-100">
                                            {`Subject: Welcome to UniDeals CRM - ${formData.bizName}

Dear ${formData.adminFirstName},

Your business environment at UniDeals Mauritius has been successfully provisioned.

ACCESS CREDENTIALS:
-------------------
Portal: ${typeof window !== 'undefined' ? window.location.origin : 'https://unideals.mu'}
Login: ${formData.adminEmail}
Access Key: ${formData.adminPassword}

QUICK START GUIDE:
1. Log in using the credentials above.
2. Go to 'Business Setup' to upload your logo and verify company details.
3. Head to 'User Management' to invite your team members.
4. Start creating your first Quotation by clicking 'New Quotation'.

SUBSCRIPTION DETAILS:
Type: ${formData.subType}
Start Date: ${formData.subStartDate}
Next Payment: ${formData.subNextDate}

Support: contact@unideals.online

Welcome aboard!
Alain BERTRAND
Super Admin, UniDeals CRM`}
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="w-full max-w-xs bg-[#1a1a1a] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-gray-200 active:scale-95 transition-all"
                                    >
                                        Done
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    {step < 5 && (
                        <div className="p-8 border-t border-gray-100 flex justify-between items-center px-10">
                            <button
                                onClick={step === 1 ? onClose : handleBack}
                                className="flex items-center gap-2 text-[#6c757d] font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                            >
                                <ArrowLeft size={18} />
                                {step === 1 ? 'Cancel' : 'Back'}
                            </button>

                            <button
                                onClick={step === 4 ? handleSave : handleNext}
                                disabled={loading}
                                className="bg-[#107d92] text-white py-5 px-10 rounded-[24px] font-black flex items-center gap-3 shadow-xl shadow-[#107d92]/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        {step === 4 ? 'Launch Environment' : 'Next Step'}
                                        {step < 4 && <ArrowRight size={20} />}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
