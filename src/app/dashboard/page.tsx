'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FileText, UserPlus, Package, Calendar, TrendingUp, HandCoins, Receipt, Plus, ArrowRight, Shield } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AdminOnboardingModal from '@/components/AdminOnboardingModal';

export default function DashboardPage() {
    const { user } = useAuth();
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [rawStats, setRawStats] = useState({
        quotes: [] as any[],
        clients: 0,
        products: [] as any[],
        invoices: [] as any[],
        receipts: [] as any[],
        appointments: 0
    });

    useEffect(() => {
        const unsubQuotes = onSnapshot(collection(db, 'quotations'), (s) => {
            setRawStats(prev => ({ ...prev, quotes: s.docs.map(d => d.data()) }));
        });
        const unsubClients = onSnapshot(collection(db, 'clients'), (s) => {
            setRawStats(prev => ({ ...prev, clients: s.size }));
        });
        const unsubProducts = onSnapshot(collection(db, 'business_products'), (s) => {
            setRawStats(prev => ({ ...prev, products: s.docs.map(d => d.data()) }));
        });
        const unsubInvoices = onSnapshot(collection(db, 'invoices'), (s) => {
            setRawStats(prev => ({ ...prev, invoices: s.docs.map(d => d.data()) }));
        });
        const unsubReceipts = onSnapshot(collection(db, 'receipts'), (s) => {
            setRawStats(prev => ({ ...prev, receipts: s.docs.map(d => d.data()) }));
        });
        const unsubApps = onSnapshot(collection(db, 'appointments'), (s) => {
            setRawStats(prev => ({ ...prev, appointments: s.size }));
        });

        return () => {
            unsubQuotes();
            unsubClients();
            unsubProducts();
            unsubInvoices();
            unsubReceipts();
            unsubApps();
        };
    }, []);

    const calcStats = useMemo(() => {
        const revenue = rawStats.invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const unpaidSales = rawStats.invoices
            .filter(inv => inv.status !== 'paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const activeQuoteValue = rawStats.quotes
            .reduce((sum, q) => sum + (q.total || 0), 0);

        const paymentsReceived = rawStats.receipts
            .reduce((sum, r) => sum + (r.amountPaid || 0), 0);

        return {
            revenue,
            expected: unpaidSales + activeQuoteValue,
            paymentsReceived,
            quoteCount: rawStats.quotes.length,
            clientCount: rawStats.clients,
            productCount: rawStats.products.length,
            appointmentCount: rawStats.appointments
        };
    }, [rawStats]);

    const stats = [
        { label: 'Total Revenue', value: `MUR ${calcStats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Expected Sales', value: `MUR ${calcStats.expected.toLocaleString()}`, icon: HandCoins, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Payments Received', value: `MUR ${calcStats.paymentsReceived.toLocaleString()}`, icon: Receipt, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Active Quotations', value: calcStats.quoteCount.toString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Clients', value: calcStats.clientCount.toString(), icon: UserPlus, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Product Catalog', value: calcStats.productCount.toString(), icon: Package, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    const quickActions = [
        { name: 'New Quotation', href: '/quotations', icon: Plus, color: 'bg-[#107d92] text-white' },
        { name: 'Add Client', href: '/clients', icon: UserPlus, color: 'bg-white text-[#107d92] border border-[#107d92]/20' },
        { name: 'Schedule', href: '/appointments', icon: Calendar, color: 'bg-white text-[#107d92] border border-[#107d92]/20' },
    ];

    return (
        <div className="space-y-6 lg:space-y-10 pb-10">
            {/* Header with Quick Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#1a1a1a]">Overview</h1>
                    <p className="text-[#6c757d] text-sm font-medium">Real-time performance</p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {user?.role === 'super_admin' && (
                        <button
                            onClick={() => setIsOnboardingOpen(true)}
                            className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 lg:px-6 lg:py-3 rounded-[20px] font-black text-sm lg:font-semibold transition-all active:scale-95 shadow-sm bg-black text-white"
                        >
                            <Shield size={18} />
                            <span>Onboard Business</span>
                        </button>
                    )}
                    {quickActions.map((action) => (
                        <Link key={action.name} href={action.href} className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 lg:px-6 lg:py-3 rounded-[20px] font-black text-sm lg:font-semibold transition-all active:scale-95 shadow-sm ${action.color}`}>
                            <action.icon size={18} />
                            <span className="lg:block">{action.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <AdminOnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 lg:p-7 rounded-[32px] shadow-sm border border-gray-100/50 flex justify-between items-center transition-all active:bg-gray-50 lg:hover:shadow-xl lg:hover:shadow-gray-200/50 lg:hover:-translate-y-1 group">
                        <div className="flex-1 min-w-0">
                            <p className="text-[#6c757d] text-[10px] lg:text-sm font-black uppercase tracking-[0.15em] mb-1 truncate">{stat.label}</p>
                            <h3 className="text-xl lg:text-3xl font-black text-[#1a1a1a] truncate">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 ${stat.bg} ${stat.color} rounded-[18px] lg:rounded-[22px] flex items-center justify-center transition-transform lg:group-hover:rotate-6 ml-4`}>
                            <stat.icon size={24} className="lg:hidden" />
                            <stat.icon size={32} className="hidden lg:block" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Sales & Quotes (2/3 width) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Recent Invoices */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Recent Invoices</h2>
                            <Link href="/invoices" className="text-[#107d92] font-bold text-sm flex items-center gap-1 hover:underline">
                                View Statement <ArrowRight size={16} />
                            </Link>
                        </div>
                        <DataTable collectionName="invoices" columns={[
                            { key: 'invoiceNumber', label: 'Reference' },
                            { key: 'clientName', label: 'Client' },
                            { key: 'total', label: 'Amount', format: (val: number) => `MUR ${val?.toLocaleString()}` },
                            {
                                key: 'status',
                                label: 'Status',
                                format: (val: string) => (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${val === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {val || 'Pending'}
                                    </span>
                                )
                            },
                        ]} />
                    </div>

                    {/* Pending Quotations */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Active Proposals</h2>
                            <Link href="/quotations" className="text-[#107d92] font-bold text-sm flex items-center gap-1 hover:underline">
                                Full Pipeline <ArrowRight size={16} />
                            </Link>
                        </div>
                        <DataTable collectionName="quotations" columns={[
                            { key: 'quoteNumber', label: 'Quote ID' },
                            { key: 'clientName', label: 'Client' },
                            { key: 'total', label: 'Value', format: (val: number) => `MUR ${val?.toLocaleString()}` },
                            {
                                key: 'status',
                                label: 'Status',
                                format: (val: string) => (
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${val === 'won' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {val || 'Sent'}
                                    </span>
                                )
                            },
                        ]} />
                    </div>
                </div>

                {/* Right Column - Appointments & Products (1/3 width) */}
                <div className="space-y-8">
                    {/* Upcoming Appointments */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Schedule</h2>
                        </div>
                        <DataTable
                            collectionName="appointments"
                            columns={[
                                { key: 'title', label: 'Title' },
                                { key: 'date', label: 'Time', format: (val: any) => val?.seconds ? new Date(val.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A' },
                            ]}
                        />
                    </div>

                    {/* Quick Inventory View */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Products</h2>
                        </div>
                        <DataTable
                            collectionName="business_products"
                            columns={[
                                { key: 'name', label: 'Service' },
                                { key: 'price', label: 'Rate', format: (val: number) => `MUR ${val?.toLocaleString()}` },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
