'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    FileText,
    FileCheck,
    Receipt,
    PieChart,
    UserCog,
    Calendar,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: FileCheck },
    { name: 'Receipts', href: '/receipts', icon: Receipt },
    { name: 'Statements', href: '/statements', icon: PieChart },
    { name: 'Users', href: '/users', icon: UserCog },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <nav className="w-72 bg-white border-right border-[#eef2f3] h-screen sticky top-0 hidden lg:flex flex-col p-6">
            <div className="mb-10 px-2">
                <img src="/images/unideal_logo.webp" alt="UniDeals Logo" className="w-32" />
            </div>

            <ul className="flex-1 space-y-1">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <li key={link.name}>
                            <Link
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${isActive
                                    ? 'bg-[#107d92]/10 color-[#107d92]'
                                    : 'text-[#6c757d] hover:bg-[#107d92]/5 hover:text-[#107d92]'
                                    }`}
                                style={{ color: isActive ? '#107d92' : undefined }}
                            >
                                <Icon size={20} />
                                <span>{link.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto pt-6 border-t border-[#f0f0f0]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-[#107d92] text-white rounded-xl flex items-center justify-center font-bold shrink-0 uppercase">
                            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.displayName || 'User'}</p>
                            <p className="text-xs text-[#6c757d] capitalize">{user?.role?.replace('_', ' ') || 'Member'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-[#6c757d] hover:text-rose-500 transition-colors ml-2"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
