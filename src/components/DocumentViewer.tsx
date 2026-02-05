'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import { X, Printer, FileDown, Mail, CheckCircle2 } from 'lucide-react';
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
        const unsub = onSnapshot(collection(db, 'business_details'), (snapshot) => {
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
            alert(`Status updated to ${newStatus}`);
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
                <div className="flex gap-2">
                    {type === 'QUOTATION' && data.status !== 'Won' && (
                        <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus('Won')}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs"
                        >
                            <CheckCircle2 size={16} /> Mark Won
                        </button>
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
                                    {businessDetails?.address || 'Ebène Cybercity, Mauritius'}\n
                                    BRN: {businessDetails?.brn || 'C12345678'}\n
                                    VAT: {businessDetails?.vat || '20000000'}
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
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#107d92] mb-3">Status</p>
                            <span className="px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest">
                                {data.status || 'Sent'}
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
