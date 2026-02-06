'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Package, Tag, Plus, Trash2, Loader2, IndianRupee } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import ImageUpload from './ImageUpload';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Addon {
    name: string;
    price: number;
}

export default function ProductModal({ isOpen, onClose }: ProductModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        imageUrl: ''
    });
    const [addons, setAddons] = useState<Addon[]>([]);

    if (!isOpen) return null;

    const handleAddAddon = () => {
        setAddons([...addons, { name: '', price: 0 }]);
    };

    const handleRemoveAddon = (index: number) => {
        setAddons(addons.filter((_, i) => i !== index));
    };

    const handleAddonUpdate = (index: number, field: keyof Addon, value: string | number) => {
        const newAddons = [...addons];
        newAddons[index] = { ...newAddons[index], [field]: value };
        setAddons(newAddons);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'business_products'), {
                ...formData,
                price: parseFloat(formData.price),
                addons,
                createdAt: serverTimestamp()
            });
            alert('Product added successfully!');
            onClose();
            setFormData({ name: '', category: '', price: '', description: '', imageUrl: '' });
            setAddons([]);
        } catch (error) {
            console.error("Error adding product:", error);
            alert('Failed to add product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-2xl font-black text-[#1a1a1a]">Register New Product</h2>
                            <p className="text-[#6c757d] text-sm font-bold mt-1">Add items to your inventory</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                        <div className="flex flex-col items-center pb-4 border-b border-gray-50">
                            <ImageUpload
                                path="products-photos"
                                currentUrl={formData.imageUrl}
                                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                                label="Product Image"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Product Name</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="Service or Item Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2 sm:col-span-1">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="e.g. Services, Infrastructure"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2 sm:col-span-1">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Base Price (MUR)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xs">MUR</div>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-14 pr-5 py-4 outline-none font-bold text-sm transition-all shadow-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl px-5 py-4 outline-none font-bold text-sm transition-all shadow-sm min-h-[80px]"
                                    placeholder="Brief product details..."
                                />
                            </div>
                        </div>

                        {/* Add-ons Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-[#6c757d] uppercase">Priced Add-ons & Options</label>
                                <button
                                    type="button"
                                    onClick={handleAddAddon}
                                    className="flex items-center gap-1.5 text-[#107d92] text-xs font-black uppercase tracking-widest hover:bg-[#107d92]/5 px-3 py-1.5 rounded-xl transition-all"
                                >
                                    <Plus size={14} /> Add Option
                                </button>
                            </div>

                            <div className="space-y-3">
                                {addons.map((addon, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={index}
                                        className="grid grid-cols-12 gap-3 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100"
                                    >
                                        <div className="col-span-7">
                                            <input
                                                type="text"
                                                placeholder="Option Name"
                                                value={addon.name}
                                                onChange={(e) => handleAddonUpdate(index, 'name', e.target.value)}
                                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 outline-none font-bold text-xs"
                                            />
                                        </div>
                                        <div className="col-span-4 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">MUR</div>
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={addon.price}
                                                onChange={(e) => handleAddonUpdate(index, 'price', parseFloat(e.target.value))}
                                                className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-3 outline-none font-bold text-xs"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAddon(index)}
                                                className="text-rose-400 hover:text-rose-600 p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {addons.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-[30px] text-gray-300 text-xs font-bold uppercase tracking-widest">
                                        No specific options added
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#107d92] text-white rounded-3xl py-5 font-black text-lg shadow-xl shadow-[#107d92]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />}
                            <span>Save to Inventory</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
