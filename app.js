document.addEventListener('DOMContentLoaded', () => {
    const accessBtn = document.getElementById('access-btn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = document.querySelector('.close-btn');
    const loginForm = document.getElementById('login-form');

    let redirectAction = 'dashboard';

    // Show Modal - Dashboard
    accessBtn.addEventListener('click', () => {
        redirectAction = 'dashboard';
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Show Modal - New Quotation
    const quoteBtn = document.getElementById('quote-btn');
    quoteBtn.addEventListener('click', () => {
        redirectAction = 'new_quotation';
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Hide Modal (Close Button)
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Hide Modal (Click outside)
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Visual feedback for interaction
        const submitBtn = loginForm.querySelector('.submit-btn');
        submitBtn.textContent = 'Authenticating...';
        submitBtn.disabled = true;

        console.log('Login attempt:', { email });

        // In a real app, this is where Firebase Auth would trigger
        setTimeout(() => {
            // Redirect with action intent
            window.location.href = `dashboard.html?action=${redirectAction}`;
        }, 1500);
    });
});
