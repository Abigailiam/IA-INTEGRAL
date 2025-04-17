// Main JavaScript for IA INTEGRAL website

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            
            // Accessibility - update aria attributes
            const expanded = nav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', expanded);
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (nav && nav.classList.contains('active') && 
            !nav.contains(event.target) && 
            !mobileMenuToggle.contains(event.target)) {
            nav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Testimonial slider functionality
    initTestimonialSlider();
    
    // Initialize affiliate link tracking
    initAffiliateTracking();
    
    // Initialize newsletter signup
    initNewsletterSignup();
    
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Initialize analytics
    initAnalytics();
});

// Testimonial slider
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length <= 1) return;
    
    let currentIndex = 0;
    const totalTestimonials = testimonials.length;
    
    // Show only the first testimonial initially
    testimonials.forEach((testimonial, index) => {
        if (index !== 0) {
            testimonial.style.display = 'none';
        }
    });
    
    // Create navigation dots
    const sliderContainer = document.querySelector('.testimonial-slider');
    if (sliderContainer) {
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        
        for (let i = 0; i < totalTestimonials; i++) {
            const dot = document.createElement('button');
            dot.className = i === 0 ? 'dot active' : 'dot';
            dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        
        sliderContainer.appendChild(dotsContainer);
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            goToSlide(currentIndex);
        }, 5000);
    }
    
    function goToSlide(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
        
        // Update active dot
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.className = i === index ? 'dot active' : 'dot';
        });
        
        currentIndex = index;
    }
}

// Affiliate link tracking
function initAffiliateTracking() {
    const affiliateLinks = document.querySelectorAll('a[data-affiliate]');
    
    affiliateLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track click for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'affiliate_link_click', {
                    'affiliate_id': this.getAttribute('data-affiliate'),
                    'destination': this.href
                });
            }
            
            // Store click in localStorage for attribution
            const clickData = {
                affiliate: this.getAttribute('data-affiliate'),
                timestamp: new Date().toISOString(),
                url: this.href
            };
            
            localStorage.setItem('last_affiliate_click', JSON.stringify(clickData));
        });
    });
}

// Newsletter signup
function initNewsletterSignup() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showFormMessage(this, 'Por favor, introduce un email válido.', 'error');
                return;
            }
            
            // Simulate API call to subscribe
            setTimeout(() => {
                // Success simulation
                showFormMessage(this, '¡Gracias por suscribirte! Revisa tu email para confirmar.', 'success');
                emailInput.value = '';
                
                // Track signup
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'email_domain': email.split('@')[1]
                    });
                }
                
                // Check for affiliate attribution
                const affiliateData = localStorage.getItem('last_affiliate_click');
                if (affiliateData) {
                    // Would send this data to backend in real implementation
                    console.log('Affiliate attribution for signup:', JSON.parse(affiliateData));
                }
            }, 1000);
        });
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    function showFormMessage(form, message, type) {
        let messageElement = form.querySelector('.form-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            form.appendChild(messageElement);
        }
        
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        
        // Clear message after 5 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'form-message';
        }, 5000);
    }
}

// Lazy loading for images
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support native lazy loading
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        imageObserver.unobserve(image);
                    }
                });
            });
            
            lazyImages.forEach(image => {
                imageObserver.observe(image);
            });
        } else {
            // Fallback for older browsers without IntersectionObserver
            let active = false;
            
            const lazyLoad = function() {
                if (active === false) {
                    active = true;
                    
                    setTimeout(() => {
                        lazyImages.forEach(lazyImage => {
                            if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                                lazyImage.src = lazyImage.dataset.src;
                                
                                lazyImages = lazyImages.filter(image => image !== lazyImage);
                                
                                if (lazyImages.length === 0) {
                                    document.removeEventListener("scroll", lazyLoad);
                                    window.removeEventListener("resize", lazyLoad);
                                    window.removeEventListener("orientationchange", lazyLoad);
                                }
                            }
                        });
                        
                        active = false;
                    }, 200);
                }
            };
            
            document.addEventListener("scroll", lazyLoad);
            window.addEventListener("resize", lazyLoad);
            window.addEventListener("orientationchange", lazyLoad);
            lazyLoad();
        }
    }
}

// Analytics initialization
function initAnalytics() {
    // This would be replaced with actual analytics code
    console.log('Analytics initialized');
    
    // Track page view
    trackPageView();
    
    // Track user engagement
    trackEngagement();
}

function trackPageView() {
    // Simulated analytics page view tracking
    const pageData = {
        title: document.title,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
    };
    
    console.log('Page view tracked:', pageData);
    
    // This would send data to analytics service in production
}

function trackEngagement() {
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track at thresholds
            if (maxScroll > 25 && maxScroll < 26) logEngagement('scroll_depth_25');
            if (maxScroll > 50 && maxScroll < 51) logEngagement('scroll_depth_50');
            if (maxScroll > 75 && maxScroll < 76) logEngagement('scroll_depth_75');
            if (maxScroll > 90 && maxScroll < 91) logEngagement('scroll_depth_90');
        }
    });
    
    // Track time on page
    let timeOnPage = 0;
    const timeInterval = setInterval(() => {
        timeOnPage += 10;
        
        // Track at intervals
        if (timeOnPage === 30) logEngagement('time_on_page_30s');
        if (timeOnPage === 60) logEngagement('time_on_page_1m');
        if (timeOnPage === 180) logEngagement('time_on_page_3m');
        if (timeOnPage === 300) {
            logEngagement('time_on_page_5m');
            clearInterval(timeInterval);
        }
    }, 10000);
    
    function logEngagement(metric) {
        console.log('Engagement tracked:', metric);
        // This would send data to analytics service in production
    }
}

// Domain sales inquiry form handler
function handleDomainInquiry(form, domainName) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = form.querySelector('input[name="name"]');
        const emailInput = form.querySelector('input[name="email"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !email || !message) {
            alert('Por favor, completa todos los campos del formulario.');
            return;
        }
        
        // Simulate form submission
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        setTimeout(() => {
            // Success simulation
            alert(`¡Gracias por tu interés en ${domainName}! Te contactaremos pronto.`);
            form.reset();
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            // Track inquiry
            if (typeof gtag !== 'undefined') {
                gtag('event', 'domain_inquiry', {
                    'domain_name': domainName
                });
            }
        }, 1500);
    });
}

// Initialize domain inquiry forms when available
document.addEventListener('DOMContentLoaded', function() {
    const domainForms = document.querySelectorAll('.domain-inquiry-form');
    
    domainForms.forEach(form => {
        const domainName = form.getAttribute('data-domain');
        if (domainName) {
            handleDomainInquiry(form, domainName);
        }
    });
});
