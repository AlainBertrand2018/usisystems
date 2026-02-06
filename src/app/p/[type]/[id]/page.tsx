'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DocumentViewer from '@/components/DocumentViewer';

export default function PublicDocumentPage() {
    const params = useParams();
    const [docData, setDocData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const type = params.type as string;
    const id = params.id as string;

    const collectionMap: any = {
        'quotation': 'quotations',
        'invoice': 'invoices',
        'receipt': 'receipts',
        'statement': 'statements'
    };

    useEffect(() => {
        const fetchDoc = async () => {
            if (!id || !type) return;

            try {
                const targetCollection = collectionMap[type.toLowerCase()];
                if (!targetCollection) {
                    setError("Invalid document type.");
                    setLoading(false);
                    return;
                }

                const docRef = doc(db, targetCollection, id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDocData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Document not found.");
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [id, type]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7f8]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#107d92]"></div>
            </div>
        );
    }

    if (error || !docData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f8] p-6 text-center">
                <div className="bg-white p-10 rounded-[32px] shadow-xl max-w-md w-full">
                    <h1 className="text-2xl font-black text-rose-500 mb-2">Oops!</h1>
                    <p className="text-gray-600 font-medium">{error || "This document is no longer available."}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-8 py-3 bg-[#107d92] text-white rounded-2xl font-black transition-all active:scale-95"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f7f8]">
            <DocumentViewer
                isOpen={true}
                onClose={() => { }} // No close action on public page
                type={type.toUpperCase() as any}
                data={docData}
                isAdmin={false}
            />
        </div>
    );
}
