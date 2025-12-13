// Cuban Soul Food Truck - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // Order form functionality
    const orderForm = document.getElementById('orderForm');
    const orderType = document.getElementById('orderType');
    const addressGroup = document.getElementById('addressGroup');
    const orderDate = document.getElementById('orderDate');

    // Show/hide address field based on order type
    if (orderType && addressGroup) {
        orderType.addEventListener('change', function() {
            if (this.value === 'delivery' || this.value === 'catering') {
                addressGroup.style.display = 'block';
                document.getElementById('address').required = true;
            } else {
                addressGroup.style.display = 'none';
                document.getElementById('address').required = false;
            }
        });
    }

    // Set minimum date to today
    if (orderDate) {
        const today = new Date().toISOString().split('T')[0];
        orderDate.setAttribute('min', today);
    }

    // Form submission
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(orderForm);
            const orderData = {};
            
            for (let [key, value] of formData.entries()) {
                orderData[key] = value;
            }

            // Create email content
            const subject = `Cuban Soul Order - ${orderData.name}`;
            const body = createEmailBody(orderData);
            
            // Create mailto link
            const mailtoLink = `mailto:orders@cubansoul.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Try to open email client
            try {
                window.location.href = mailtoLink;
                showSuccessMessage();
            } catch (error) {
                showPhoneMessage();
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to navigation on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d+)/, '($1) $2');
            }
            e.target.value = value;
        });
    }

    // Subscription modal functionality
    const modal = document.getElementById('subscriptionModal');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const promotionsBtn = document.getElementById('promotionsBtn');
    const closeModal = document.querySelector('.close');
    const subscriptionForm = document.getElementById('subscriptionForm');

    // Show modal when old subscribe button is clicked (if exists)
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }
    
    // Show modal when new promotions button is clicked
    if (promotionsBtn) {
        promotionsBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }

    // Close modal when X is clicked
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle subscription form submission
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(subscriptionForm);
            const subscriptionData = {};
            
            for (let [key, value] of formData.entries()) {
                subscriptionData[key] = value;
            }

            // Create email content for subscription
            const subject = 'Cuban Soul Newsletter Subscription';
            const body = createSubscriptionEmail(subscriptionData);
            
            // Create mailto link
            const mailtoLink = `mailto:subscribe@cubansoul.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Try to open email client
            try {
                window.location.href = mailtoLink;
                showSubscriptionSuccess();
                modal.style.display = 'none';
                subscriptionForm.reset();
            } catch (error) {
                showSubscriptionSuccess();
                modal.style.display = 'none';
                subscriptionForm.reset();
            }
        });
    }

    // Phone number formatting for subscription form
    const subPhoneInput = document.getElementById('subPhone');
    if (subPhoneInput) {
        subPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d+)/, '($1) $2');
            }
            e.target.value = value;
        });
    }

    // Auto-show modal after 10 seconds (first visit)
    setTimeout(function() {
        if (!localStorage.getItem('cubanSoulNewsletterShown')) {
            modal.style.display = 'block';
            localStorage.setItem('cubanSoulNewsletterShown', 'true');
        }
    }, 10000);
});

// Create email body for order
function createEmailBody(orderData) {
    return `
New Order Request from Cuban Soul Website

Customer Information:
Name: ${orderData.name}
Phone: ${orderData.phone}
Email: ${orderData.email}

Order Details:
Order Type: ${orderData.orderType}
${orderData.address ? `Address: ${orderData.address}` : ''}
Preferred Date: ${orderData.orderDate}
Preferred Time: ${orderData.orderTime}

Items Ordered:
${orderData.items}

${orderData.specialInstructions ? `Special Instructions:\n${orderData.specialInstructions}` : ''}

Please contact the customer within 30 minutes to confirm the order and provide pricing.

---
Sent from Cuban Soul Website
    `.trim();
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.innerHTML = `
        <strong>Order Submitted!</strong><br>
        We'll contact you within 30 minutes to confirm your order and provide pricing.
    `;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Show phone message if email fails
function showPhoneMessage() {
    const message = document.createElement('div');
    message.className = 'alert alert-info';
    message.innerHTML = `
        <strong>Please call us directly:</strong><br>
        <a href="tel:8324105035" style="color: white; font-size: 18px;">(832) 410-5035</a>
    `;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
        text-align: center;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 8000);
}

// Add mobile menu styles dynamically
const mobileMenuStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 70px;
            flex-direction: column;
            background-color: white;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 20px 0;
        }

        .nav-menu.active {
            left: 0;
        }

        .nav-menu li {
            margin: 10px 0;
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;

// Add the mobile styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileMenuStyles;
document.head.appendChild(styleSheet);

// Create email body for subscription
function createSubscriptionEmail(subscriptionData) {
    return `
New Newsletter Subscription Request

Customer Information:
Name: ${subscriptionData.subName}
Email: ${subscriptionData.subEmail}
${subscriptionData.subPhone ? `Phone: ${subscriptionData.subPhone}` : ''}

Please add this customer to the Cuban Soul newsletter and promotions list.

---
Sent from Cuban Soul Website
    `.trim();
}

// Show subscription success message
function showSubscriptionSuccess() {
    const message = document.createElement('div');
    message.className = 'alert alert-success';
    message.innerHTML = `
        <strong>Thank you for subscribing!</strong><br>
        You'll receive our latest promotions and specials soon.
    `;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 4000);
}

// Add subscription animations
const subscriptionStyles = `
    @keyframes slideInRight {
        from { 
            opacity: 0;
            transform: translateX(100%);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from { 
            opacity: 1;
            transform: translateX(0);
        }
        to { 
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;

// Add subscription styles to document
const subscriptionStyleSheet = document.createElement('style');
subscriptionStyleSheet.textContent = subscriptionStyles;
document.head.appendChild(subscriptionStyleSheet);