// Cart Logic & Payment Modal
const whatsappNumber = '51946648819';
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Determine if we're on a page with cart functionality
    const cartIcon = document.getElementById('cartCount');
    if (cartIcon) {
        loadCart();
        updateCartUI();
    }
});

function loadCart() {
    const savedCart = localStorage.getItem('geoCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error("Error parsing cart", e);
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('geoCart', JSON.stringify(cart));
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function addToCart(name, price, id, type, description) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        alert('Este item ya está en tu carrito');
        return;
    }

    cart.push({ id, name, price, type, description });
    saveCart();
    updateCartUI();

    // Show cart automatically
    setTimeout(() => {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar && !sidebar.classList.contains('open')) {
            toggleCart();
        }
    }, 300);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartSummary = document.getElementById('cartSummary');

    if (cartCount) cartCount.textContent = cart.length;

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 14px; margin-top: 10px;">Agrega cursos o software para comenzar</p>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        let itemsHTML = '';
        let totalCourses = 0;
        let totalSoftware = 0;
        let coursesCount = 0;
        let softwareCount = 0;

        cart.forEach(item => {
            if (item.type === 'course') {
                totalCourses += item.price;
                coursesCount++;
            } else {
                totalSoftware += item.price;
                softwareCount++;
            }

            itemsHTML += `
                <div class="cart-item">
                    <span class="cart-item-type ${item.type}">${item.type === 'course' ? '<i class="fa-solid fa-book-open"></i> CURSO' : '<i class="fa-solid fa-bolt"></i> SOFTWARE'}</span>
                    <div class="cart-item-header">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                        </div>
                        <div class="cart-item-price">S/ ${item.price.toLocaleString()}</div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">× Eliminar</button>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHTML;

        let summaryHTML = '';
        if (coursesCount > 0) {
            summaryHTML += `
                <div class="cart-summary-row">
                    <span><i class="fa-solid fa-book-open"></i> Cursos (${coursesCount})</span>
                    <span>S/ ${totalCourses.toLocaleString()}</span>
                </div>
            `;
        }
        if (softwareCount > 0) {
            summaryHTML += `
                <div class="cart-summary-row">
                    <span><i class="fa-solid fa-bolt"></i> Software (${softwareCount})</span>
                    <span>S/ ${totalSoftware.toLocaleString()}</span>
                </div>
            `;
        }
        summaryHTML += `
            <div class="cart-summary-row total">
                <span>Total</span>
                <span>S/ ${(totalCourses + totalSoftware).toLocaleString()}</span>
            </div>
        `;

        if (cartSummary) cartSummary.innerHTML = summaryHTML;
        if (cartFooter) cartFooter.style.display = 'block';
    }
}

// Open Payment Modal
function openPaymentModal() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add animation class if needed
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

function confirmWhatsAppOrder() {
    if (cart.length === 0) return;

    let message = '*SOLICITUD DE COMPRA - CATASTRO PRO*\n\n';

    const courses = cart.filter(item => item.type === 'course');
    const software = cart.filter(item => item.type === 'software');

    if (courses.length > 0) {
        message += '*CURSOS:*\n';
        courses.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - S/ ${item.price.toLocaleString()}\n`;
        });
        message += '\n';
    }

    if (software.length > 0) {
        message += '*SOFTWARE:*\n';
        software.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - S/ ${item.price.toLocaleString()}\n`;
        });
        message += '\n';
    }

    const totalCourses = courses.reduce((sum, item) => sum + item.price, 0);
    const totalSoftware = software.reduce((sum, item) => sum + item.price, 0);
    const total = totalCourses + totalSoftware;

    message += '*RESUMEN:*\n';
    if (courses.length > 0) message += `Cursos: S/ ${totalCourses.toLocaleString()}\n`;
    if (software.length > 0) message += `Software: S/ ${totalSoftware.toLocaleString()}\n`;
    message += `*TOTAL: S/ ${total.toLocaleString()}*\n\n`;

    message += 'Estoy interesado en realizar la compra. Ya revis\u00E9 los medios de pago.';

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
    closePaymentModal();

    // Optionally clear cart or keep it
    // cart = []; saveCart(); updateCartUI(); 
}

// Global scope
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.confirmWhatsAppOrder = confirmWhatsAppOrder;
window.showTab = function (tab) { // Keep tab logic
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById('content-' + tab).classList.add('active');
    document.getElementById('content-' + tab).scrollIntoView({ behavior: 'smooth', block: 'start' });
};
window.toggleMenu = function () {
    const nav = document.querySelector('.nav-links');
    const btn = document.querySelector('.mobile-menu-btn');
    nav.classList.toggle('active');
    btn.innerHTML = nav.classList.contains('active') ? '<i class="fa-solid fa-times"></i>' : '<i class="fa-solid fa-bars"></i>';
};
window.openWhatsApp = function () {
    const message = 'Hola, estoy interesado en los cursos y software de Catastro Pro. \u00BFPueden darme m\u00E1s informaci\u00F3n?';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
};

// Scroll to Top Logic
document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
