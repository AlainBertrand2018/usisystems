'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, ArrowRight, ArrowLeft, Check, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuotationWizardProps {
    isOpen: boolean;
    onClose: (newDoc?: any) => void;
    initialData?: any;
}

export default function QuotationWizard({ isOpen, onClose, initialData }: QuotationWizardProps) {
    const [step, setStep] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const unsubProducts = onSnapshot(collection(db, 'business_products'), (s) => {
            setProducts(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubClients = onSnapshot(collection(db, 'clients'), (s) => {
            setClients(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubProducts();
            unsubClients();
        };
    }, []);

    useEffect(() => {
        if (initialData) {
            setStep(3);
            setSelectedProduct(products.find(p => p.id === initialData.productId));
            setSelectedClient(clients.find(c => c.id === initialData.clientId));
            setQty(initialData.qty || 1);
            setUnitPrice(initialData.price || 0);
            setNotes(initialData.notes || '');
        } else {
            setStep(1);
            setSelectedProduct(null);
            setSelectedClient(null);
            setQty(1);
            setUnitPrice(0);
            setNotes('');
        }
    }, [initialData, products, clients]);

    const getInitials = (clientName: string, company?: string) => {
        const cN = clientName ? clientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX';
        const cB = company ? company.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX';
        return { cN, cB };
    };

    const generateQuoteID = (clientName: string, clientBusiness?: string) => {
        const { cN, cB } = getInitials(clientName, clientBusiness);
        const now = new Date();
        const year = now.getFullYear().toString().substring(2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        // Unique suffix using time decimals to avoid collisions
        const timeSuffix = (now.getHours() * 60 + now.getMinutes()).toString().padStart(4, '0');

        return `Q-${cN}${cB}-${day}${month}${year}-${timeSuffix}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const total = qty * unitPrice;
        const quoteId = generateQuoteID(selectedClient.name, selectedClient.company);

        const newDoc = {
            quoteNumber: quoteId,
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            clientCompany: selectedClient.company || 'Business Default',
            clientAddress: selectedClient.address || '',
            clientBRN: selectedClient.brn || '',
            clientVAT: selectedClient.vat || '',
            clientPhone: selectedClient.phone || '',
            clientEmail: selectedClient.email || '',
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            qty,
            price: unitPrice,
            total,
            notes,
            status: 'To Send', // Default status as requested
            date: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(collection(db, 'quotations'), newDoc);
            onClose({ id: docRef.id, ...newDoc, date: { seconds: Date.now() / 1000 } });
        } catch (error) {
            console.error("Error creating quotation:", error);
            alert("Error creating quotation.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-0 lg:p-4">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[40px] lg:rounded-[32px] shadow-2xl w-full max-w-2xl h-[92vh] lg:h-auto overflow-hidden flex flex-col"
            >
                <div className="p-6 lg:p-10 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6 lg:mb-10">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-[#1a1a1a]">
                                {initialData ? 'Edit Quotation' : 'New Quotation'}
                            </h2>
                            <p className="text-[#6c757d] text-xs lg:text-sm mt-1 font-medium italic opacity-70">Guided Proposal Engine</p>
                        </div>
                        <button onClick={() => onClose()} className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full transition-colors text-gray-400 hover:text-gray-900 border border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-8 lg:mb-12 relative px-4 lg:px-10">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-50 -translate-y-1/2 z-0"></div>
                        <div className={`absolute top-1/2 left-0 h-1 bg-[#107d92] -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>

                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-bold text-sm lg:text-base transition-all duration-300 ${step >= s ? 'bg-[#107d92] text-white' : 'bg-white border-4 border-gray-50 text-gray-300'}`}>
                                    {step > s ? <Check size={16} /> : s}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        {step === 1 && (
                            <div className="space-y-4 lg:space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase tracking-[0.2em] mb-4">Select Product / Service</label>
                                    <div className="grid grid-cols-1 gap-3 lg:gap-4 scroll-smooth">
                                        {products.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setUnitPrice(p.price);
                                                    setStep(2);
                                                }}
                                                className={`p-5 lg:p-6 rounded-2xl border-2 text-left transition-all active:scale-95 ${selectedProduct?.id === p.id
                                                    ? 'border-[#107d92] bg-[#107d92]/5 ring-4 ring-[#107d92]/10'
                                                    : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-[#1a1a1a]">{p.name}</h4>
                                                        <p className="text-xs text-[#6c757d] mt-1">{p.category || 'General Service'}</p>
                                                    </div>
                                                    <span className="text-base font-black text-[#107d92]">MUR {p.price?.toLocaleString()}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 lg:space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[#6c757d] uppercase tracking-[0.2em] mb-4">Select Client</label>
                                    <div className="flex flex-col gap-3 lg:gap-4 w-full">
                                        {clients.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClient(c);
                                                    setStep(3);
                                                }}
                                                className={`p-5 lg:p-6 rounded-2xl border-2 text-left transition-all active:scale-95 ${selectedClient?.id === c.id
                                                    ? 'border-[#107d92] bg-[#107d92]/5 ring-4 ring-[#107d92]/10'
                                                    : 'border-gray-50 hover:border-gray-200 bg-gray-50/30'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-[#1a1a1a]">{c.name}</h4>
                                                        <p className="text-xs text-[#6c757d] mt-1">{c.company || 'Private Client'}</p>
                                                    </div>
                                                    <ArrowRight size={18} className="text-gray-300" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-[#6c757d] font-bold text-sm lg:text-base">
                                    <ArrowLeft size={16} /> Back
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 lg:space-y-8">
                                <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 space-y-4 lg:space-y-6">
                                    <div className="flex justify-between gap-4 pb-4 border-b border-gray-200/50">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-1">To Client</p>
                                            <p className="font-bold text-[#1a1a1a] text-sm lg:text-base">{selectedClient?.name}</p>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-1">Service</p>
                                            <p className="font-bold text-[#1a1a1a] text-sm lg:text-base">{selectedProduct?.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={qty}
                                                onChange={(e) => setQty(parseInt(e.target.value))}
                                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-sm focus:border-[#107d92] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Price (MUR)</label>
                                            <input
                                                type="number"
                                                value={unitPrice}
                                                onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-sm focus:border-[#107d92] outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#107d92] outline-none resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-200/50 flex justify-between items-center">
                                        <span className="text-sm font-black text-[#1a1a1a]">Total</span>
                                        <span className="text-2xl font-black text-[#107d92]">MUR {(qty * unitPrice).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-[#6c757d]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-[#107d92] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#107d92]/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <Eye size={18} /> Review & Save
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
