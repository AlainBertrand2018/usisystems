'use client';

import DataTable from '@/components/DataTable';

export default function ReceiptsPage() {
    const columns = [
        { key: 'clientName', label: 'Client' },
        { key: 'invoiceNumber', label: 'Invoice Ref' },
        { key: 'paymentMode', label: 'Mode' },
        { key: 'paymentValue', label: 'Value', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'balanceDue', label: 'Balance Due', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('en-GB') : 'N/A' },
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
