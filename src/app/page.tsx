'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuotationWizard from '@/components/QuotationWizard';

export default function SplashPage() {
    const router = useRouter();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 pb-20 font-sans">
            {/* Logo Center */}
            <div className="flex flex-col items-center mb-20">
                <img
                    src="/images/unideal_logo.webp"
                    alt="UniDeals Logo"
                    className="w-56 lg:w-72"
                />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-5 w-full max-w-xs transition-all">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-[#107d92] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#107d92]/10 active:scale-95 transition-all"
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="w-full bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] py-5 rounded-[24px] font-black text-lg active:scale-95 transition-all"
                >
                    New Quotation
                </button>
            </div>

            {/* Quotation Wizard Modal */}
            <QuotationWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
            />

            <footer className="fixed bottom-10 text-center">
                <p className="text-[10px] font-black text-[#6c757d] uppercase tracking-[0.4em] opacity-30">
                    &copy; 2026 UNIDEALS MAURITIUS
                </p>
            </footer>
        </div>
    );
}
