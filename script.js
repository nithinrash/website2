/* ============================================
   HURUP GAMING - JavaScript
   Smooth Animations & Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initCounterAnimation();
    initSmoothScroll();
});

/* ============================================
   NAVBAR SCROLL EFFECT
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class when page is scrolled
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
function initScrollReveal() {
    // Add reveal classes to elements
    const revealElements = [
        { selector: '.about-card', class: 'reveal', delay: 100 },
        { selector: '.product-card', class: 'reveal', delay: 150 },
        { selector: '.feature-item', class: 'reveal-left', delay: 100 },
        { selector: '.stat-card', class: 'reveal', delay: 100 },
        { selector: '.section-header', class: 'reveal', delay: 0 },
    ];

    revealElements.forEach(({ selector, class: className, delay }) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add(className);
            el.style.transitionDelay = `${index * delay}ms`;
        });
    });

    // Intersection Observer for reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        observer.observe(el);
    });
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */
function initCounterAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCounter = (element) => {
        const target = parseFloat(element.dataset.target);
        // data-suffix can be empty string, so check for undefined
        const suffix = element.dataset.suffix !== undefined ? element.dataset.suffix : '+';
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;

            if (current < target) {
                // Format number based on magnitude
                if (target >= 1000000) {
                    element.textContent = (current / 1000000).toFixed(1) + 'M+';
                } else if (target >= 1000) {
                    element.textContent = Math.floor(current / 1000) + 'K+';
                } else if (target < 10 && !Number.isInteger(target)) {
                    element.textContent = current.toFixed(1);
                } else {
                    element.textContent = Math.floor(current) + suffix;
                }

                requestAnimationFrame(updateCounter);
            } else {
                // Final value
                if (target >= 1000000) {
                    element.textContent = (target / 1000000).toFixed(0) + 'M+';
                } else if (target >= 1000) {
                    element.textContent = Math.floor(target / 1000) + 'K+';
                } else if (target < 10 && !Number.isInteger(target)) {
                    element.textContent = target.toFixed(1);
                } else {
                    element.textContent = target + suffix;
                }
            }
        };

        updateCounter();
    };

    // Observer for counter elements
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
}

/* ============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   PARALLAX EFFECT FOR SHAPES (Optional)
   ============================================ */
window.addEventListener('mousemove', (e) => {
    const shapes = document.querySelectorAll('.shape');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const x = mouseX * speed;
        const y = mouseY * speed;
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

/* ============================================
   BUTTON RIPPLE EFFECT
   ============================================ */
document.querySelectorAll('.cta-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 100px;
            height: 100px;
            left: ${x - 50}px;
            top: ${y - 50}px;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation to document
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
