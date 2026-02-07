'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import AdminOnboardingModal from '@/components/AdminOnboardingModal';
import { Building2, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BusinessesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    // Security Gate: Only Super Admins see this page
    if (user?.role !== 'super_admin') {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <ShieldCheck size={48} className="text-rose-500" />
                <h1 className="text-2xl font-black text-[#1a1a1a]">RESTRICTED ACCESS</h1>
                <p className="text-gray-500 font-bold max-w-sm">This directory is reserved for Platform Super Administrators only.</p>
            </div>
        );
    }

    const renderBusinessCard = (biz: any) => (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/businesses/${biz.id}`)}
            className="w-full bg-white sm:p-8 p-3 rounded-[24px] sm:rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center text-center sm:space-y-6 space-y-2 hover:shadow-xl hover:shadow-[#107d92]/5 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <ExternalLink size={14} className="text-[#107d92]" />
            </div>

            {/* Logo/Icon Container - Mobile Squircle vs Desktop Card Icon */}
            <div className="sm:w-24 sm:h-24 w-18 h-18 rounded-[20px] sm:rounded-3xl bg-gray-50 flex items-center justify-center text-[#107d92] border-2 border-gray-100 group-hover:bg-[#107d92]/5 group-hover:border-[#107d92]/20 transition-all overflow-hidden relative shadow-sm">
                {biz.logoUrl ? (
                    <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-xl sm:text-xl font-black">{biz.name?.[0]}</span>
                        <Building2 size={24} className="sm:hidden mt-[-2px] opacity-20" />
                        <Building2 size={40} strokeWidth={1.5} className="hidden sm:block" />
                    </div>
                )}
            </div>

            <div className="space-y-1 sm:space-y-2 w-full">
                <h3 className="font-black text-[10px] sm:text-lg text-[#1a1a1a] leading-tight group-hover:text-[#107d92] transition-colors w-full px-0.5 break-words line-clamp-3 sm:line-clamp-none whitespace-normal sm:whitespace-nowrap sm:truncate">
                    {biz.name}
                </h3>
                <div className="flex flex-col gap-1 items-center hidden sm:flex">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6c757d]">BRN: {biz.brn || 'NOT LISTED'}</span>
                    <span className="text-[10px] font-bold text-[#107d92] opacity-60">{biz.sector || 'General Business'}</span>
                </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] hidden sm:block ${biz.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                System {biz.status}
            </div>
        </motion.button>
    );

    return (
        <div className="space-y-10 pb-20">
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-black text-[#1a1a1a]">Tenant Ecosystem</h2>
                    <p className="text-sm text-[#6c757d] font-bold mt-1 italic opacity-70">Unified Directory of onboarded Corporate Entities</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 bg-[#107d92] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#107d92]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} />
                    Onboard Entity
                </button>
            </div>

            <DataTable
                collectionName="businesses"
                columns={[]} // Not needed for grid mode
                defaultOrderBy="createdAt"
                viewMode="grid"
                renderGrid={renderBusinessCard}
            />

            <AdminOnboardingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
