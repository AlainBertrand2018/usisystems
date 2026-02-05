'use client';

import DataTable from '@/components/DataTable';

export default function InvoicesPage() {
    const columns = [
        { key: 'invoiceNumber', label: 'Invoice ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
        { key: 'total', label: 'Amount', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${val === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {val || 'Pending'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Sales Invoices</h2>
            </div>
            <DataTable collectionName="invoices" columns={columns} />
        </div>
    );
}
