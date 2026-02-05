'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, Plus } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const pageTitle = pathname === '/' ? 'Home' : pathname.split('/')[1];
    const capitalizedTitle = pageTitle ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1) : 'Overview';

    return (
        <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-transparent">
            <div>
                <h1 className="text-3xl font-bold text-[#1a1a1a]">{capitalizedTitle}</h1>
                <p className="text-[#6c757d] text-sm mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-3">
                <button className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#6c757d] hover:bg-gray-50 transition-colors">
                    <Search size={20} />
                </button>
                <button className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#6c757d] hover:bg-gray-50 transition-colors">
                    <Bell size={20} />
                </button>
                <button className="h-11 px-6 bg-[#107d92] text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] transition-transform">
                    <Plus size={20} />
                    <span>New</span>
                </button>
            </div>
        </header>
    );
}
