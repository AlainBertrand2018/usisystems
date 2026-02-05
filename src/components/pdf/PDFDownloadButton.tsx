'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StandardPDF } from './StandardPDF';
import { FileDown, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface PDFDownloadButtonProps {
    type: string;
    data: any;
    fileName?: string;
    showLabel?: boolean;
}

export default function PDFDownloadButton({ type, data, fileName, showLabel = false }: PDFDownloadButtonProps) {
    const [isClient, setIsClient] = useState(false);
    const [businessInfo, setBusinessInfo] = useState<any>({
        name: 'UNIDEALS Ltd',
        address: 'Mauritius',
        brn: 'C12345678'
    });

    useEffect(() => {
        setIsClient(true);
        const unsub = onSnapshot(collection(db, 'business_details'), (snapshot) => {
            if (!snapshot.empty) {
                setBusinessInfo(snapshot.docs[0].data());
            }
        });
        return () => unsub();
    }, []);

    if (!isClient || !data) return null;

    return (
        <PDFDownloadLink
            document={<StandardPDF type={type} data={data} businessInfo={businessInfo} />}
            fileName={fileName || `${type}_${data.quoteNumber || data.invoiceNumber || data.receiptNumber || data.id}.pdf`}
            className={`flex items-center justify-center gap-2 rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 ${showLabel
                    ? 'bg-[#107d92] text-white px-6 py-2.5 text-xs shadow-lg shadow-[#107d92]/20'
                    : 'bg-gray-100 text-[#6c757d] p-2 hover:bg-[#107d92]/10 hover:text-[#107d92]'
                }`}
        >
            {({ loading }: { loading: boolean }) =>
                loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <>
                        <FileDown size={16} />
                        {showLabel && <span>PDF</span>}
                    </>
                )
            }
        </PDFDownloadLink>
    );
}
