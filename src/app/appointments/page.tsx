import { useState } from 'react';
import DataTable from '@/components/DataTable';
import AppointmentModal from '@/components/AppointmentModal';
import { Plus } from 'lucide-react';

export default function AppointmentsPage() {
    const [showModal, setShowModal] = useState(false);

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
                <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a]">Business Appointments</h2>
                    <p className="text-xs text-[#6c757d] font-bold">Manage your schedule and meetings</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#107d92] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={16} />
                    New Appointment
                </button>
            </div>

            <DataTable collectionName="appointments" columns={columns} />

            <AppointmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
