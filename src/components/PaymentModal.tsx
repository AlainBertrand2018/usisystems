'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Wallet, CreditCard, Landmark, Smartphone, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (paymentData: any) => void;
    invoice: any;
}

export default function PaymentModal({ isOpen, onClose, onSubmit, invoice }: PaymentModalProps) {
    const [mode, setMode] = useState<'Cash' | 'Cheque' | 'Payment App' | 'Bank Transfer'>('Cash');
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Mode specific fields
    const [chequeNo, setChequeNo] = useState('');
    const [bankName, setBankName] = useState('');
    const [appName, setAppName] = useState('');
    const [accNo, setAccNo] = useState('');

    useEffect(() => {
        if (invoice) {
            setAmount(invoice.total || 0);
        }
    }, [invoice]);

    if (!isOpen || !invoice) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const paymentData = {
            amount,
            mode,
            details: {
                chequeNo: mode === 'Cheque' ? chequeNo : null,
                bankName: (mode === 'Cheque' || mode === 'Bank Transfer') ? bankName : null,
                appName: mode === 'Payment App' ? appName : null,
                accNo: mode === 'Bank Transfer' ? accNo : null,
            },
            timestamp: new Date()
        };

        await onSubmit(paymentData);
        setLoading(false);
        onClose();
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
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Register Payment</h2>
                            <p className="text-[#6c757d] text-sm font-bold mt-1">Invoice: {invoice.invoiceNumber}</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                        {/* Amount Section */}
                        <div className="bg-[#107d92]/5 p-6 rounded-3xl border border-[#107d92]/10">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#107d92] mb-3">Amount to Register (MUR)</label>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="w-full bg-transparent text-4xl font-black text-[#107d92] outline-none"
                            />
                            <p className="text-[10px] font-bold text-[#107d92]/60 mt-2 italic">Total Due: MUR {invoice.total?.toLocaleString()}</p>
                        </div>

                        {/* Payment Mode Selector */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#6c757d]">Mode of Payment</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'Cash', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    { id: 'Cheque', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { id: 'Payment App', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { id: 'Bank Transfer', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setMode(item.id as any)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${mode === item.id
                                                ? 'border-[#107d92] bg-white shadow-md'
                                                : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span>{item.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Conditional Fields */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                {mode === 'Cheque' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Cheque Number</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 1234567"
                                                value={chequeNo}
                                                onChange={(e) => setChequeNo(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Bank Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. MCB, SBM"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                {mode === 'Payment App' && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">App Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Juice, Blink, My.t Money"
                                            value={appName}
                                            onChange={(e) => setAppName(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        />
                                    </div>
                                )}

                                {mode === 'Bank Transfer' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Bank Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Absa, Maubank"
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Account No.</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Account digits..."
                                                value={accNo}
                                                onChange={(e) => setAccNo(e.target.value)}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#107d92] text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-[#107d92]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />}
                            <span>Confirm & Register Payment</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
