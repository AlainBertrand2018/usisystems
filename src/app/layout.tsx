import './globals.css';
import { Outfit } from 'next/font/google';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata = {
    title: 'UniDeals CRM',
    description: 'Premium CRM Solutions',
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} font-sans`}>
                <AuthProvider>
                    <ClientLayoutWrapper>
                        {children}
                    </ClientLayoutWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
