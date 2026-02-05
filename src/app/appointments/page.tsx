'use client';

import DataTable from '@/components/DataTable';

export default function AppointmentsPage() {
    const columns = [
        { key: 'title', label: 'Appointment' },
        { key: 'clientName', label: 'Client' },
        { key: 'date', label: 'Scheduled', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleString() : 'N/A' },
        { key: 'location', label: 'Location' },
        { key: 'description', label: 'Notes' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Business Appointments</h2>
            </div>
            <DataTable collectionName="appointments" columns={columns} />
        </div>
    );
}
