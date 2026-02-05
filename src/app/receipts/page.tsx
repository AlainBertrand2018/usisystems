'use client';

import DataTable from '@/components/DataTable';

export default function ReceiptsPage() {
    const columns = [
        { key: 'invoiceNumber', label: 'Invoice Ref' },
        { key: 'amountPaid', label: 'Amount Paid', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'paymentMethod', label: 'Method' },
        { key: 'date', label: 'Payment Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Payment Receipts</h1>
                    <p className="text-[#6c757d] text-sm mt-1">Track and download payment confirmations</p>
                </div>
            </div>
            <DataTable collectionName="receipts" columns={columns} pdfType="RECEIPT" />
        </div>
    );
}
