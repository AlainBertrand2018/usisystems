import { useState } from 'react';
import DataTable from '@/components/DataTable';
import ClientModal from '@/components/ClientModal';
import { Plus } from 'lucide-react';

export default function ClientsPage() {
    const [showModal, setShowModal] = useState(false);

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
                <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a]">Client Directory</h2>
                    <p className="text-xs text-[#6c757d] font-bold">Manage your customer database</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#107d92] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={16} />
                    New Client
                </button>
            </div>

            <DataTable collectionName="clients" columns={columns} defaultOrderBy="createdAt" />

            <ClientModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
