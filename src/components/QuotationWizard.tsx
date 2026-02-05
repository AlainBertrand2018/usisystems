'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, ArrowRight, ArrowLeft, Plus, Check } from 'lucide-react';

interface QuotationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

export default function QuotationWizard({ isOpen, onClose, initialData }: QuotationWizardProps) {
    const [step, setStep] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

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

    const getInitials = (str: string) => {
        if (!str) return 'XX';
        return str.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const generateQuoteID = (clientName: string, clientBusiness?: string) => {
        const now = new Date();
        const ci = getInitials(clientName);
        const bi = getInitials(clientBusiness || 'Business Default');

        const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getFullYear().toString().substring(2, 4) +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        return `Q-${ci}${bi}-${dateStr}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const total = qty * unitPrice;
        const quoteId = generateQuoteID(selectedClient.name, selectedClient.company);

        try {
            await addDoc(collection(db, 'quotations'), {
                quoteNumber: quoteId,
                clientId: selectedClient.id,
                clientName: selectedClient.name,
                clientCompany: selectedClient.company || 'Business Default',
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                qty,
                price: unitPrice,
                total,
                notes,
                status: 'Sent',
                date: serverTimestamp(),
            });
            onClose();
        } catch (error) {
            console.error("Error creating quotation:", error);
            alert("Error creating quotation. Check console for details.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a]">
                                {initialData ? 'Edit Quotation' : 'Create New Quotation'}
                            </h2>
                            <p className="text-[#6c757d] text-sm mt-1">Follow the steps to generate a professional proposal.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-12 relative px-10">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div className={`absolute top-1/2 left-0 h-1 bg-[#107d92] -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>

                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-[#107d92] text-white' : 'bg-white border-4 border-gray-100 text-gray-400'
                                    }`}>
                                    {step > s ? <Check size={18} /> : s}
                                </div>
                                <span className={`text-xs mt-2 font-bold uppercase tracking-widest ${step >= s ? 'text-[#107d92]' : 'text-gray-400'}`}>
                                    {s === 1 ? 'Product' : s === 2 ? 'Client' : 'Review'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Select Product / Service</label>
                                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {products.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setUnitPrice(p.price);
                                                    setStep(2);
                                                }}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedProduct?.id === p.id
                                                        ? 'border-[#107d92] bg-[#107d92]/5 ring-4 ring-[#107d92]/10'
                                                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-[#1a1a1a]">{p.name}</h4>
                                                        <p className="text-sm text-[#6c757d] mt-1">{p.category || 'General Service'}</p>
                                                    </div>
                                                    <span className="text-lg font-black text-[#107d92]">MUR {p.price?.toLocaleString()}</span>
                                                </div>
                                            </button>
                                        ))}
                                        <button type="button" className="p-6 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-[#107d92] hover:border-[#107d92] transition-all">
                                            <Plus size={20} />
                                            <span className="font-bold">Add New Service</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                <div>
                                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Select Client</label>
                                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {clients.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClient(c);
                                                    setStep(3);
                                                }}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedClient?.id === c.id
                                                        ? 'border-[#107d92] bg-[#107d92]/5 ring-4 ring-[#107d92]/10'
                                                        : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-[#1a1a1a]">{c.name}</h4>
                                                        <p className="text-sm text-[#6c757d] mt-1">{c.company || 'Private Client'}</p>
                                                    </div>
                                                    <ArrowRight size={20} className="text-gray-300" />
                                                </div>
                                            </button>
                                        ))}
                                        <button type="button" className="p-6 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:text-[#107d92] hover:border-[#107d92] transition-all">
                                            <Plus size={20} />
                                            <span className="font-bold">Add New Client</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
                                    <div className="flex justify-between gap-8 pb-6 border-b border-gray-200/50">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-1">To Client</p>
                                            <p className="font-bold text-[#1a1a1a]">{selectedClient?.name}</p>
                                            <p className="text-sm text-[#6c757d]">{selectedClient?.company}</p>
                                        </div>
                                        <div className="flex-1 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-1">Service</p>
                                            <p className="font-bold text-[#1a1a1a]">{selectedProduct?.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={qty}
                                                onChange={(e) => setQty(parseInt(e.target.value))}
                                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold focus:border-[#107d92] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Unit Price (MUR)</label>
                                            <input
                                                type="number"
                                                value={unitPrice}
                                                onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold focus:border-[#107d92] outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Additional Notes</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={2}
                                            placeholder="Terms and conditions or specific instructions..."
                                            className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-[#107d92] outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-gray-200/50 flex justify-between items-center">
                                        <span className="text-xl font-black text-[#1a1a1a]">Total Value</span>
                                        <span className="text-3xl font-black text-[#107d92]">MUR {(qty * unitPrice).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button type="submit" className="bg-[#107d92] text-white px-10 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#107d92]/20">
                                        {initialData ? 'Update Quotation' : 'Finalize & Send'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
