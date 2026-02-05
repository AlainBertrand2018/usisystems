'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, Printer, FileDown, Mail, CheckCircle2, AlertCircle, Trash2, Send } from 'lucide-react';
import PDFDownloadButton from './pdf/PDFDownloadButton';

interface DocumentViewerProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    data: any;
}

export default function DocumentViewer({ isOpen, onClose, type, data }: DocumentViewerProps) {
    const [businessDetails, setBusinessDetails] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const unsub = onSnapshot(collection(db, 'businessdetails'), (snapshot) => {
            if (!snapshot.empty) {
                setBusinessDetails(snapshot.docs[0].data());
            }
        });
        return () => unsub();
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const handleUpdateStatus = async (newStatus: string) => {
        if (!data.id) return;
        setIsUpdating(true);
        try {
            const collectionMap: any = {
                'QUOTATION': 'quotations',
                'INVOICE': 'invoices',
                'RECEIPT': 'receipts'
            };
            const docRef = doc(db, collectionMap[type], data.id);
            await updateDoc(docRef, { status: newStatus });

            // Trigger Invoice generation if Quote is marked WON
            if (type === 'QUOTATION' && newStatus === 'Won') {
                const invRef = await addDoc(collection(db, 'invoices'), {
                    invoiceNumber: data.quoteNumber.replace('Q-', 'INV-'),
                    clientId: data.clientId,
                    clientName: data.clientName,
                    clientCompany: data.clientCompany || 'Business Default',
                    total: data.total,
                    status: 'pending',
                    date: serverTimestamp(),
                    quoteRef: data.id,
                    productName: data.productName,
                    qty: data.qty,
                    price: data.price,
                    notes: data.notes
                });
                alert(`Quotation WON! Invoice generated: ${data.quoteNumber.replace('Q-', 'INV-')}`);
            } else {
                alert(`Status updated to ${newStatus}`);
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update status.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans overflow-hidden lg:inset-10 lg:rounded-[40px] lg:shadow-2xl lg:border lg:border-gray-200">
            {/* Action Bar */}
            <div className="ios-blur sticky top-0 z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80">
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-900 active:scale-90 transition-transform">
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3">
                    {/* Status Controls for Quotation */}
                    {type === 'QUOTATION' && (
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1 mr-4">
                            {[
                                { s: 'Sent', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { s: 'Won', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { s: 'Rejected', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { s: 'Lost', icon: Trash2, color: 'text-gray-600', bg: 'bg-gray-50' }
                            ].map((btn) => (
                                <button
                                    key={btn.s}
                                    onClick={() => handleUpdateStatus(btn.s)}
                                    disabled={isUpdating || data.status === btn.s}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${data.status === btn.s
                                        ? `${btn.bg} ${btn.color} ring-1 ring-inset ring-current`
                                        : 'text-gray-400 hover:bg-white'
                                        }`}
                                >
                                    <btn.icon size={14} />
                                    <span className="hidden sm:inline">{btn.s}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <button className="p-2 bg-gray-100 rounded-xl text-gray-400 hover:text-[#107d92] transition-colors">
                        <Mail size={20} />
                    </button>
                    <PDFDownloadButton type={type} data={data} showLabel={true} />
                </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar bg-white">
                <div className="max-w-3xl mx-auto space-y-12 text-[#1a1a1a]">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-6">
                            <img
                                src="/images/unideal_logo.webp"
                                alt="UniDeals Logo"
                                className="w-40"
                            />
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tighter">{businessDetails?.name || 'UNIDEALS Ltd'}</h1>
                                <p className="text-xs text-[#6c757d] whitespace-pre-line leading-relaxed">
                                    {businessDetails?.address || 'Ebène Cybercity, Mauritius'}
                                    {businessDetails?.brn && `\nBRN: ${businessDetails.brn}`}
                                    {businessDetails?.phone && `\nTel: ${businessDetails.phone}`}
                                    {businessDetails?.email && `\nEmail: ${businessDetails.email}`}
                                    {businessDetails?.website && `\nWeb: ${businessDetails.website}`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-black text-[#107d92] uppercase opacity-10 mb-2">{type}</h2>
                            <p className="text-sm font-black">{data.quoteNumber || data.invoiceNumber || data.receiptNumber || 'DOC-REF'}</p>
                            <p className="text-xs text-[#6c757d] mt-1">
                                {data.date?.seconds
                                    ? new Date(data.date.seconds * 1000).toLocaleDateString('en-GB')
                                    : new Date().toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>

                    <div className="h-[2px] bg-gray-100 w-full"></div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#107d92] mb-3">Bill To</p>
                            <h3 className="text-lg font-black">{data.clientName}</h3>
                            <p className="text-sm text-[#6c757d] mt-1 italic">{data.clientCompany}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#107d92] mb-3">Current Status</p>
                            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${data.status === 'Won' ? 'bg-emerald-100 text-emerald-700' :
                                data.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                                    data.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                        'bg-amber-100 text-amber-700'
                                }`}>
                                {data.status || 'To Send'}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-100 text-[#6c757d]">
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Price</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-50">
                                    <td className="py-6">
                                        <p className="font-bold">{data.productName || 'Service / Product'}</p>
                                        <p className="text-xs text-[#6c757d] mt-1 italic">{data.notes || '---'}</p>
                                    </td>
                                    <td className="py-6 text-center font-bold">{data.qty || 1}</td>
                                    <td className="py-6 text-right font-bold">MUR {(data.price || 0).toLocaleString()}</td>
                                    <td className="py-6 text-right font-black text-[#107d92]">MUR {(data.total || 0).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end pt-10">
                        <div className="w-full max-w-xs space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#6c757d] font-bold">Subtotal</span>
                                <span className="font-bold">MUR {(data.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t-2 border-[#107d92]/20">
                                <span className="text-lg font-black">Total</span>
                                <span className="text-3xl font-black text-[#107d92]">MUR {(data.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
