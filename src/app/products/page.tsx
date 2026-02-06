'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/DataTable';
import ProductModal from '@/components/ProductModal';
import { Plus, Package } from 'lucide-react';

export default function ProductsPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    const columns = [
        {
            key: 'imageUrl',
            label: 'Image',
            format: (val: string) => val ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                    <img src={val} alt="Product" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                    <Package size={16} />
                </div>
            )
        },
        {
            key: 'name',
            label: 'Product Name',
            format: (val: string, row: any) => (
                <button
                    onClick={() => router.push(`/products/${row.id}`)}
                    className="text-left group"
                >
                    <p className="font-bold text-[#1a1a1a] group-hover:text-[#107d92] transition-colors">{val}</p>
                    <p className="text-[10px] text-[#6c757d] font-medium">{row.sku || 'No SKU'}</p>
                </button>
            )
        },
        {
            key: 'category',
            label: 'Category',
            format: (val: string) => (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase">
                    {val || 'Uncategorized'}
                </span>
            )
        },
        { key: 'price', label: 'Base Price', format: (val: any) => <span className="font-black text-[#107d92]">MUR {parseFloat(val || 0).toLocaleString()}</span> },
        {
            key: 'stock',
            label: 'Inventory',
            format: (val: any) => (
                <span className={`font-bold ${parseFloat(val) < 10 ? 'text-rose-500' : 'text-[#1a1a1a]'}`}>
                    {val || '∞'}
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a]">Product Inventory</h2>
                    <p className="text-xs text-[#6c757d] font-bold">Manage your services and priced items</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#107d92] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#107d92]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={16} />
                    New Product
                </button>
            </div>

            <DataTable collectionName="business_products" columns={columns} defaultOrderBy="createdAt" />

            <ProductModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
