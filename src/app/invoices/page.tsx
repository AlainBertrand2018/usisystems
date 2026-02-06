'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import DataTable from '@/components/DataTable';
import DocumentViewer from '@/components/DocumentViewer';
import PaymentModal from '@/components/PaymentModal';

export default function InvoicesPage() {
    const [viewItem, setViewItem] = useState<any>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice No' },
        { key: 'clientName', label: 'Client' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('en-GB') : 'N/A' },
        { key: 'total', label: 'Amount', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => {
                const colors: any = {
                    'paid': 'bg-emerald-100 text-emerald-700',
                    'unbanked': 'bg-blue-100 text-blue-700',
                    'pending': 'bg-amber-100 text-amber-700'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[val] || 'bg-amber-100 text-amber-700'}`}>
                        {val || 'Pending'}
                    </span>
                );
            }
        },
    ];

    const handleRegisterPayment = (item: any) => {
        setSelectedInvoice(item);
        setShowPaymentModal(true);
    };

    const generateReceipt = async (invoice: any, paymentData: any) => {
        const receiptNumber = invoice.invoiceNumber.replace('INV-', 'RCP-');
        const paymentValue = paymentData.amount || invoice.total;
        const balanceDue = (invoice.total || 0) - paymentValue;

        await addDoc(collection(db, 'receipts'), {
            receiptNumber,
            invoiceNumber: invoice.invoiceNumber,
            invoiceId: invoice.id,
            clientId: invoice.clientId,
            clientName: invoice.clientName,
            clientCompany: invoice.clientCompany || 'Business Default',
            clientEmail: invoice.clientEmail || '',
            total: invoice.total,
            paymentValue,
            paymentMode: paymentData.mode,
            paymentDetails: paymentData.details || {},
            balanceDue,
            productName: invoice.productName || 'Payment for Invoice',
            date: serverTimestamp(),
            status: 'received'
        });

        // Trigger Send PDF (Mocked)
        console.log(`Sending PDF to ${invoice.clientEmail || 'client'}`);
    };

    const handlePaymentSubmit = async (paymentData: any) => {
        try {
            const invRef = doc(db, 'invoices', selectedInvoice.id);

            if (paymentData.mode === 'Cash') {
                await updateDoc(invRef, {
                    status: 'paid',
                    paymentData: { ...paymentData, status: 'received' }
                });
                await generateReceipt(selectedInvoice, paymentData);
                alert(`Payment received. Receipt generated and sent.`);
            } else {
                await updateDoc(invRef, {
                    status: 'unbanked',
                    paymentData: { ...paymentData, status: 'unbanked' }
                });
                alert(`Payment registered as 'Unbanked'. Please confirm banking once funds are cleared.`);
            }
        } catch (error) {
            console.error("Payment registration error:", error);
            alert("Failed to register payment.");
        }
    };

    const handleBanked = async (item: any) => {
        if (!confirm(`Confirm banking for ${item.invoiceNumber}? This will mark as 'Received' and generate a Receipt.`)) return;

        try {
            const invRef = doc(db, 'invoices', item.id);
            await updateDoc(invRef, { status: 'paid' });

            // Generate receipt using stored payment data
            await generateReceipt(item, item.paymentData);

            alert(`Banking confirmed. Status updated to 'Received' and receipt sent.`);
        } catch (error) {
            console.error("Banking confirmation error:", error);
            alert("Failed to confirm banking.");
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
                onBanked={handleBanked}
                pdfType="INVOICE"
            />

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSubmit={handlePaymentSubmit}
                invoice={selectedInvoice}
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
