'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const pageTitle = pathname === '/' ? 'Home' : pathname.split('/')[1];
    const capitalizedTitle = pageTitle ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1) : 'Overview';

    return (
        <header className="sticky top-0 z-40 ios-blur px-4 lg:px-10 py-4 lg:py-6 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-gray-100/50">
            <div className="flex flex-col">
                <h1 className="text-xl lg:text-3xl font-black text-[#1a1a1a] leading-tight">{capitalizedTitle}</h1>
                <p className="hidden lg:block text-[#6c757d] text-xs mt-0.5 font-medium tracking-wide">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
                <button className="w-10 h-10 lg:w-11 lg:h-11 bg-white/50 rounded-2xl flex items-center justify-center text-[#6c757d] active:scale-90 transition-transform">
                    <Search size={18} />
                </button>
                <button className="w-10 h-10 lg:w-11 lg:h-11 bg-white/50 rounded-2xl flex items-center justify-center text-[#6c757d] active:scale-90 transition-transform relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="lg:hidden w-10 h-10 bg-[#107d92]/10 text-[#107d92] rounded-2xl flex items-center justify-center">
                    <User size={18} />
                </div>
            </div>
        </header>
    );
}
