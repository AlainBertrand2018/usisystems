'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    Calendar,
    Settings,
    UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Inventory', href: '/products', icon: Package },
    { name: 'Staff', href: '/users', icon: UserCircle },
    { name: 'Schedule', href: '/appointments', icon: Calendar },
];

const MobileNav = memo(() => {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-2 pt-3 pb-8 safe-bottom shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1.5 min-w-[64px] relative">
                            <div className={`transition-all duration-300 ${isActive ? 'text-[#107d92] scale-110' : 'text-gray-400'}`}>
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-tight transition-colors duration-300 ${isActive ? 'text-[#107d92]' : 'text-gray-400'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute -bottom-2 w-1 h-1 bg-[#107d92] rounded-full"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
});

export default MobileNav;
