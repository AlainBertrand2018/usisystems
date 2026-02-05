'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Edit2, FileDown, AlertCircle, Copy, FileCheck, Eye } from 'lucide-react';
import PDFDownloadButton from './pdf/PDFDownloadButton';

interface DataTableProps {
    collectionName: string;
    columns: { key: string; label: string; format?: (val: any) => React.ReactNode }[];
    onEdit?: (item: any) => void;
    onClone?: (item: any) => void;
    onDownload?: (item: any) => void;
    onConvert?: (item: any) => void;
    onView?: (item: any) => void;
    pdfType?: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
}

export default function DataTable({
    collectionName,
    columns,
    onEdit,
    onClone,
    onDownload,
    onConvert,
    onView,
    pdfType
}: DataTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        const q = query(collection(db, collectionName));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setData(items);
            setLoading(false);
        }, (err) => {
            console.error(`Firestore error in ${collectionName}:`, err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionName]);

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] p-10 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#107d92]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-[24px] p-10 flex flex-col items-center justify-center text-rose-500 gap-3 border border-rose-50">
                <AlertCircle size={32} />
                <p className="font-medium">{error}</p>
                <p className="text-xs text-gray-400">Collection: {collectionName}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {columns.map((col) => (
                                <th key={col.key} className="pb-4 px-4 text-[10px] font-black text-[#6c757d] uppercase tracking-widest whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                            <th className="pb-4 px-4 text-[10px] font-black text-[#6c757d] uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                                {columns.map((col, index) => (
                                    <td key={col.key} className="py-5 px-4 text-sm font-bold text-[#1a1a1a]">
                                        {index === 0 && onView ? (
                                            <button
                                                onClick={() => onView(item)}
                                                className="text-[#107d92] hover:underline text-left font-black"
                                            >
                                                {col.format ? col.format(item[col.key]) : item[col.key]}
                                            </button>
                                        ) : (
                                            col.format ? col.format(item[col.key]) : item[col.key]
                                        )}
                                    </td>
                                ))}
                                <td className="py-5 px-4">
                                    <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        {onView && (
                                            <button onClick={() => onView(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all">
                                                <Eye size={16} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button onClick={() => onEdit(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {onClone && (
                                            <button onClick={() => onClone(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all">
                                                <Copy size={16} />
                                            </button>
                                        )}
                                        {onConvert && (
                                            <button
                                                onClick={() => onConvert(item)}
                                                className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-200 transition-all flex items-center gap-1.5"
                                            >
                                                <FileCheck size={14} /> Convert
                                            </button>
                                        )}
                                        {pdfType ? (
                                            <PDFDownloadButton type={pdfType} data={item} showLabel={false} />
                                        ) : onDownload && (
                                            <button onClick={() => onDownload(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all">
                                                <FileDown size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="py-20 text-center text-[#6c757d] font-bold text-sm">
                    No records found in {collectionName}.
                </div>
            )}
        </div>
    );
}
