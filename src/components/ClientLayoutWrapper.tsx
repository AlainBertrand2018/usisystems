'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    const isSplashPage = pathname === '/';

    useEffect(() => {
        const auth = localStorage.getItem('unideals_auth');
        setIsAuth(!!auth);

        // Systematic redirect: If not auth and trying to access dashboard routes
        if (!auth && !isSplashPage) {
            router.replace('/');
        }
    }, [pathname, router, isSplashPage]);

    // Don't render until we know the auth status on protected routes
    if (isAuth === null && !isSplashPage) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#107d92]"></div>
            </div>
        );
    }

    if (isSplashPage) {
        return <main className="min-h-screen bg-white">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-[#f4f7f8]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
                <Header />
                <div className="p-4 lg:p-10 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
