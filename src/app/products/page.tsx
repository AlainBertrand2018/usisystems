'use client';

import DataTable from '@/components/DataTable';

export default function ProductsPage() {
    const columns = [
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Base Price', format: (val: number) => `MUR ${val?.toLocaleString()}` },
        { key: 'description', label: 'Description' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Product Inventory</h2>
            </div>
            <DataTable collectionName="business_products" columns={columns} />
        </div>
    );
}
