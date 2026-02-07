'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { X, ArrowRight, ArrowLeft, Check, Eye, Loader2, Search, ChevronDown, Plus, Trash2, Calendar, UserPlus, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientModal from './ClientModal';
import AppointmentModal from './AppointmentModal';
import { useAuth } from '@/context/AuthContext';

interface QuotationWizardProps {
    isOpen: boolean;
    onClose: (newDoc?: any) => void;
    initialData?: any;
}

export default function QuotationWizard({ isOpen, onClose, initialData }: QuotationWizardProps) {
    const { user: currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [savedDoc, setSavedDoc] = useState<any>(null);

    // Form State
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]); // Array of { productId, name, qty, price }
    const [globalDiscount, setGlobalDiscount] = useState<number>(0);
    const [notes, setNotes] = useState('');

    // Auxiliary Modals
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);

    // Search Interface States
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const productsQuery = currentUser.role === 'super_admin'
            ? collection(db, 'business_products')
            : query(collection(db, 'business_products'), where('businessId', '==', currentUser.businessId));

        const clientsQuery = currentUser.role === 'super_admin'
            ? collection(db, 'clients')
            : query(collection(db, 'clients'), where('businessId', '==', currentUser.businessId));

        const unsubProducts = onSnapshot(productsQuery, (s) => {
            setProducts(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubClients = onSnapshot(clientsQuery, (s) => {
            setClients(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => {
            unsubProducts();
            unsubClients();
        };
    }, [currentUser]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setStep(4);
                setSelectedClient(clients.find(c => c.id === initialData.clientId));
                if (initialData.items) {
                    setItems(initialData.items);
                } else {
                    setItems([{
                        productId: initialData.productId,
                        name: initialData.productName,
                        qty: initialData.qty || 1,
                        price: initialData.price || 0
                    }]);
                }
                setGlobalDiscount(initialData.discount || 0);
                setNotes(initialData.notes || '');
            } else {
                setStep(1);
                setSelectedClient(null);
                setItems([]);
                setGlobalDiscount(0);
                setNotes('');
                setClientSearch('');
                setProductSearch('');
                setSavedDoc(null);
            }
        }
    }, [isOpen, initialData, clients]);

    const calculateTotals = () => {
        const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
        const amountBeforeVAT = subtotal - globalDiscount;
        const vatAmount = amountBeforeVAT * 0.15;
        const grandTotal = amountBeforeVAT + vatAmount;
        return { subtotal, amountBeforeVAT, vatAmount, grandTotal };
    };

    const generateQuoteID = (clientName: string, clientBusiness?: string) => {
        const cN = clientName ? clientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX';
        const cB = clientBusiness ? clientBusiness.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'XX';
        const now = new Date();
        const year = now.getFullYear().toString().substring(2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const timeSuffix = (now.getHours() * 60 + now.getMinutes()).toString().padStart(4, '0');
        return `Q-${cN}${cB}-${day}${month}${year}-${timeSuffix}`;
    };

    const handleFinalSave = async () => {
        setLoading(true);
        const { subtotal, amountBeforeVAT, vatAmount, grandTotal } = calculateTotals();
        const quoteId = generateQuoteID(selectedClient.name, selectedClient.company);

        const newDoc = {
            quoteNumber: quoteId,
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            clientCompany: selectedClient.company || 'Private Client',
            clientAddress: selectedClient.address || '',
            clientPhone: selectedClient.phone || '',
            clientEmail: selectedClient.email || '',
            clientBRN: selectedClient.brn || '',
            clientVAT: selectedClient.vat || '',
            items,
            productName: items[0]?.name || 'Multiple Products',
            qty: items.reduce((acc, i) => acc + i.qty, 0),
            price: items[0]?.price || 0,
            subtotal,
            discount: globalDiscount,
            amountBeforeVAT,
            vatAmount,
            total: grandTotal,
            notes,
            status: 'To send',
            businessId: currentUser?.businessId || 'N/A',
            addedBy: currentUser?.email || 'system',
            date: serverTimestamp(),
        };

        try {
            const docRef = await addDoc(collection(db, 'quotations'), newDoc);
            const saved = { id: docRef.id, ...newDoc, date: { seconds: Date.now() / 1000 } };
            setSavedDoc(saved);
            setStep(5);
        } catch (error) {
            console.error("Save error:", error);
            alert("Error saving quotation.");
        } finally {
            setLoading(false);
        }
    };

    const sendEmailNow = async () => {
        if (!savedDoc) return;
        setLoading(true);
        try {
            const res = await fetch('/api/send-document', {
                method: 'POST',
                body: JSON.stringify({
                    documentId: savedDoc.id,
                    collectionName: 'quotations',
                    type: 'QUOTATION'
                })
            });
            if (res.ok) alert('Quotation emailed to client!');
            else alert('Failed to send email.');
        } catch (err) {
            alert('Failed to send email.');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        (c.name?.toLowerCase().includes(clientSearch.toLowerCase())) ||
        (c.company?.toLowerCase().includes(clientSearch.toLowerCase()))
    );

    const filteredProducts = products.filter(p =>
        (p.name?.toLowerCase().includes(productSearch.toLowerCase())) ||
        (p.category?.toLowerCase().includes(productSearch.toLowerCase()))
    );

    const addItem = (product: any, goToNext: boolean = false) => {
        setItems([...items, {
            productId: product.id,
            name: product.name,
            qty: 1,
            price: product.price
        }]);
        setProductSearch('');
        setShowProductDropdown(false);
        if (goToNext) setStep(3);
    };

    if (!isOpen) return null;

    const { subtotal, amountBeforeVAT, vatAmount, grandTotal } = calculateTotals();

    return (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40 backdrop-blur-sm p-0 lg:p-4">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[40px] lg:rounded-[32px] shadow-2xl w-full max-w-2xl h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 lg:p-10 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-[#1a1a1a]">
                                {step === 5 ? 'Success!' : initialData ? 'Modify Quotation' : 'Refined Proposal Wizard'}
                            </h2>
                            <p className="text-[#6c757d] text-xs lg:text-sm mt-1 font-bold opacity-70 italic">
                                {step === 1 && 'Step 1: Identify your client'}
                                {step === 2 && 'Step 2: Choose primary product'}
                                {step === 3 && 'Step 3: Define proposal & bundle'}
                                {step === 4 && 'Step 4: Final quality check'}
                                {step === 5 && 'Quotation created & logged'}
                            </p>
                        </div>
                        <button onClick={() => onClose(savedDoc)} className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full transition-colors text-gray-400 hover:text-gray-900 border border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {step < 5 && (
                        <div className="flex items-center justify-between mb-8 relative px-4 lg:px-10">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-50 -translate-y-1/2 z-0"></div>
                            <div className={`absolute top-1/2 left-0 h-1 bg-[#107d92] -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: `${(step - 1) * 33.3}%` }}></div>

                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${step >= s ? 'bg-[#107d92] text-white' : 'bg-white border-4 border-gray-50 text-gray-300'}`}>
                                        {step > s ? <Check size={14} /> : s}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-[#6c757d] uppercase tracking-[0.2em] pl-1">Target Client Profile</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#107d92] transition-colors">
                                                <Search size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Enter name or company..."
                                                value={clientSearch}
                                                onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                                                onFocus={() => setShowClientDropdown(true)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-14 pr-12 py-5 outline-none transition-all font-bold text-[#1a1a1a] shadow-sm hover:shadow-md"
                                            />
                                            <AnimatePresence>
                                                {showClientDropdown && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[250px] overflow-y-auto no-scrollbar py-2">
                                                        {filteredClients.map((c) => (
                                                            <button key={c.id} type="button" onClick={() => { setSelectedClient(c); setClientSearch(c.name); setShowClientDropdown(false); setStep(2); }} className="w-full px-6 py-4 text-left hover:bg-gray-50 flex justify-between items-center transition-colors">
                                                                <div>
                                                                    <p className="font-bold text-[#1a1a1a]">{c.name}</p>
                                                                    <p className="text-xs text-[#6c757d] mt-1">{c.company || 'Private Client'}</p>
                                                                </div>
                                                                <ArrowRight size={16} className="text-gray-300" />
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button type="button" onClick={() => setIsClientModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-[#6c757d] font-bold text-sm hover:border-[#107d92] hover:text-[#107d92] transition-all">
                                            <UserPlus size={18} /> Create New Database Profile
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-[#6c757d] uppercase tracking-[0.2em] pl-1">Primary Product/Service</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#107d92] transition-colors">
                                                <Search size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search inventory..."
                                                value={productSearch}
                                                onChange={(e) => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                                                onFocus={() => setShowProductDropdown(true)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-14 pr-12 py-5 outline-none transition-all font-bold text-[#1a1a1a] shadow-sm"
                                            />
                                            <AnimatePresence>
                                                {showProductDropdown && (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[250px] overflow-y-auto no-scrollbar py-2">
                                                        {filteredProducts.map((p) => (
                                                            <button key={p.id} type="button" onClick={() => addItem(p, true)} className="w-full px-6 py-4 text-left hover:bg-gray-50 flex justify-between items-center transition-colors">
                                                                <div>
                                                                    <p className="font-bold text-[#1a1a1a]">{p.name}</p>
                                                                    <p className="text-xs text-[#6c757d] mt-1">{p.category}</p>
                                                                </div>
                                                                <span className="font-black text-[#107d92] text-xs">MUR {p.price?.toLocaleString()}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-[#6c757d] font-bold text-sm px-1">
                                            <ArrowLeft size={16} /> Back to Client
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="bg-gray-50 rounded-[32px] p-6 lg:p-8 space-y-6">
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d]">Proposal Bundle</p>
                                            <div className="relative">
                                                <button type="button" onClick={() => setShowProductDropdown(!showProductDropdown)} className="text-[#107d92] text-xs font-black flex items-center gap-1 bg-[#107d92]/5 px-3 py-1.5 rounded-lg border border-[#107d92]/20">
                                                    <Plus size={14} /> Add Product
                                                </button>
                                                <AnimatePresence>
                                                    {showProductDropdown && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-[280px] z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
                                                            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                                                <input autoFocus type="text" placeholder="Search..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full bg-white px-3 py-2 rounded-xl text-xs outline-none border border-gray-100 font-bold" />
                                                            </div>
                                                            <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                                                                {filteredProducts.map(p => (
                                                                    <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full px-4 py-3 text-left hover:bg-gray-50 text-xs font-bold border-b border-gray-50 last:border-0">{p.name}</button>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-sm text-[#1a1a1a]">{item.name}</p>
                                                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-rose-500 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 pl-1">Quantity</label>
                                                            <input type="number" value={item.qty} onChange={(e) => {
                                                                const ni = [...items]; ni[idx].qty = parseInt(e.target.value) || 0; setItems(ni);
                                                            }} className="w-full bg-gray-50 col-span-1 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-gray-400 pl-1">Unit Price</label>
                                                            <input type="number" value={item.price} onChange={(e) => {
                                                                const ni = [...items]; ni[idx].price = parseFloat(e.target.value) || 0; setItems(ni);
                                                            }} className="w-full bg-gray-50 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-gray-200/50 space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-[#6c757d] pl-1 tracking-widest">Global Quotation Discount (MUR)</label>
                                                <input
                                                    type="number"
                                                    value={globalDiscount}
                                                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-rose-50/30 border-2 border-rose-100/50 focus:border-rose-300 rounded-2xl px-6 py-4 font-black text-[#1a1a1a] outline-none text-lg"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="space-y-3 pt-2 font-bold text-[#6c757d] text-sm">
                                                <div className="flex justify-between">
                                                    <span>Subtotal</span>
                                                    <span>MUR {subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-rose-500">
                                                    <span>Discount</span>
                                                    <span>- MUR {globalDiscount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between pt-3 border-t-2 border-dashed border-gray-200 text-[#107d92] text-xl font-black">
                                                    <span>TOTAL</span>
                                                    <span>MUR {grandTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(4)} disabled={items.length === 0} className="w-full bg-[#107d92] text-white py-5 rounded-2xl font-black shadow-xl shadow-[#107d92]/20 flex items-center justify-center gap-3">
                                        Review Proposal Summary <ArrowRight size={20} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                                    <div className="bg-white border-2 border-[#107d92]/10 rounded-[40px] p-8 space-y-8 shadow-sm">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Prepared For</p>
                                                <p className="font-bold text-[#1a1a1a]">{selectedClient?.name}</p>
                                                <p className="text-xs text-[#6c757d] mt-1">{selectedClient?.company}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] mb-2">Summary</p>
                                                <p className="font-bold text-[#107d92]">{items.length} Product(s)</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {items.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center text-sm py-3 border-b border-gray-50 last:border-0 font-medium">
                                                    <div className="flex-1">
                                                        <p className="text-[#1a1a1a] font-bold">{item.name}</p>
                                                        <p className="text-xs text-[#6c757d] mt-0.5">{item.qty} × MUR {item.price.toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-bold text-[#1a1a1a]">MUR {(item.qty * item.price).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t-2 border-gray-100 space-y-3 font-bold">
                                            {globalDiscount > 0 && (
                                                <div className="flex justify-between text-sm text-rose-500">
                                                    <span>Global Discount</span>
                                                    <span>- MUR {globalDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-[#6c757d] text-sm">
                                                <span>VAT (15%)</span>
                                                <span>MUR {vatAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-end pt-4 font-black text-[#107d92]">
                                                <span className="text-xs uppercase tracking-widest text-[#1a1a1a]">Total Proposal Amount</span>
                                                <span className="text-3xl">MUR {grandTotal.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(3)} className="flex-1 py-5 border-2 border-gray-100 rounded-3xl font-black text-[#6c757d] hover:bg-gray-50 transition-all">
                                            Back & Edit
                                        </button>
                                        <button onClick={handleFinalSave} disabled={loading} className="flex-[2] bg-[#107d92] text-white py-5 rounded-3xl font-black shadow-xl shadow-[#107d92]/20 flex items-center justify-center gap-3">
                                            {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Confirm & Save Proposal</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div key="step5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center py-10 space-y-8">
                                    <div className="w-24 h-24 bg-[#107d92]/10 rounded-full flex items-center justify-center text-[#107d92]">
                                        <CheckCircle2 size={56} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-[#1a1a1a]">Quotation Ready!</h3>
                                        <p className="text-[#6c757d] font-bold mt-2">ID: <span className="text-[#107d92]">{savedDoc?.quoteNumber}</span></p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 w-full px-10">
                                        <button onClick={sendEmailNow} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#107d92] text-white py-5 rounded-3xl font-black shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] transition-all">
                                            {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Email Proposal Now</>}
                                        </button>
                                        <button onClick={() => setIsApptModalOpen(true)} className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-3xl font-black shadow-lg hover:scale-[1.02] transition-all">
                                            <Calendar size={20} /> Set Follow-up Meeting
                                        </button>
                                        <button onClick={() => onClose(savedDoc)} className="w-full py-4 text-[#6c757d] font-black text-sm uppercase tracking-widest hover:text-[#1a1a1a] transition-all">
                                            View Quotes Dashboard
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={(client) => { setSelectedClient(client); setStep(2); }}
            />
            <AppointmentModal
                isOpen={isApptModalOpen}
                onClose={() => setIsApptModalOpen(false)}
                preselectedClient={selectedClient}
            />
        </div>
    );
}
