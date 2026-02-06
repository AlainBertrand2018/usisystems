'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Package, Tag, Banknote, FileText, BarChart3, Clock, AlertTriangle, Layers } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [productData, setProductData] = useState<any>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, 'business_products', id as string);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();

                    // Security Firewall: Admins can only view products from their own business
                    if (currentUser?.role !== 'super_admin' && data.businessId !== currentUser?.businessId) {
                        router.push('/dashboard');
                        return;
                    }

                    setProductData(data);
                } else {
                    router.push('/products');
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'business_products', id as string);
            await updateDoc(docRef, {
                ...productData,
                updatedAt: serverTimestamp()
            });
            alert("Product updated successfully!");
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#107d92]" size={32} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#6c757d] font-black text-[10px] uppercase tracking-widest hover:text-[#107d92] transition-colors">
                    <ArrowLeft size={16} /> Back to Inventory
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#107d92] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-[#107d92]/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Product Context Header */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center">
                <ImageUpload
                    path="products-photos"
                    currentUrl={productData.imageUrl}
                    onUploadComplete={(url) => setProductData({ ...productData, imageUrl: url })}
                />
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h1 className="text-3xl font-black text-[#1a1a1a]">{productData.name}</h1>
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {productData.category || 'Uncategorized'}
                        </span>
                    </div>
                    <p className="text-[#6c757d] font-bold text-sm mt-1">{productData.sku || 'No SKU Assigned'}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#6c757d] uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-xl">
                            <Banknote size={14} className="text-[#107d92]" />
                            MUR {parseFloat(productData.price || 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#6c757d] uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-xl">
                            <Layers size={14} className="text-blue-500" />
                            {productData.stock || '∞'} In Stock
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 space-y-10">
                        {/* Section 1: Product Definition */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Tag size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Product Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Display Name</label>
                                    <input value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Category / Group</label>
                                    <input value={productData.category || ''} onChange={e => setProductData({ ...productData, category: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Stock Keeping Unit (SKU)</label>
                                    <input value={productData.sku || ''} onChange={e => setProductData({ ...productData, sku: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-xs" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Financials */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <Banknote size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Pricing & Value</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Selling Price (MUR)</label>
                                    <input type="number" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-black text-lg" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Cost Price (MUR)</label>
                                    <input type="number" value={productData.cost || ''} onChange={e => setProductData({ ...productData, cost: e.target.value })} className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-transparent focus:border-[#107d92] outline-none font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Description */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                <FileText size={18} className="text-[#107d92]" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]">Public Description</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase px-1">Product Details / Specification</label>
                                <textarea rows={6} value={productData.description || ''} onChange={e => setProductData({ ...productData, description: e.target.value })} className="w-full bg-gray-50 p-6 rounded-[24px] border-2 border-transparent focus:border-[#107d92] outline-none font-bold text-sm resize-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Inventory Stats */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <BarChart3 size={16} className="text-[#107d92]" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">Sales Performance</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl text-center">
                                <p className="text-[10px] font-black text-[#6c757d] uppercase">Units Sold</p>
                                <p className="text-xl font-black text-[#1a1a1a] mt-1">248</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl text-center">
                                <p className="text-[10px] font-black text-[#6c757d] uppercase">Profit Margin</p>
                                <p className="text-xl font-black text-emerald-500 mt-1">32%</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-dashed border-gray-200 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-[10px] font-black text-[#6c757d] uppercase">Last Sale</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#1a1a1a]">2 hours ago</span>
                        </div>
                    </div>

                    {/* Low Stock Warning Mockup */}
                    {(productData.stock < 10) && (
                        <div className="bg-amber-50 rounded-[40px] border border-amber-100 p-8 flex items-start gap-4">
                            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <h4 className="text-xs font-black text-amber-900 uppercase">Critical Stock Level</h4>
                                <p className="text-[10px] font-bold text-amber-700 mt-1 leading-relaxed">
                                    Current inventory ({productData.stock}) is below the threshold. Consider restock soon.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-rose-50/30 rounded-[40px] border border-rose-100 p-8 space-y-4">
                        <button className="w-full py-4 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95">
                            Discontinue Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
