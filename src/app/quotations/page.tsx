'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import QuotationWizard from '@/components/QuotationWizard';
import DocumentViewer from '@/components/DocumentViewer';

export default function QuotationsPage() {
    const searchParams = useSearchParams();
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardData, setWizardData] = useState<any>(null);
    const [viewItem, setViewItem] = useState<any>(null);

    // Automatically open wizard if redirected from Splash with action=new
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            setIsWizardOpen(true);
        }
    }, [searchParams]);

    const columns = [
        { key: 'quoteNumber', label: 'Quotation ID' },
        { key: 'clientName', label: 'Client' },
        { key: 'clientCompany', label: 'Business' },
        { key: 'date', label: 'Date', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString('en-GB') : 'N/A' },
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

    const closeWizard = (newDoc?: any) => {
        setIsWizardOpen(false);
        setWizardData(null);
        // If a document was just created, open the viewer immediately
        if (newDoc) {
            setViewItem(newDoc);
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#1a1a1a]">Quotations</h1>
                    <p className="text-[#6c757d] text-sm font-medium mt-1">Manage proposals and closing</p>
                </div>
                <button
                    onClick={handleNew}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#107d92] text-white px-8 py-4 rounded-[20px] font-black shadow-lg shadow-[#107d92]/20 active:scale-95 transition-all text-sm"
                >
                    <Plus size={18} />
                    <span>New Quote</span>
                </button>
            </div>

            <DataTable
                collectionName="quotations"
                columns={columns}
                onClone={handleClone}
                onView={(item) => setViewItem(item)}
                pdfType="QUOTATION"
            />

            <QuotationWizard
                isOpen={isWizardOpen}
                onClose={closeWizard}
                initialData={wizardData}
            />

            <DocumentViewer
                isOpen={!!viewItem}
                onClose={() => setViewItem(null)}
                type="QUOTATION"
                data={viewItem}
            />
        </div>
    );
}
