'use client';

import DataTable from '@/components/DataTable';

export default function StatementsPage() {
    const columns = [
        { key: 'statementId', label: 'ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'period', label: 'Period' },
        { key: 'openingBalance', label: 'Opening', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'closingBalance', label: 'Closing', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'date', label: 'Generated', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Client Statements</h1>
                    <p className="text-[#6c757d] text-sm mt-1">Detailed transaction history for your clients</p>
                </div>
            </div>
            <DataTable collectionName="statements" columns={columns} pdfType="STATEMENT" />
        </div>
    );
}
