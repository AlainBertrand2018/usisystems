import './globals.css';
import { Outfit } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata = {
    title: 'UniDeals CRM',
    description: 'Premium CRM Solutions',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} font-sans`}>
                <div className="flex min-h-screen bg-[#f4f7f8]">
                    <Sidebar />
                    <main className="flex-1 flex flex-col min-h-screen">
                        <Header />
                        <div className="p-6 lg:p-10 overflow-y-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
