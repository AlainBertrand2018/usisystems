'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a premium font (optional, using standard Helvetica for maximum reliability/speed)
// But we'll use bold weights and spacing to make it look "Outstanding"

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#2d3436',
    },
    accentStrip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: '#107d92',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 40,
        borderBottom: 2,
        borderBottomColor: '#f1f2f6',
        paddingBottom: 20,
    },
    logo: {
        width: 120,
    },
    headerRight: {
        textAlign: 'right',
    },
    docTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#107d92',
        textTransform: 'uppercase',
    },
    refNumber: {
        fontSize: 10,
        marginTop: 5,
        color: '#636e72',
    },
    addressGrid: {
        flexDirection: 'row',
        gap: 50,
        marginBottom: 40,
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
    table: {
        marginTop: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        borderBottom: 1,
        borderBottomColor: '#dfe6e9',
        padding: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderBottomColor: '#f1f2f6',
        padding: 8,
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
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#107d92',
        marginTop: 10,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        borderTop: 1,
        borderTopColor: '#dfe6e9',
        paddingTop: 15,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#b2bec3',
        marginBottom: 5,
    },
    pageNumber: {
        fontSize: 8,
        color: '#107d92',
        fontWeight: 'bold',
    },
    notes: {
        marginTop: 50,
        padding: 15,
        backgroundColor: '#fdfdfd',
        borderLeft: 3,
        borderLeftColor: '#107d92',
    }
});

interface PDFProps {
    type: 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'STATEMENT';
    data: any;
    businessInfo: any;
}

export const StandardPDF = ({ type, data, businessInfo }: PDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.accentStrip} fixed />
            {/* Header */}
            <View style={styles.header} fixed>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 30, height: 30, backgroundColor: '#107d92', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>U</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#107d92', letterSpacing: 0.5 }}>UNIDEALS</Text>
                        <Text style={{ fontSize: 7, color: '#b2bec3', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>{businessInfo.tagline || 'Business CRM'}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.docTitle}>{type}</Text>
                    <Text style={styles.refNumber}>Ref: {data.quoteNumber || data.invoiceNumber || data.id}</Text>
                    <Text style={styles.refNumber}>Date: {new Date(data.date?.seconds * 1000).toLocaleDateString()}</Text>
                </View>
            </View>

            {/* Address Grid */}
            <View style={styles.addressGrid}>
                <View style={styles.addressBlock}>
                    <Text style={styles.addressTitle}>From</Text>
                    <Text style={{ fontWeight: 'bold' }}>{businessInfo.name}</Text>
                    <Text>{businessInfo.address}</Text>
                    <Text>Tel: {businessInfo.phone}</Text>
                    <Text>{businessInfo.email}</Text>
                </View>
                <View style={styles.addressBlock}>
                    <Text style={styles.addressTitle}>To Client</Text>
                    <Text style={{ fontWeight: 'bold' }}>{data.clientName}</Text>
                    <Text>{data.clientCompany || data.company}</Text>
                    <Text>{data.clientEmail || 'N/A'}</Text>
                </View>
            </View>

            {/* Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader} fixed>
                    <Text style={styles.colDesc}>Description</Text>
                    <Text style={styles.colQty}>Qty</Text>
                    <Text style={styles.colPrice}>Unit Price</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>

                {/* Dynamically handle one or many items (CRM usually has one service per quote/invoice for now) */}
                <View style={styles.tableRow} wrap={false}>
                    <Text style={styles.colDesc}>{data.productName || 'Service Rendered'}</Text>
                    <Text style={styles.colQty}>{data.qty || 1}</Text>
                    <Text style={styles.colPrice}>MUR {(data.price || 0).toLocaleString()}</Text>
                    <Text style={styles.colTotal}>MUR {(data.total || 0).toLocaleString()}</Text>
                </View>
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                        <Text>Subtotal</Text>
                        <Text>MUR {(data.total || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>VAT (0%)</Text>
                        <Text>MUR 0.00</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.grandTotal]}>
                        <Text>TOTAL</Text>
                        <Text>MUR {(data.total || 0).toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {data.notes && (
                <View style={styles.notes}>
                    <Text style={styles.addressTitle}>Notes & Terms</Text>
                    <Text style={{ fontSize: 9, lineHeight: 1.5, color: '#636e72' }}>{data.notes}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footerContainer} fixed>
                <Text style={styles.footerText}>Thank you for choosing {businessInfo.name}. We appreciate your business!</Text>
                <Text style={styles.footerText}>
                    {businessInfo.address} | BRN: {businessInfo.brn || 'XXXXXXXXX'} | {businessInfo.website}
                </Text>
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number | null }) => (
                    `Page ${pageNumber}${totalPages ? ` of ${totalPages}` : ''}`
                )} />
            </View>
        </Page>
    </Document>
);
