import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDvIpEnPOxvapXsVwYQEKOcObSHajtoJ3A",
    authDomain: "studio-8473130320-209d7.firebaseapp.com",
    projectId: "studio-8473130320-209d7",
    storageBucket: "studio-8473130320-209d7.firebasestorage.app",
    messagingSenderId: "35590121523",
    appId: "1:35590121523:web:daa8715c602d6aff46db46"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
    console.log("🚀 Starting data population...");

    try {
        console.log("📝 Note: Ensure your Firestore Rules allow writes (allow read, write: if true;)");

        // 1. Business Details
        console.log("📦 Seeding businessdetails...");
        await setDoc(doc(db, "businessdetails", "main"), {
            name: "UniDeals CRM Solutions",
            owner: "CRM Admin",
            email: "contact@unideals.crm",
            phone: "+230 5123 4567",
            address: "Ebene Cybercity, Mauritius",
            currency: "MUR",
            taxNumber: "VAT12345678",
            updatedAt: serverTimestamp()
        });

        // 2. Business Products
        console.log("📦 Seeding business_products...");
        const products = [
            { name: "Website Development", price: 25000, description: "Professional business website", category: "Services" },
            { name: "Mobile App Design", price: 15000, description: "UI/UX for mobile applications", category: "Services" },
            { name: "SEO Optimization", price: 5000, description: "Monthly SEO package", category: "Marketing" },
            { name: "Cloud Hosting (Annual)", price: 12000, description: "Secure managed hosting", category: "Infrastructure" }
        ];
        const productIds = [];
        for (const p of products) {
            const docRef = await addDoc(collection(db, "business_products"), { ...p, createdAt: serverTimestamp() });
            productIds.push(docRef.id);
        }

        // 3. Clients
        console.log("📦 Seeding clients...");
        const clients = [
            { name: "Alice Tech", email: "alice@tech.com", phone: "59876543", company: "TechCorp Ltd", address: "Port Louis" },
            { name: "Bob Design", email: "bob@creative.com", phone: "51122334", company: "Creative Studio", address: "Grand Baie" }
        ];
        const clientIds = [];
        for (const c of clients) {
            const docRef = await addDoc(collection(db, "clients"), { ...c, createdAt: serverTimestamp(), status: "active" });
            clientIds.push(docRef.id);
        }

        // 4. Users
        console.log("📦 Seeding users...");
        await addDoc(collection(db, "users"), {
            displayName: "Super Admin",
            email: "owner@unideals.crm",
            role: "super_admin",
            createdAt: serverTimestamp()
        });

        await addDoc(collection(db, "users"), {
            displayName: "Business Admin",
            email: "admin@unideals.crm",
            role: "admin",
            createdAt: serverTimestamp()
        });

        await addDoc(collection(db, "users"), {
            displayName: "Standard User",
            email: "user@unideals.crm",
            role: "user",
            createdAt: serverTimestamp()
        });

        // 5. Quotations
        console.log("📦 Seeding quotations...");
        const quoteRef = await addDoc(collection(db, "quotations"), {
            clientId: clientIds[0],
            clientName: "Alice Tech",
            items: [
                { productId: productIds[0], name: "Website Development", price: 25000, quantity: 1 }
            ],
            total: 25000,
            status: "pending",
            quoteNumber: "QT-001",
            date: serverTimestamp()
        });

        // 6. Invoices
        console.log("📦 Seeding invoices...");
        const invoiceRef = await addDoc(collection(db, "invoices"), {
            clientId: clientIds[1],
            clientName: "Bob Design",
            items: [
                { productId: productIds[1], name: "Mobile App Design", price: 15000, quantity: 1 },
                { productId: productIds[2], name: "SEO Optimization", price: 5000, quantity: 1 }
            ],
            total: 20000,
            status: "unpaid",
            invoiceNumber: "INV-001",
            date: serverTimestamp(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // 7. Receipts
        console.log("📦 Seeding receipts...");
        await addDoc(collection(db, "receipts"), {
            invoiceId: invoiceRef.id,
            invoiceNumber: "INV-001",
            amountPaid: 20000,
            paymentMethod: "Bank Transfer",
            date: serverTimestamp()
        });

        // 8. Statements
        console.log("📦 Seeding statements...");
        await addDoc(collection(db, "statements"), {
            clientId: clientIds[1],
            period: "February 2026",
            openingBalance: 0,
            closingBalance: 0,
            transactions: [
                { type: "invoice", reference: "INV-001", amount: 20000, date: new Date() },
                { type: "payment", reference: "RCP-001", amount: -20000, date: new Date() }
            ],
            date: serverTimestamp()
        });

        // 9. Appointments
        console.log("📦 Seeding appointments...");
        await addDoc(collection(db, "appointments"), {
            title: "Project Kickoff",
            clientId: clientIds[0],
            clientName: "Alice Tech",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            location: "Ebene Office",
            description: "Initial meeting for website project"
        });

        await addDoc(collection(db, "appointments"), {
            title: "Design Review",
            clientId: clientIds[1],
            clientName: "Bob Design",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            location: "Google Meet",
            description: "Review of mobile app wireframes"
        });

        console.log("✅ Data population completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
