'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, FileCheck } from 'lucide-react';
import DataTable from '@/components/DataTable';
import QuotationWizard from '@/components/QuotationWizard';

export default function QuotationsPage() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState<any>(null);

    const columns = [
        { key: 'quoteNumber', label: 'Quotation ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'clientCompany', label: 'Business' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
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
                        {val || 'To send'}
                    </span>
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

    const handleConvert = async (item: any) => {
        if (!confirm(`Convert ${item.quoteNumber} to an official Invoice?`)) return;

        try {
            // 1. Update Quotation Status
            const quoteRef = doc(db, 'quotations', item.id);
            await updateDoc(quoteRef, { status: 'Won' });

            // 2. Create New Invoice
            await addDoc(collection(db, 'invoices'), {
                invoiceNumber: item.quoteNumber.replace('Q-', 'INV-'),
                clientId: item.clientId,
                clientName: item.clientName,
                clientCompany: item.clientCompany || 'Business Default',
                total: item.total,
                status: 'pending',
                date: serverTimestamp(),
                quoteRef: item.id,
                items: [{
                    name: item.productName,
                    qty: item.qty,
                    price: item.price,
                    total: item.total
                }]
            });

            alert(`Success! Invoice ${item.quoteNumber.replace('Q-', 'INV-')} has been generated.`);
        } catch (error) {
            console.error("Conversion error:", error);
            alert("Process failed. Check your connection or permissions.");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 text-left">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Quotations</h1>
                    <p className="text-[#6c757d] text-sm mt-1 font-medium">Generate and track your business proposals</p>
                </div>
                <button
                    onClick={handleNew}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#107d92] text-white px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#107d92]/20"
                >
                    <Plus size={20} />
                    <span>New Quote</span>
                </button>
            </div>

            <DataTable
                collectionName="quotations"
                columns={columns}
                onClone={handleClone}
                onConvert={handleConvert}
                pdfType="QUOTATION"
            />

            <QuotationWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                initialData={wizardData}
            />
        </div>
    );
}
