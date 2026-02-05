'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import QuotationWizard from '@/components/QuotationWizard';
import { Plus } from 'lucide-react';

export default function QuotationsPage() {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState<any>(null);

    const columns = [
        { key: 'quoteNumber', label: 'Quotation ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'clientCompany', label: 'Business' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
        { key: 'total', label: 'Value', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        {
            key: 'status',
            label: 'Status',
            format: (val: string) => {
                const colors: any = {
                    'Won': 'bg-emerald-100 text-emerald-700',
                    'Sent': 'bg-blue-100 text-blue-700',
                    'Rejected': 'bg-rose-100 text-rose-700',
                    'Lost': 'bg-gray-100 text-gray-700'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[val] || 'bg-amber-100 text-amber-700'}`}>
                        {val || 'To send'}
                    </span>
                );
            }
        },
    ];

    const handleNew = () => {
        setWizardData(null);
        setIsWizardOpen(true);
    };

    const handleClone = (item: any) => {
        setWizardData(item);
        setIsWizardOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Quotations</h1>
                    <p className="text-[#6c757d] text-sm mt-1">Generate and track your business proposals</p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 bg-[#107d92] text-white px-8 py-3.5 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#107d92]/20"
                >
                    <Plus size={20} />
                    <span>New Quote</span>
                </button>
            </div>

            <DataTable
                collectionName="quotations"
                columns={columns}
                onClone={handleClone}
                onDownload={(item) => alert(`Generating PDF for ${item.quoteNumber}...`)}
            />

            <QuotationWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                initialData={wizardData}
            />
        </div>
    );
}
