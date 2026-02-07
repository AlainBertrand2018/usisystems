'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, where, doc, deleteDoc } from 'firebase/firestore';
import { Edit2, FileDown, AlertCircle, Copy, Eye, Search, Mail, Loader2, Banknote, FileCheck, Landmark, Trash2 } from 'lucide-react';
import PDFDownloadButton from './pdf/PDFDownloadButton';
import { useAuth } from '@/context/AuthContext';

interface DataTableProps {
    collectionName: string;
    columns: { key: string; label: string; format?: (val: any, row?: any) => React.ReactNode }[];
    onEdit?: (item: any) => void;
    onClone?: (item: any) => void;
    onDownload?: (item: any) => void;
    onSend?: (item: any) => void;
    onView?: (item: any) => void;
    onConvert?: (item: any) => void;
    onRegisterPayment?: (item: any) => void;
    onBanked?: (item: any) => void;
    onDelete?: (item: any) => void;
    pdfType?: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    defaultOrderBy?: string;
    viewMode?: 'table' | 'grid';
    renderGrid?: (item: any) => React.ReactNode;
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
    onDelete,
    pdfType,
    defaultOrderBy = 'date',
    viewMode = 'table',
    renderGrid
}: DataTableProps) {
    const { user } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteInternal = async (item: any) => {
        if (collectionName === 'quotations' || collectionName === 'invoices') {
            alert("PROCEDURAL LOCK: Financial documents like Quotations and Invoices cannot be deleted to maintain audit integrity. Please use 'Clone' to create a new version instead.");
            return;
        }

        if (item.role === 'super_admin' && user?.role !== 'super_admin') {
            alert("SECURITY ALERT: You are not authorized to delete a Super Admin.");
            return;
        }

        if (!window.confirm("ARE YOU SURE? This action is permanent and cannot be undone.")) return;

        setDeletingId(item.id);
        try {
            if (onDelete) {
                await onDelete(item);
            } else {
                await deleteDoc(doc(db, collectionName, item.id));
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete item.");
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        setError(null);

        const collRef = collection(db, collectionName);
        let constraints: any[] = [];

        if (user.role !== 'super_admin') {
            constraints.push(where('businessId', '==', user.businessId));
            if (collectionName === 'users') {
                constraints.push(where('role', '!=', 'super_admin'));
            }
        }

        const executeQuery = (baseConstraints: any[], sortField: string | null, isFallback = false) => {
            let finalQuery;
            try {
                if (sortField) {
                    finalQuery = query(collRef, ...baseConstraints, orderBy(sortField, 'desc'), limit(100));
                } else {
                    finalQuery = query(collRef, ...baseConstraints, limit(100));
                }
            } catch (e) {
                finalQuery = query(collRef, ...baseConstraints, limit(100));
                isFallback = true;
            }

            return onSnapshot(finalQuery, (snapshot) => {
                let items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (user.role !== 'super_admin') {
                    items = items.filter((item: any) => item.businessId === user.businessId);
                }

                if (user.role !== 'super_admin' && collectionName === 'users') {
                    items = items.filter((item: any) => item.role !== 'super_admin');
                }

                if (isFallback || !sortField) {
                    items.sort((a: any, b: any) => {
                        const valA = a[defaultOrderBy]?.seconds || a[defaultOrderBy] || 0;
                        const valB = b[defaultOrderBy]?.seconds || b[defaultOrderBy] || 0;
                        return valB > valA ? 1 : -1;
                    });
                }

                setData(items);
                setLoading(false);
            }, (err) => {
                if (err.code === 'failed-precondition' && !isFallback) {
                    const safetyConstraints = user.role !== 'super_admin' ? [where('businessId', '==', user.businessId)] : [];
                    unsubscribe = executeQuery(safetyConstraints, null, true);
                    return;
                }
                console.error(`Firestore error in ${collectionName}:`, err);
                setError(err.message);
                setLoading(false);
            });
        };

        let unsubscribe = executeQuery(constraints, defaultOrderBy);
        return () => unsubscribe();
    }, [collectionName, defaultOrderBy, user]);

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

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const searchStr = searchTerm.toLowerCase();
            if (!searchStr) return true;

            const inColumns = columns.some((col) => {
                const val = item[col.key];
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(searchStr);
            });

            if (inColumns) return true;

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
    }, [data, searchTerm, columns]);

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

    const hasActionsColumn = columns.some(c => c.key === 'actions');

    return (
        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm space-y-6">
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

            {viewMode === 'grid' && renderGrid ? (
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 px-1 sm:px-2 pb-10">
                    {filteredData.map((item) => (
                        <div key={item.id}>
                            {renderGrid(item)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {columns.map((col) => (
                                    <th key={col.key} className={`pb-4 px-4 text-[10px] font-black text-[#6c757d] uppercase tracking-widest whitespace-nowrap ${col.key === 'actions' ? 'text-right' : ''}`}>
                                        {col.label}
                                    </th>
                                ))}
                                {!hasActionsColumn && (
                                    <th className="pb-4 px-4 text-[10px] font-black text-[#6c757d] uppercase tracking-widest text-right">Actions</th>
                                )}
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
                                                    {col.format ? col.format(item[col.key], item) : item[col.key]}
                                                </button>
                                            ) : (
                                                col.format ? col.format(item[col.key], item) : item[col.key]
                                            )}
                                        </td>
                                    ))}
                                    {!hasActionsColumn && (
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

                                                <button
                                                    onClick={() => handleDeleteInternal(item)}
                                                    disabled={deletingId === item.id}
                                                    className="p-2 bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                                                    title="Delete Permanently"
                                                >
                                                    {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {filteredData.length === 0 && (
                <div className="py-20 text-center text-[#6c757d] font-bold text-sm">
                    {searchTerm ? `No records matching "${searchTerm}"` : `No records found in ${collectionName}.`}
                </div>
            )}
        </div>
    );
}
