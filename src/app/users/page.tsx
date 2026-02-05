'use client';

import DataTable from '@/components/DataTable';

export default function UsersPage() {
    const columns = [
        { key: 'displayName', label: 'Full Name' },
        { key: 'email', label: 'Email Address' },
        { key: 'role', label: 'System Role' },
        { key: 'createdAt', label: 'Created On', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleDateString() : 'N/A' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">User Management</h2>
            </div>
            <DataTable collectionName="users" columns={columns} />
        </div>
    );
}
