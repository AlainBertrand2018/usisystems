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
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Payment Receipts</h2>
            </div>
            <DataTable collectionName="receipts" columns={columns} />
        </div>
    );
}
