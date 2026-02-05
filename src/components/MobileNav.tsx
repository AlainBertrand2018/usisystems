'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    PieChart,
    PlusCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/products', icon: Package },
    { name: 'Add', href: '#', icon: PlusCircle, isAction: true },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Quotes', href: '/quotations', icon: FileText },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="ios-blur border-t border-gray-100 flex justify-around items-center px-4 pt-3 pb-6 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <button key={item.name} className="flex flex-col items-center gap-1 group">
                                <div className="w-12 h-12 bg-[#107d92] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#107d92]/20 active:scale-90 transition-transform -mt-8 border-4 border-white">
                                    <Icon size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-[#107d92] mt-1">Actions</span>
                            </button>
                        );
                    }

                    return (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 relative">
                            <div className={`transition-colors duration-300 ${isActive ? 'text-[#107d92]' : 'text-gray-400'}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-[#107d92]' : 'text-gray-400'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 bg-[#107d92] rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
