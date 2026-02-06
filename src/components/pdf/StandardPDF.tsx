'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#2d3436',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: 1,
        borderBottomColor: '#f1f2f6',
        paddingBottom: 20,
    },
    logo: {
        width: 280, // Increased width for header-style image
    },
    headerRight: {
        textAlign: 'right',
    },
    docTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#107d92',
        textTransform: 'uppercase',
    },
    refNumber: {
        fontSize: 10,
        marginTop: 5,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 9,
        marginTop: 2,
        color: '#636e72',
    },
    addressGrid: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 30,
    },
    addressBlock: {
        flex: 1,
    },
    addressTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#107d92',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    clientInfo: {
        fontSize: 9,
        lineHeight: 1.4,
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottom: 2,
        borderBottomColor: '#107d92',
        padding: 10,
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomColor: '#f1f2f6',
        padding: 10,
        alignItems: 'center',
    },
    colDesc: { flex: 4 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 1.5, textAlign: 'right' },
    colTotal: { flex: 1.5, textAlign: 'right', fontWeight: 'bold' },

    summarySection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    summaryBox: {
        width: 200,
        borderTop: 2,
        borderTopColor: '#107d92',
        paddingTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        fontSize: 10,
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#107d92',
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: 1,
        borderTopColor: '#f1f2f6',
        paddingTop: 10,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#b2bec3',
    }
});

interface PDFProps {
    type: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    data: any;
    businessInfo: any;
}

export const StandardPDF = ({ type, data, businessInfo }: PDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        {/* Using the new header logo image */}
                        <Image
                            src={typeof window !== 'undefined' ? `${window.location.origin}/images/unideal_header.png` : '/images/unideal_header.png'}
                            style={styles.logo}
                        />
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={styles.docTitle}>{type}</Text>
                        <Text style={styles.refNumber}>Ref: {data.quoteNumber || data.invoiceNumber || data.receiptNumber || data.id}</Text>
                        <Text style={styles.dateText}>Date: {data.date?.seconds ? new Date(data.date.seconds * 1000).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</Text>
                    </View>
                </View>

                {/* Client Section */}
                <View style={styles.addressGrid}>
                    <View style={styles.addressBlock}>
                        <Text style={styles.addressTitle}>Bill To</Text>
                        <View style={styles.clientInfo}>
                            <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 4 }}>{data.clientName || 'Valued Client'}</Text>
                            <Text>{data.clientCompany || ''}</Text>
                            {/* Legal requirements for client details */}
                            {data.clientAddress && <Text style={{ color: '#636e72', marginTop: 2 }}>{data.clientAddress}</Text>}
                            {data.clientBRN && <Text style={{ color: '#636e72' }}>BRN: {data.clientBRN}</Text>}
                            {data.clientVAT && <Text style={{ color: '#636e72' }}>VAT: {data.clientVAT}</Text>}
                            {data.clientPhone && <Text style={{ color: '#636e72' }}>Tel: {data.clientPhone}</Text>}
                            {data.clientEmail && <Text style={{ color: '#636e72' }}>Email: {data.clientEmail}</Text>}
                        </View>
                    </View>
                    <View style={styles.addressBlock}>
                        <Text style={styles.addressTitle}>Status</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, color: '#107d92' }}>{data.status || 'Pending'}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>Description</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colPrice}>Unit Price</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    <View style={styles.tableRow}>
                        <Text style={styles.colDesc}>{data.productName || 'Service Rendered'}</Text>
                        <Text style={styles.colQty}>{data.qty || 1}</Text>
                        <Text style={styles.colPrice}>MUR {(data.price || 0).toLocaleString()}</Text>
                        <Text style={styles.colTotal}>MUR {(data.total || 0).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryBox}>
                        {type === 'RECEIPT' ? (
                            <>
                                <View style={styles.summaryRow}>
                                    <Text>Original Total</Text>
                                    <Text>MUR {(data.total || 0).toLocaleString()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text>Payment Mode</Text>
                                    <Text style={{ fontWeight: 'bold', color: '#107d92' }}>{data.paymentMode || 'Cash'}</Text>
                                </View>
                                <View style={[styles.summaryRow, { borderTop: 1, borderTopColor: '#f1f2f6', paddingTop: 4, marginTop: 4 }]}>
                                    <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>Amount Paid</Text>
                                    <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>MUR {(data.paymentValue || 0).toLocaleString()}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.grandTotal, { color: '#e74c3c' }]}>
                                    <Text>BALANCE DUE</Text>
                                    <Text>MUR {(data.balanceDue || 0).toLocaleString()}</Text>
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.summaryRow}>
                                    <Text>Subtotal</Text>
                                    <Text>MUR {(data.subtotal || data.total || 0).toLocaleString()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={{ color: '#e74c3c' }}>Discount</Text>
                                    <Text style={{ color: '#e74c3c' }}>- MUR {(data.discount || 0).toLocaleString()}</Text>
                                </View>
                                <View style={[styles.summaryRow, { borderTop: 1, borderTopColor: '#f1f2f6', paddingTop: 4, marginTop: 4 }]}>
                                    <Text>Amount before VAT</Text>
                                    <Text>MUR {(data.amountBeforeVAT || ((data.subtotal || data.total || 0) - (data.discount || 0))).toLocaleString()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text>VAT (15%)</Text>
                                    <Text>MUR {(data.vatAmount || ((data.amountBeforeVAT || ((data.subtotal || data.total || 0) - (data.discount || 0))) * 0.15)).toLocaleString()}</Text>
                                </View>
                                <View style={[styles.summaryRow, styles.grandTotal]}>
                                    <Text>GRAND TOTAL</Text>
                                    <Text>MUR {(data.total || 0).toLocaleString()}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Thank you for your business. Please contact us for any inquiries.</Text>
                    <Text style={styles.footerText}>Generated by UniDeals CRM</Text>
                </View>
            </Page>
        </Document>
    );
};
