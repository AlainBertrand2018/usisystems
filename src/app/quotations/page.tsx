'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import QuotationWizard from '@/components/QuotationWizard';
import DocumentViewer from '@/components/DocumentViewer';

export default function QuotationsPage() {
    const searchParams = useSearchParams();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState<any>(null);
    const [viewItem, setViewItem] = useState<any>(null);

    // Automatically open wizard if redirected from Splash with action=new
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            setIsWizardOpen(true);
        }
    }, [searchParams]);

    const columns = [
        { key: 'quoteNumber', label: 'Quotation ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'clientCompany', label: 'Business' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('en-GB') : 'N/A' },
        { key: 'total', label: 'Value', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => {
                const colors: any = {
                    'Won': 'bg-emerald-100 text-emerald-700',
                    'Sent': 'bg-blue-100 text-blue-700',
                    'Rejected': 'bg-rose-100 text-rose-700',
                    'Lost': 'bg-gray-100 text-gray-700'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[val] || 'bg-amber-100 text-amber-700'}`}>
                        {val === 'sent' || val === 'Sent' ? 'Sent' : (val || 'To send')}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Quick Status',
            format: (val: any, item: any) => {
                const handleUpdateStatus = async (newStatus: string) => {
                    if (!item.id) return;
                    try {
                        const docRef = doc(db, 'quotations', item.id);
                        await updateDoc(docRef, { status: newStatus });

                        if (newStatus === 'Won') {
                            const docNo = item.quoteNumber || item.id;
                            await addDoc(collection(db, 'invoices'), {
                                invoiceNumber: docNo.replace('Q-', 'INV-'),
                                clientId: item.clientId,
                                clientName: item.clientName,
                                clientCompany: item.clientCompany || 'Business Default',
                                clientAddress: item.clientAddress || '',
                                clientBRN: item.clientBRN || '',
                                clientVAT: item.clientVAT || '',
                                clientPhone: item.clientPhone || '',
                                clientEmail: item.clientEmail || '',
                                total: item.total,
                                status: 'pending',
                                date: serverTimestamp(),
                                quoteRef: item.id,
                                productName: item.productName,
                                qty: item.qty,
                                price: item.price,
                                notes: item.notes,
                                businessId: item.businessId
                            });
                            alert(`Quote WON! Invoice generated.`);
                        }
                    } catch (error) {
                        console.error("Manual status update error:", error);
                        alert("Failed to update status.");
                    }
                };

                return (
                    <div className="flex bg-gray-50 p-1 rounded-xl gap-1 w-fit">
                        {[
                            { s: 'Sent', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { s: 'Won', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { s: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-50' }
                        ].map((btn) => (
                            <button
                                key={btn.s}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(btn.s);
                                }}
                                disabled={item.status === btn.s}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${item.status === btn.s
                                        ? `${btn.bg} ${btn.color} ring-1 ring-inset ring-current`
                                        : 'text-gray-400 hover:bg-white'
                                    }`}
                            >
                                {btn.s}
                            </button>
                        ))}
                    </div>
                );
            }
        },
    ];

    const handleNew = () => {
        setWizardData(null);
        setIsWizardOpen(true);
    };

    const handleClone = (item: any) => {
        setWizardData(item);
        setIsWizardOpen(true);
    };

    const closeWizard = (newDoc?: any) => {
        setIsWizardOpen(false);
        setWizardData(null);
        if (newDoc) {
            setViewItem(newDoc);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#1a1a1a]">Quotations</h1>
                    <p className="text-[#6c757d] text-sm font-medium mt-1">Manage proposals and closing</p>
                </div>
                <button
                    onClick={handleNew}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#107d92] text-white px-8 py-4 rounded-[20px] font-black shadow-lg shadow-[#107d92]/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    <span>New Quote</span>
                </button>
            </div>

            <DataTable
                collectionName="quotations"
                columns={columns}
                onClone={handleClone}
                onView={(item) => setViewItem(item)}
                pdfType="QUOTATION"
            />

            <QuotationWizard
                isOpen={isWizardOpen}
                onClose={closeWizard}
                initialData={wizardData}
            />

            <DocumentViewer
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                type="QUOTATION"
                data={viewItem}
            />
        </div>
    );
}
