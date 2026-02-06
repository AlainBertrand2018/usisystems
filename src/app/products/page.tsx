'use client';

import { useState } from 'react';
import DataTable from '@/components/DataTable';
import ProductModal from '@/components/ProductModal';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
    const [showModal, setShowModal] = useState(false);

    const columns = [
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Base Price', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'description', label: 'Description' },
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
