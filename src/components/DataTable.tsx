'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Edit2, FileDown, AlertCircle, Copy, Eye, Search, Mail, Loader2, Banknote, FileCheck, Landmark } from 'lucide-react';
import PDFDownloadButton from './pdf/PDFDownloadButton';

interface DataTableProps {
    collectionName: string;
    columns: { key: string; label: string; format?: (val: any) => React.ReactNode }[];
    onEdit?: (item: any) => void;
    onClone?: (item: any) => void;
    onDownload?: (item: any) => void;
    onSend?: (item: any) => void;
    onView?: (item: any) => void;
    onConvert?: (item: any) => void;
    onRegisterPayment?: (item: any) => void;
    onBanked?: (item: any) => void;
    pdfType?: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    defaultOrderBy?: string;
}

export default function DataTable({
    collectionName,
    columns,
    onEdit,
    onClone,
    onDownload,
    onSend,
    onView,
    onConvert,
    onRegisterPayment,
    onBanked,
    pdfType,
    defaultOrderBy = 'date'
}: DataTableProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingId, setSendingId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        let q;
        try {
            // Attempt to sort by defaultOrderBy (usually 'date') descending
            q = query(collection(db, collectionName), orderBy(defaultOrderBy, 'desc'));
        } catch (e) {
            q = query(collection(db, collectionName));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If the query worked but results are empty and it's because of sorting non-existent field,
            // we'll see it here. But Firestore usually just returns empty if the field is missing on ALL docs.
            setData(items);
            setLoading(false);
        }, (err) => {
            console.warn(`Firestore sort error in ${collectionName}, falling back to unsorted:`, err);
            // Fallback for missing index or missing field index
            const fallbackQ = query(collection(db, collectionName));
            onSnapshot(fallbackQ, (fallbackSnapshot) => {
                const fallbackItems = fallbackSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Manual sort if possible
                fallbackItems.sort((a: any, b: any) => {
                    const valA = a[defaultOrderBy]?.seconds || a[defaultOrderBy] || 0;
                    const valB = b[defaultOrderBy]?.seconds || b[defaultOrderBy] || 0;
                    if (valA > valB) return -1;
                    if (valA < valB) return 1;
                    return 0;
                });
                setData(fallbackItems);
                setLoading(false);
            }, (fallbackErr) => {
                setError(fallbackErr.message);
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, [collectionName, defaultOrderBy]);

    const handleSendAction = async (item: any) => {
        if (onSend) {
            onSend(item);
            return;
        }

        const email = item.clientEmail || item.email || item.businessEmail;
        if (!email) {
            alert("This client does not have an email address set.");
            return;
        }

        setSendingId(item.id);

        try {
            const response = await fetch('/api/send-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: item.id,
                    collectionName: collectionName,
                    type: pdfType || 'DOCUMENT',
                    clientEmail: email
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert(`SUCCESS: Document sent to ${email} via Resend.`);
            } else {
                throw new Error(result.error || 'Failed to send email');
            }
        } catch (error: any) {
            console.error("Email Error:", error);
            alert(`ERROR: ${error.message}`);
        } finally {
            setSendingId(null);
        }
    };

    const filteredData = data.filter((item) => {
        const searchStr = searchTerm.toLowerCase();
        if (!searchStr) return true;

        // Search in columns
        const inColumns = columns.some((col) => {
            const val = item[col.key];
            if (val === null || val === undefined) return false;
            return String(val).toLowerCase().includes(searchStr);
        });

        if (inColumns) return true;

        // Global search fields (common identifiers)
        const globalFields = [
            item.clientName,
            item.clientCompany,
            item.company,
            item.name,
            item.quoteNumber,
            item.invoiceNumber,
            item.receiptNumber,
            item.id
        ];

        return globalFields.some(field => field && String(field).toLowerCase().includes(searchStr));
    });

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
        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm space-y-6">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative group flex-1 max-w-md">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#107d92] transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search ${collectionName}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#107d92] focus:bg-white rounded-2xl pl-12 pr-4 py-3 outline-none transition-all font-bold text-sm shadow-sm"
                    />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#6c757d] opacity-50">
                    {filteredData.length} Records Found
                </div>
            </div>

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
                        {filteredData.map((item) => (
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
                                            <button onClick={() => onView(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all font-bold" title="View Full Details">
                                                <Eye size={16} />
                                            </button>
                                        )}

                                        {onRegisterPayment && item.status !== 'paid' && item.status !== 'unbanked' && (
                                            <button
                                                onClick={() => onRegisterPayment(item)}
                                                className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-200 transition-all flex items-center gap-1.5"
                                                title="Register Payment"
                                            >
                                                <Banknote size={14} /> Register Payment
                                            </button>
                                        )}

                                        {onBanked && (item.status === 'unbanked' || item.status === 'Unbanked') && (
                                            <button
                                                onClick={() => onBanked(item)}
                                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-blue-200 transition-all flex items-center gap-1.5"
                                                title="Confirm Banking"
                                            >
                                                <Landmark size={14} /> Banked
                                            </button>
                                        )}

                                        {onConvert && (
                                            <button
                                                onClick={() => onConvert(item)}
                                                className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-amber-200 transition-all flex items-center gap-1.5"
                                                title="Convert"
                                            >
                                                <FileCheck size={14} /> Convert
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleSendAction(item)}
                                            disabled={sendingId === item.id}
                                            className="p-2 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center min-w-[36px]"
                                            title="Send via Email"
                                        >
                                            {sendingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                        </button>

                                        {onEdit && (
                                            <button onClick={() => onEdit(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all" title="Edit Record">
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {onClone && (
                                            <button onClick={() => onClone(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all" title="Clone Duplicate">
                                                <Copy size={16} />
                                            </button>
                                        )}
                                        {pdfType ? (
                                            <PDFDownloadButton type={pdfType} data={item} showLabel={false} />
                                        ) : onDownload && (
                                            <button onClick={() => onDownload(item)} className="p-2 bg-gray-100 rounded-xl text-[#6c757d] hover:text-[#107d92] hover:bg-[#107d92]/10 transition-all" title="Download PDF">
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
            {filteredData.length === 0 && (
                <div className="py-20 text-center text-[#6c757d] font-bold text-sm">
                    {searchTerm ? `No records matching "${searchTerm}"` : `No records found in ${collectionName}.`}
                </div>
            )}
        </div>
    );
}
