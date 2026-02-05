'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { StandardPDF } from './StandardPDF';
import { FileDown, Loader2 } from 'lucide-react';

interface PDFDownloadButtonProps {
    type: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    data: any;
    fileName?: string;
}

export default function PDFDownloadButton({ type, data, fileName }: PDFDownloadButtonProps) {
    const [isClient, setIsClient] = useState(false);

    // Hardcoded for now - in production we fetch from Firestore 'businessdetails'
    const businessInfo = {
        name: 'UniDeals (Mauritius)',
        tagline: 'Advanced Agentic CRM Solutions',
        address: 'Ebène Cybercity, Mauritius',
        phone: '+230 5XXX XXXX',
        email: 'contact@unideals.mu',
        website: 'www.unideals.mu',
        brn: 'C123456789'
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <PDFDownloadLink
            document={<StandardPDF type={type} data={data} businessInfo={businessInfo} />}
            fileName={fileName || `${type}_${data.quoteNumber || data.id}.pdf`}
            className="flex items-center gap-2 bg-[#107d92]/10 text-[#107d92] px-4 py-2 rounded-xl font-bold hover:bg-[#107d92]/20 transition-all text-xs"
        >
            {({ blob, url, loading, error }: { blob: Blob | null, url: string | null, loading: boolean, error: any }) =>
                loading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Preparing...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <FileDown size={14} /> Download PDF
                    </span>
                )
            }
        </PDFDownloadLink>
    );
}
