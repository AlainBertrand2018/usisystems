import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { renderToBuffer } from '@react-pdf/renderer';
import { StandardPDF } from '@/components/pdf/StandardPDF';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { documentId, collectionName, type, clientEmail } = await request.json();

        if (!documentId || !collectionName || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch Document Data
        const docRef = doc(db, collectionName, documentId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const data = { id: docSnap.id, ...(docSnap.data() as any) } as any;

        // 2. Fetch Business Details
        const businessDocs = await getDocs(query(collection(db, 'businessdetails'), limit(1)));
        const businessInfo = !businessDocs.empty ? (businessDocs.docs[0].data() as any) : {};

        // 3. Generate PDF Buffer
        const pdfContent = React.createElement(StandardPDF, {
            type: type,
            data: data,
            businessInfo: businessInfo
        }) as React.ReactElement<any>;

        const pdfBuffer = await renderToBuffer(pdfContent);

        // 4. Send Email via Resend
        const targetEmail = clientEmail || data.clientEmail || data.businessEmail || data.email;

        if (!targetEmail) {
            return NextResponse.json({ error: 'Recipient email not found' }, { status: 400 });
        }

        const fileName = `${type}_${data.quoteNumber || data.invoiceNumber || data.receiptNumber || data.id}.pdf`;

        const emailResponse = await resend.emails.send({
            from: 'UniDeals CRM <onboarding@resend.dev>', // Update this after domain verification
            to: targetEmail,
            subject: `${type}: ${data.quoteNumber || data.invoiceNumber || data.receiptNumber || data.id} from UniDeals Ltd`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; rounded: 12px;">
                    <h2 style="color: #107d92;">Hello ${data.clientName || 'Valued Client'},</h2>
                    <p>Please find attached your official <strong>${type.toLowerCase()}</strong> from UniDeals Ltd.</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Document No:</strong> ${data.quoteNumber || data.invoiceNumber || data.receiptNumber || data.id}</p>
                        <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> MUR ${data.total?.toLocaleString()}</p>
                    </div>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #6c757d;">
                        Best Regards,<br />
                        <strong>UniDeals Ltd Team</strong>
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                },
            ],
        });

        return NextResponse.json({ success: true, data: emailResponse });
    } catch (error: any) {
        console.error('Email API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
