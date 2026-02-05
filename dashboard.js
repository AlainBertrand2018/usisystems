document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');

    // Add real-time date
    const dateDisplay = document.querySelector('.header-titles p');
    if (dateDisplay) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // --- STATE MANAGEMENT ---
    let currentStep = 1;
    let products = [];
    let clients = [];
    let selectedProduct = null;
    let selectedClient = null;

    // --- DOM ELEMENTS ---
    const quoteModal = document.getElementById('quote-modal');
    const quoteForm = document.getElementById('quote-form');
    const productSelect = document.getElementById('product-select');
    const clientSelect = document.getElementById('client-select');

    // Sub-modals
    const newProductModal = document.getElementById('new-product-modal');
    const newClientModal = document.getElementById('new-client-modal');

    // Add interactivity to the "New" button
    const addBtn = document.querySelector('.add-btn');
    if (addBtn && quoteModal) {
        addBtn.addEventListener('click', () => {
            quoteModal.style.display = 'flex';
            goToStep(1); // Ensure it starts at step 1
        });
    }

    // Close button for main modal
    const closeQuoteBtn = document.getElementById('close-quote');
    if (closeQuoteBtn && quoteModal) {
        closeQuoteBtn.addEventListener('click', () => {
            quoteModal.style.display = 'none';
        });
    }

    // Close main modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === quoteModal) {
            quoteModal.style.display = 'none';
        }
    });

    // --- STEP NAVIGATION ---
    function goToStep(step) {
        document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step-indicator').forEach(el => {
            const elStep = parseInt(el.dataset.step);
            el.classList.remove('active', 'completed');
            if (elStep === step) el.classList.add('active');
            if (elStep < step) el.classList.add('completed');
        });
        document.getElementById(`step-${step}`).classList.add('active');
        currentStep = step;

        // Populate review step
        if (step === 3) {
            document.getElementById('review-client').textContent = selectedClient?.name || 'Error';
            document.getElementById('review-product').textContent = selectedProduct?.name || 'Error';
            document.getElementById('unit-price').value = selectedProduct?.price || 0;
            updateTotal();
        }
    }

    document.getElementById('to-step-2').onclick = () => {
        const val = productSelect.value;
        if (!val) return alert('Please select a product');
        selectedProduct = products.find(p => p.id === val);
        goToStep(2);
    };

    document.getElementById('to-step-3').onclick = () => {
        const val = clientSelect.value;
        if (!val) return alert('Please select a client');
        selectedClient = clients.find(c => c.id === val);
        goToStep(3);
    };

    document.getElementById('back-to-step-1').onclick = () => goToStep(1);
    document.getElementById('back-to-step-2').onclick = () => goToStep(2);

    // --- QUICK ADD LOGIC ---
    document.getElementById('add-new-product').onclick = () => newProductModal.style.display = 'flex';
    document.getElementById('add-new-client').onclick = () => newClientModal.style.display = 'flex';

    document.getElementById('close-product-modal').onclick = () => newProductModal.style.display = 'none';
    document.getElementById('close-client-modal').onclick = () => newClientModal.style.display = 'none';

    // Handler: New Product
    document.getElementById('new-product-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('new-p-name').value;
        const price = parseFloat(document.getElementById('new-p-price').value);

        const newP = { id: Date.now().toString(), name, price };
        products.push(newP);
        refreshLists();
        productSelect.value = newP.id;
        newProductModal.style.display = 'none';

        // Auto-select for the user
        selectedProduct = newP;
        alert(`Success! "${name}" added to list and selected.`);
    };

    // Handler: New Client
    document.getElementById('new-client-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('new-c-name').value;
        const email = document.getElementById('new-c-email').value;

        const newC = { id: Date.now().toString(), name, email };
        clients.push(newC);
        refreshLists();
        clientSelect.value = newC.id;
        newClientModal.style.display = 'none';

        // Auto-select for the user
        selectedClient = newC;
        alert(`Success! "${name}" added to list and selected.`);
    };

    // --- MOCK DATA FETCH (Integration Point) ---
    // In a final version, these will be onSnapshot listeners to Firestore
    function refreshLists() {
        // Mocking for now to show UI flow
        products = [
            { id: '1', name: 'Website Development', price: 25000 },
            { id: '2', name: 'Mobile App Design', price: 15000 }
        ];
        clients = [
            { id: '1', name: 'Alice Tech', business: 'Alice Solutions Ltd', email: 'alice@tech.com' },
            { id: '2', name: 'Bob Design', business: 'Creative Bob Co', email: 'bob@creative.com' }
        ];

        productSelect.innerHTML = '<option value="">Select a product...</option>' +
            products.map(p => `<option value="${p.id}">${p.name} (MUR ${p.price})</option>`).join('');

        clientSelect.innerHTML = '<option value="">Select a client...</option>' +
            clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    refreshLists();
    renderQuotations();

    // --- TOTAL CALCULATION ---
    const qtyInput = document.getElementById('qty');
    const priceInput = document.getElementById('unit-price');
    const totalDisplay = document.getElementById('quote-total');

    function updateTotal() {
        const total = (qtyInput.value || 0) * (priceInput.value || 0);
        totalDisplay.textContent = `MUR ${total.toLocaleString()}`;
    }

    qtyInput.oninput = updateTotal;
    priceInput.oninput = updateTotal;

    // --- QUOTATION DATA MANAGEMENT ---
    let quotations = [
        {
            id: 'Q-ATAS-0204261015',
            clientId: '1',
            clientName: 'Alice Tech',
            clientBusiness: 'Alice Solutions Ltd',
            productId: '1',
            productName: 'Website Development',
            qty: 1,
            price: 25000,
            total: 25000,
            status: 'Sent',
            timestamp: Date.now() - 86400000 // Yesterday
        },
        {
            id: 'Q-BDCB-0205260930',
            clientId: '2',
            clientName: 'Bob Design',
            clientBusiness: 'Creative Bob Co',
            productId: '2',
            productName: 'Mobile App Design',
            qty: 1,
            price: 15000,
            total: 15000,
            status: 'To send',
            timestamp: Date.now() - 3600000 // 1 hour ago
        }
    ];

    // Helper: Generate Initials
    function getInitials(str) {
        if (!str) return 'XX';
        return str.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Helper: Generate Quotation ID
    function generateQuoteID(client) {
        const now = new Date();
        const ci = getInitials(client.name);
        // Using "BD" as business placeholder if business is not defined clearly in client obj
        const bi = getInitials(client.business || 'Business Default');

        const dateStr = (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getFullYear().toString().substring(2, 4) +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        return `Q-${ci}${bi}-${dateStr}`;
    }

    const quotesTableBody = document.getElementById('quotations-tbody');

    function renderQuotations() {
        if (!quotesTableBody) return;

        // Sort: Most recent first
        const sorted = [...quotations].sort((a, b) => b.timestamp - a.timestamp);

        quotesTableBody.innerHTML = sorted.map(q => `
            <tr>
                <td style="font-family: monospace; font-weight: 600;">${q.id}</td>
                <td>${q.clientBusiness}</td>
                <td>${new Date(q.timestamp).toLocaleDateString()}</td>
                <td><strong>MUR ${q.total.toLocaleString()}</strong></td>
                <td>
                    <select class="status-select status-${q.status.toLowerCase().replace(' ', '-')}" onchange="updateQuoteStatus('${q.id}', this.value)">
                        <option value="To send" ${q.status === 'To send' ? 'selected' : ''}>To send</option>
                        <option value="Sent" ${q.status === 'Sent' ? 'selected' : ''}>Sent</option>
                        <option value="Won" ${q.status === 'Won' ? 'selected' : ''}>Won</option>
                        <option value="Rejected" ${q.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="Lost" ${q.status === 'Lost' ? 'selected' : ''}>Lost</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn" onclick="cloneQuotation('${q.id}')" title="Edit (Clone)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="View PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Global handles for select/onclick
    window.updateQuoteStatus = (id, newStatus) => {
        const q = quotations.find(item => item.id === id);
        if (q) {
            q.status = newStatus;
            renderQuotations();
        }
    };

    window.cloneQuotation = (id) => {
        const q = quotations.find(item => item.id === id);
        if (q) {
            // Load data into state
            selectedProduct = products.find(p => p.id === q.productId) || products[0];
            selectedClient = clients.find(c => c.id === q.clientId) || clients[0];

            // Populate Form Fields
            productSelect.value = q.productId;
            clientSelect.value = q.clientId;
            qtyInput.value = q.qty;
            priceInput.value = q.price;
            document.getElementById('quote-description').value = q.notes || '';

            // Show modal and start at Step 3 for review
            quoteModal.style.display = 'flex';
            goToStep(3);
        }
    };

    // --- FORM SUBMISSION ---
    quoteForm.onsubmit = (e) => {
        e.preventDefault();

        const newQuote = {
            id: generateQuoteID(selectedClient),
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            clientBusiness: selectedClient.business || 'Business Default',
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            qty: parseInt(qtyInput.value),
            price: parseFloat(priceInput.value),
            total: parseInt(totalDisplay.textContent.replace('MUR ', '').replace(/,/g, '')),
            notes: document.getElementById('quote-description').value,
            status: 'To send',
            timestamp: Date.now()
        };

        quotations.push(newQuote);
        renderQuotations();

        quoteModal.style.display = 'none';
        quoteForm.reset();
        goToStep(1);
    };

    // AUTO-OPEN LOGIC
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'new_quotation' && quoteModal) {
        console.log('Auto-opening quotation modal...');
        quoteModal.style.display = 'flex';
        goToStep(1); // Ensure it starts at step 1 when auto-opened

        // Clean up URL without refreshing
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }
});
