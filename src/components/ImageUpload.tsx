'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, Loader2, X, Link2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
    path: string;
    label?: string;
}

export default function ImageUpload({ onUploadComplete, currentUrl, path, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || '');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    console.error("Upload error:", error);
                    alert("Upload failed.");
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onUploadComplete(downloadURL);
                    setPreview(downloadURL);
                    setUploading(false);
                }
            );
        } catch (error) {
            console.error("Upload process error:", error);
            setUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (!urlValue.trim()) return;
        setPreview(urlValue);
        onUploadComplete(urlValue);
        setShowUrlInput(false);
        setUrlValue('');
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-[10px] font-black text-[#6c757d] uppercase px-1">{label}</label>}
            <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#107d92]/30">
                    {preview ? (
                        <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={24} className="text-gray-300" />
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                {preview && !uploading && (
                    <button
                        type="button"
                        onClick={() => { setPreview(''); onUploadComplete(''); }}
                        className="absolute -top-2 -right-2 p-1 bg-white shadow-md rounded-full text-rose-500 scale-0 group-hover:scale-100 transition-all"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-1">
                    <p className="text-[9px] text-gray-400 font-bold italic">Click square to upload (PNG/JPG)</p>
                    <span className="text-[9px] text-gray-200">|</span>
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[9px] text-[#107d92] font-black uppercase tracking-widest hover:text-[#0a4d5a] transition-colors"
                    >
                        {showUrlInput ? 'Cancel' : 'Add from URL'}
                    </button>
                </div>

                <AnimatePresence>
                    {showUrlInput && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100"
                        >
                            <Link2 size={14} className="text-gray-400 ml-1" />
                            <input
                                type="url"
                                value={urlValue}
                                onChange={(e) => setUrlValue(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold text-gray-700 placeholder:text-gray-300"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
                            />
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="bg-[#107d92] text-white p-1.5 rounded-lg hover:bg-[#0a4d5a] transition-all"
                            >
                                <Check size={12} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
