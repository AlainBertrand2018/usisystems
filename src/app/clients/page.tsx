'use client';

import DataTable from '@/components/DataTable';

export default function ClientsPage() {
    const columns = [
        { key: 'name', label: 'Client Name' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700`}>
                    {val || 'Active'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Client Directory</h2>
            </div>
            <DataTable collectionName="clients" columns={columns} />
        </div>
    );
}
