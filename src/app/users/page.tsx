import { useState } from 'react';
import DataTable from '@/components/DataTable';
import UserModal from '@/components/UserModal';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
    const [showModal, setShowModal] = useState(false);

    const columns = [
        { key: 'displayName', label: 'Full Name' },
        { key: 'email', label: 'Email Address' },
        {
            key: 'role', label: 'System Role', format: (val: string) => (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {val?.replace('_', ' ') || 'User'}
                </span>
            )
        },
        { key: 'createdAt', label: 'Created On', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a]">User Management</h2>
                    <p className="text-xs text-[#6c757d] font-bold">Control system access and permissions</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#107d92] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <UserPlus size={16} />
                    New User
                </button>
            </div>

            <DataTable collectionName="users" columns={columns} defaultOrderBy="createdAt" />

            <UserModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
