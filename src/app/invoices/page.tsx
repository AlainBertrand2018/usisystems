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
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${val === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {val || 'Pending'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Sales Invoices</h1>
                    <p className="text-[#6c757d] text-sm mt-1">Manage and bill your clients</p>
                </div>
            </div>
            <DataTable collectionName="invoices" columns={columns} pdfType="INVOICE" />
        </div>
    );
}
