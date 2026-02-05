const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const { Resend } = require("resend");

admin.initializeApp();

/**
 * 1. TRANSACTIONAL EMAIL
 * Sends an email automatically when a new quotation is created.
 */
exports.onNewQuotation = onDocumentCreated({
    document: "quotations/{quoteId}",
    secrets: ["RESEND_API_KEY"]
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const quoteData = snapshot.data();
    const clientName = quoteData.clientName;
    const total = quoteData.total;

    logger.info(`Sending welcome email for quote: ${event.params.quoteId}`);

    // Initialize Resend with secret from process.env
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: 'UniDeals <onboarding@resend.dev>',
            to: quoteData.clientEmail || 'bertrand.chagal@gmail.com',
            subject: `New Quotation: ${quoteData.quoteNumber}`,
            html: `<strong>Hello ${clientName},</strong><p>Your quotation for MUR ${total.toLocaleString()} is ready.</p>`
        });
    } catch (error) {
        logger.error("Error sending email:", error);
    }
});

/**
 * 2. CRON JOB (SCHEDULED)
 * Runs Every Monday at 9:00 AM to send a weekly business summary.
 * Frequency: "0 9 * * 1"
 */
exports.weeklyBusinessSummary = onSchedule({
    schedule: "0 9 * * 1",
    secrets: ["RESEND_API_KEY"]
}, async (event) => {
    logger.info("Running weekly business summary CRON...");
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Logic: 
    // 1. Fetch all invoices created this week
    // 2. Aggregate totals
    // 3. Send a summary email to the owner
});

/**
 * 3. TEST FUNCTION
 * Trigger manually via URL to verify Resend setup.
 */
exports.testEmail = onRequest({ secrets: ["RESEND_API_KEY"] }, async (req, res) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const data = await resend.emails.send({
            from: 'UniDeals <onboarding@resend.dev>',
            to: 'bertrand.chagal@gmail.com',
            subject: 'Test Email from UniDeals CRM',
            html: '<h1>It works!</h1><p>Firebase Functions + Resend is ready.</p>'
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
