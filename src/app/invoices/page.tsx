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

    const handleRegisterPayment = async (item: any) => {
        if (item.status === 'paid') {
            alert("This invoice is already marked as paid.");
            return;
        }

        if (!confirm(`Register payment for ${item.invoiceNumber}? This will generate a Receipt.`)) return;

        try {
            // 1. Update Invoice Status
            const invRef = doc(db, 'invoices', item.id);
            await updateDoc(invRef, { status: 'paid' });

            // 2. Generate Receipt
            const receiptNumber = item.invoiceNumber.replace('INV-', 'RCP-');
            await addDoc(collection(db, 'receipts'), {
                receiptNumber,
                invoiceNumber: item.invoiceNumber,
                invoiceId: item.id,
                clientId: item.clientId,
                clientName: item.clientName,
                clientCompany: item.clientCompany || 'Business Default',
                total: item.total,
                subtotal: item.subtotal || item.total,
                discount: item.discount || 0,
                amountBeforeVAT: item.amountBeforeVAT || item.total,
                vatAmount: item.vatAmount || 0,
                productName: item.productName || 'Payment for Invoice',
                date: serverTimestamp(),
                status: 'Closed'
            });

            alert(`Payment registered. Receipt ${receiptNumber} generated.`);
        } catch (error) {
            console.error("Payment error:", error);
            alert("Failed to register payment.");
        }
    };

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
                onRegisterPayment={handleRegisterPayment}
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
