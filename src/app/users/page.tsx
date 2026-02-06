'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import UserModal from '@/components/UserModal';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const columns = [
        {
            key: 'displayName',
            label: 'User Info',
            format: (val: string, row: any) => (
                <div
                    onClick={() => router.push(`/users/${row.id}`)}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-[#107d92] transition-colors">
                        {row.photoURL ? (
                            <img src={row.photoURL} alt={val} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#107d92] font-black uppercase text-xs">
                                {val?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-[#1a1a1a] group-hover:text-[#107d92] transition-colors">{val}</p>
                        <p className="text-[10px] text-[#6c757d] font-medium">{row.email}</p>
                    </div>
                </div>
            )
        },
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
