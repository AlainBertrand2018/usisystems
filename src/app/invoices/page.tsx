'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import DataTable from '@/components/DataTable';
import DocumentViewer from '@/components/DocumentViewer';

export default function InvoicesPage() {
    const [viewItem, setViewItem] = useState<any>(null);

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice No' },
        { key: 'clientName', label: 'Client' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('en-GB') : 'N/A' },
        { key: 'total', label: 'Amount', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${val === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {val || 'Pending'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 pb-10">
            <div className="px-4">
                <h1 className="text-2xl lg:text-3xl font-black text-[#1a1a1a]">Invoices</h1>
                <p className="text-[#6c757d] text-sm font-medium mt-1">Official billing and payment tracking</p>
            </div>

            <DataTable
                collectionName="invoices"
                columns={columns}
                onView={(item) => setViewItem(item)}
                pdfType="INVOICE"
            />

            <DocumentViewer
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                type="INVOICE"
                data={viewItem}
            />
        </div>
    );
}
