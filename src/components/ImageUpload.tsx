'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Camera, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    currentUrl?: string;
    path: string;
    label?: string;
}

export default function ImageUpload({ onUploadComplete, currentUrl, path, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || '');

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
            <p className="text-[9px] text-gray-400 font-bold px-1 italic">Click to upload photo (PNG/JPG)</p>
        </div>
    );
}
