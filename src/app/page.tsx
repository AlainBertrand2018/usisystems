'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // For now, redirect to dashboard. Later we can add a login check.
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center animate-pulse">
                <img src="/images/unideal_logo.webp" alt="Loading..." className="w-48 mb-4 mx-auto" />
                <p className="text-[#6c757d] font-medium">Initializing UniDeals CRM...</p>
            </div>
        </div>
    );
}
