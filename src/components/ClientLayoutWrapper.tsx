'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import MobileDrawer from '@/components/MobileDrawer';
import { useAuth } from '@/context/AuthContext';

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isSplashPage = pathname === '/';
    const isPublicPage = pathname?.startsWith('/p/');

    const handleOpenMenu = useCallback(() => setIsMobileMenuOpen(true), []);
    const handleCloseMenu = useCallback(() => setIsMobileMenuOpen(false), []);

    useEffect(() => {
        if (!loading && !user && !isSplashPage && !isPublicPage) {
            router.replace('/');
        }
    }, [pathname, router, isSplashPage, isPublicPage, user, loading]);

    // Don't render until we know the auth status on protected routes
    if ((loading || !user) && !isSplashPage && !isPublicPage) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#107d92]"></div>
            </div>
        );
    }

    if (isSplashPage || isPublicPage) {
        return <main className="min-h-screen bg-white">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-[#f4f7f8]">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
                <Header onMenuClick={handleOpenMenu} />
                <div className="p-4 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <MobileNav />
                <MobileDrawer
                    isOpen={isMobileMenuOpen}
                    onClose={handleCloseMenu}
                />
            </main>
        </div>
    );
}
