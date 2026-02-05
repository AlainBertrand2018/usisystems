'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import { motion, AnimatePresence } from 'framer-motion';

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

        if (!auth && !isSplashPage) {
            router.replace('/');
        }
    }, [pathname, router, isSplashPage]);

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
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#f4f7f8] overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen max-w-full relative pb-20 lg:pb-0">
                <Header />

                <div className="flex-1 relative overflow-x-hidden overflow-y-auto custom-scrollbar px-4 pt-4 lg:p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                duration: 0.3
                            }}
                            className="w-full h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <MobileNav />
            </main>
        </div>
    );
}
