// Initialize Lucide Icons
lucide.createIcons();

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const mobileToggle = document.getElementById('mobile-toggle');
mobileToggle.addEventListener('click', () => {
    navbar.classList.toggle('mobile-menu-active');
    
    // Swap icon based on state
    if (navbar.classList.contains('mobile-menu-active')) {
        mobileToggle.innerHTML = '<i data-lucide="x"></i>';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
        mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
        document.body.style.overflow = '';
    }
    lucide.createIcons();
});

// Mobile dropdown toggling and menu closing logic
document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    link.addEventListener('click', (e) => {
        // If on mobile (<= 768px) and clicking the dropdown toggle, toggle dropdown expansion instead of closing menu/navigating
        if (link.classList.contains('dropdown-toggle') && window.innerWidth <= 768) {
            e.preventDefault();
            const parent = link.closest('.nav-dropdown');
            if (parent) {
                parent.classList.toggle('active');
            }
            return;
        }
        
        // Otherwise, close the mobile menu on selection
        navbar.classList.remove('mobile-menu-active');
        mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
        document.body.style.overflow = '';
        lucide.createIcons();
    });
});

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve once animated
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Select all elements with fade-up class
const animateElements = document.querySelectorAll('.fade-up');
animateElements.forEach(el => observer.observe(el));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            if (targetId === '#services') {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } else {
                window.scrollTo({
                    top: targetElement.offsetTop - 100, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Center the services grid if navigated to with #services hash
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#services') {
        setTimeout(() => {
            const targetElement = document.querySelector('#services');
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 300);
    }
});

// ==========================================
// Particle Background Effect (Forming Trades)
// ==========================================
const canvas = document.getElementById('particles-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    let mouse = { x: null, y: null, radius: 250 };

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', function() {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('touchstart', function(e) {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', function(e) {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchend', function() {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('touchcancel', function() {
        mouse.x = null;
        mouse.y = null;
    });

    const paths = {
        'drop': new Path2D('M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'),
        'lightning': new Path2D('M 13 2 L 3 14 L 12 14 L 10.5 24 L 21 10 L 12 10 Z'),
        'flame': new Path2D('M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z')
    };

    const pathKeys = {
        'plumbing': { type: 'fill', path: paths.drop },
        'electrical': { type: 'fill', path: paths.lightning },
        'heating_flame': { type: 'fill', path: paths.flame },
        'heating_snow': { 
            type: 'stroke', 
            path: new Path2D('M2 12 L22 12 M12 2 L12 22 M20 16 L16 12 L20 8 M4 8 L8 12 L4 16 M16 4 L12 8 L8 4 M8 20 L12 16 L16 20')
        }
    };

    let shapeData = {
        'plumbing': [],
        'electrical': [],
        'heating_flame': [],
        'heating_snow': []
    };
    
    let currentShape = null; 

    function initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }

    function generateShapePoints() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const oCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        
        const targetSize = Math.max(180, Math.min(width, height) * 0.35); // Card-sized footprint
        const scale = targetSize / 24; 
        
        for (let key in pathKeys) {
            oCtx.clearRect(0, 0, width, height);
            oCtx.save();
            oCtx.translate(width / 2, height / 2);
            oCtx.scale(scale, scale);
            oCtx.translate(-12, -12);
            
            if (pathKeys[key].type === 'fill') {
                oCtx.fillStyle = 'rgba(255, 0, 0, 1)';
                oCtx.fill(pathKeys[key].path);
            } else if (pathKeys[key].type === 'stroke') {
                oCtx.lineCap = 'round';
                oCtx.lineJoin = 'round';
                oCtx.lineWidth = 2.0;
                oCtx.strokeStyle = 'rgba(255, 0, 0, 1)';
                oCtx.stroke(pathKeys[key].path);
            }
            oCtx.restore();
            
            const imageData = oCtx.getImageData(0, 0, width, height).data;
            const points = [];
            
            const step = Math.max(1, Math.floor(width / 350)); 
            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const idx = (y * width + x) * 4;
                    if (imageData[idx + 3] > 128) { // Extract points that have alpha > 128
                        points.push({x, y});
                    }
                }
            }
            points.sort(() => Math.random() - 0.5);
            shapeData[key] = points;
        }
    }

    class Particle {
        constructor(id, total) {
            this.id = id;
            this.shape = ['drop', 'lightning', 'flame'][Math.floor(Math.random() * 3)];
            
            this.originX = Math.random() * width;
            this.originY = Math.random() * height;
            this.x = this.originX;
            this.y = this.originY;
            this.speedX = 0;
            this.speedY = 0;
            
            this.floatAngle = Math.random() * Math.PI * 2;
            this.floatSpeed = Math.random() * 0.05 + 0.01;
            this.floatRadius = Math.random() * 10 + 2;
            
            this.baseSize = Math.random() * 2 + 1; // Pure small dot
            this.size = this.baseSize;
            this.density = (Math.random() * 30) + 1;
            this.baseOpacity = Math.random() * 0.4 + 0.1;
            this.opacity = this.baseOpacity;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(220, 220, 225, ${this.opacity})`; // Clean, crisp silver/grey
            ctx.fill();
            
            ctx.restore();
        }

        update(shapeKey, cX, cY) {
            let destX, destY;
            let isFormed = false;

            if (shapeKey !== null && shapeData[shapeKey] && shapeData[shapeKey].length > 0) {
                const targetPoint = shapeData[shapeKey][this.id % shapeData[shapeKey].length];
                let dx = targetPoint.x - (width / 2);
                let dy = targetPoint.y - (height / 2);
                
                destX = cX + dx;
                destY = cY + dy;
                isFormed = true;
            } else {
                destX = this.originX;
                destY = this.originY;
            }

            let repelX = 0;
            let repelY = 0;
            
            if (mouse.x !== null) {
                let dxM = mouse.x - this.x;
                let dyM = mouse.y - this.y;
                let distance = Math.sqrt(dxM * dxM + dyM * dyM);
                if (distance < mouse.radius) {
                    let forceDirectionX = dxM / distance;
                    let forceDirectionY = dyM / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    // Stronger repel so mouse interaction is distinctly noticeable
                    let repelStrength = isFormed ? (this.density * 1.5) : (this.density * 3.5);
                    repelX = -forceDirectionX * force * repelStrength;
                    repelY = -forceDirectionY * force * repelStrength;
                }
            }
            
            this.floatAngle += this.floatSpeed;
            // Reduce floating distance when formed for tighter shape
            let activeFloatRadius = isFormed ? (this.floatRadius * 0.3) : this.floatRadius;
            const floatOffsetX = Math.cos(this.floatAngle) * activeFloatRadius;
            const floatOffsetY = Math.sin(this.floatAngle) * activeFloatRadius;
            
            let finalDestX = destX + floatOffsetX + repelX;
            let finalDestY = destY + floatOffsetY + repelY;

            let baseGatherSpeed = isFormed ? (width < 768 ? 0.09 : 0.18) : 0.08;
            this.speedX = (finalDestX - this.x) * baseGatherSpeed;
            this.speedY = (finalDestY - this.y) * baseGatherSpeed;

            this.speedX *= 0.85;
            this.speedY *= 0.85;

            this.x += this.speedX;
            this.y += this.speedY;

            // Transition size and opacity
            let targetSize = isFormed ? 1.5 : this.baseSize;
            let targetOpacity = isFormed ? 0.9 : this.baseOpacity;
            this.size += (targetSize - this.size) * 0.15;
            this.opacity += (targetOpacity - this.opacity) * 0.15;
        }
    }

    function init() {
        initCanvas();
        const isTouch = !window.matchMedia('(pointer: fine)').matches;
        if (!isTouch && document.querySelectorAll('.service-card').length > 0) {
            generateShapePoints(); 
        }
        particles = [];
        // Dynamically scale number of particles based on screen area so it fills the screen perfectly no matter the aspect ratio!
        let numParticles = Math.floor((width * height) / 2500);
        const minCount = isTouch ? 120 : 400;
        const maxCount = isTouch ? 180 : 1500;
        numParticles = Math.min(Math.max(numParticles, minCount), maxCount); // Keep it performant
        
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(i, numParticles));
        }
    }

    let hoveredCard = null;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        let activeCenterX = width / 2;
        let activeCenterY = height / 2;
        
        if (hoveredCard) {
            let rect = hoveredCard.getBoundingClientRect();
            activeCenterX = rect.left + rect.width / 2;
            activeCenterY = rect.top + rect.height / 2;
        }

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(currentShape, activeCenterX, activeCenterY);
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function() {
        // Re-initialize the entire field so particles spawn across the newly expanded fullscreen dimensions
        init();
    });

    init();
    animate();

    const serviceCards = document.querySelectorAll('.service-card');
    
    // Set up hover triggers for services
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const isTouch = !window.matchMedia('(pointer: fine)').matches;
            if (isTouch) return;
            
            hoveredCard = card;
            canvas.style.zIndex = '12'; // Bring particles in front of frame to gather on cards
            if (card.classList.contains('plumbing')) currentShape = 'plumbing';
            if (card.classList.contains('heating')) {
                currentShape = card.classList.contains('climate-cold') ? 'heating_snow' : 'heating_flame';
                if (card.classList.contains('climate-cold')) {
                    const video = card.querySelector('.frost-video');
                    if (video) {
                        video.currentTime = 0;
                        video.play().catch(err => console.log('Video play interrupted:', err));
                    }
                } else {
                    const fireVideo = card.querySelector('.fire-video');
                    if (fireVideo) {
                        fireVideo.currentTime = 0;
                        fireVideo.play().catch(err => console.log('Video play interrupted:', err));
                    }
                }
            }
            if (card.classList.contains('electrical')) currentShape = 'electrical';
        });
        
        card.addEventListener('mouseleave', () => {
            const isTouch = !window.matchMedia('(pointer: fine)').matches;
            if (isTouch) return;
            
            hoveredCard = null;
            currentShape = null; 
            canvas.style.zIndex = '2'; // Put particles back behind frame and footer
            if (card.classList.contains('heating')) {
                const video = card.querySelector('.frost-video');
                if (video) {
                    video.pause();
                }
                const fireVideo = card.querySelector('.fire-video');
                if (fireVideo) {
                    fireVideo.pause();
                }
            }
        });
    });
}

// --- WEATHER WIDGET LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    function updateWeatherUI(temp) {
        const display = document.getElementById('tempDisplay');
        const fluid = document.querySelector('.thermo-fluid');
        const heatingCard = document.querySelector('.heating');
        
        if (display) {
            display.textContent = `${Math.round(temp)}°C`;
        }
        
        if (fluid) {
            // Map scale: -30C is completely empty, +35C is completely full
            let boundedTemp = Math.max(-30, Math.min(35, temp));
            let fillPct = ((boundedTemp + 30) / 65) * 100;
            let emptyPct = 100 - fillPct;
            
            // Color mapping: frozen blue -> mild green -> warm yellow -> hot orange
            let color = '#2AB2E2';
            if (temp > 25) color = '#F24C27'; 
            else if (temp > 10) color = '#FFB800'; 
            else if (temp > 0)  color = '#4caf50'; 
            
            // Trigger custom CSS animation values after a short delay
            setTimeout(() => {
                fluid.style.setProperty('--temp-empty-pct', `${emptyPct}%`);
                fluid.style.setProperty('--temp-color', color);
            }, 500);
        }

        // Inject reversed climate state: Fire to combat the freeze, Frost to combat the heat!
        if (heatingCard) {
            if (temp <= 0) {
                heatingCard.classList.add('climate-hot'); // Below Freezing -> Fire
                if (typeof currentShape !== 'undefined' && currentShape && currentShape.startsWith('heating')) {
                    currentShape = 'heating_flame';
                }
            } else {
                heatingCard.classList.add('climate-cold'); // Above Freezing -> Frost
                if (typeof currentShape !== 'undefined' && currentShape && currentShape.startsWith('heating')) {
                    currentShape = 'heating_snow';
                }
            }
        }
    }

    async function initWeatherWidget() {
        try {
            // Try to load cached weather from sessionStorage first
            const cachedWeather = sessionStorage.getItem('ss_weather_cache');
            if (cachedWeather) {
                try {
                    const cache = JSON.parse(cachedWeather);
                    const cacheAge = Date.now() - cache.timestamp;
                    // Cache duration: 30 minutes
                    if (cacheAge < 30 * 60 * 1000 && typeof cache.temp === 'number') {
                        updateWeatherUI(cache.temp);
                        return;
                    }
                } catch (e) {
                    console.log("Failed to parse cached weather, fetching fresh data.");
                }
            }

            // Geographic Fallback (Winnipeg)
            let lat = 49.8844;
            let lon = -97.1470;
            
            try {
                // Attempt to grab the local visitor's precise geographic location via IP!
                const locRes = await fetch('https://ipapi.co/json/');
                if (locRes.ok) {
                    const locData = await locRes.json();
                    if (locData && locData.latitude && locData.longitude) {
                        lat = locData.latitude;
                        lon = locData.longitude;
                    }
                }
            } catch (err) {
                console.log("IP geolocation failed (adblocker/network). Proceeding with default coords.");
            }

            // Fetch live local weather dynamically 
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            if (data && data.current_weather) {
                const temp = data.current_weather.temperature;
                updateWeatherUI(temp);
                // Save to sessionStorage cache
                sessionStorage.setItem('ss_weather_cache', JSON.stringify({
                    temp: temp,
                    timestamp: Date.now()
                }));
            }
        } catch (e) {
            console.error('Weather widget failed:', e);
        }
    }
    initWeatherWidget();

    function initMapCycling() {
        const mapContainer = document.querySelector('.map-visual-container');
        const hudTags = document.querySelectorAll('.hud-icon-tag');
        if (!mapContainer) return;

        const modes = ['plumbing', 'heating', 'electrical'];
        let currentIndex = 0;
        let cycleInterval;

        function setMode(mode) {
            modes.forEach(m => {
                mapContainer.classList.remove(`mode-${m}`);
            });
            mapContainer.classList.add(`mode-${mode}`);

            hudTags.forEach(tag => {
                if (tag.getAttribute('data-trade') === mode) {
                    tag.classList.add('active');
                } else {
                    tag.classList.remove('active');
                }
            });
        }

        function startInterval() {
            cycleInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % modes.length;
                setMode(modes[currentIndex]);
            }, 3500);
        }

        startInterval();

        hudTags.forEach((tag, index) => {
            tag.style.pointerEvents = 'auto';
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                clearInterval(cycleInterval);
                currentIndex = index;
                setMode(modes[currentIndex]);
                startInterval();
            });
            tag.addEventListener('mouseenter', () => {
                clearInterval(cycleInterval);
                currentIndex = index;
                setMode(modes[currentIndex]);
            });
            tag.addEventListener('mouseleave', () => {
                clearInterval(cycleInterval);
                startInterval();
            });
        });

        setMode(modes[currentIndex]);
    }
    initMapCycling();

    // --- CERTIFICATIONS MODAL LOGIC ---
    const openCertModal = document.getElementById('open-cert-modal');
    const certModal = document.getElementById('cert-modal');
    const closeCertModalX = document.getElementById('close-modal-x');
    const closeCertModalOverlay = document.getElementById('close-modal-overlay');

    if (openCertModal && certModal) {
        const openModal = () => {
            certModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
        };
        const closeModal = () => {
            certModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        openCertModal.addEventListener('click', openModal);
        closeCertModalX.addEventListener('click', closeModal);
        closeCertModalOverlay.addEventListener('click', closeModal);

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && certModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // --- MAKE PAYMENT MODAL LOGIC ---
    const initPaymentModal = () => {
        // Create modal container dynamically
        const modalContainer = document.createElement('div');
        modalContainer.className = 'payment-modal';
        modalContainer.id = 'payment-coming-soon-modal';
        
        modalContainer.innerHTML = `
            <div class="payment-modal-overlay"></div>
            <div class="payment-modal-content">
                <button class="payment-modal-close-btn">&times;</button>
                <h3 class="payment-modal-title">Online Payment</h3>
                <div class="payment-modal-body">
                    <p style="margin-bottom: 1.25rem; font-weight: 600; color: #fef08a;">Online payment coming soon!</p>
                    <p>Please call us at <strong><a href="tel:2042220723" style="color: #ff5a1f; text-decoration: none;">204.222.0723</a></strong> or email <strong><a href="mailto:accountsreceivable@ssplumbing.ca" style="color: #38bdf8; text-decoration: none;">accountsreceivable@ssplumbing.ca</a></strong> with the proper information to complete your payment.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalContainer);
        
        const overlay = modalContainer.querySelector('.payment-modal-overlay');
        const closeBtn = modalContainer.querySelector('.payment-modal-close-btn');
        
        const showModal = (e) => {
            e.preventDefault();
            modalContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        
        const hideModal = () => {
            modalContainer.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        // Find all "Make Payment" nav buttons on the page
        const payBtns = Array.from(document.querySelectorAll('a, button')).filter(el => 
            el.textContent.trim().toLowerCase() === 'make payment'
        );
        
        payBtns.forEach(btn => {
            btn.addEventListener('click', showModal);
        });
        
        closeBtn.addEventListener('click', hideModal);
        overlay.addEventListener('click', hideModal);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
                hideModal();
            }
        });
    };
    initPaymentModal();

    // --- CONTACT FORM AJAX SUBMISSION ---
    const contactForms = document.querySelectorAll('.contact-form');
    contactForms.forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            
            const formData = new FormData(form);
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    form.innerHTML = `
                        <div class="form-success-message" style="text-align: center; padding: 3rem 1rem;">
                            <i data-lucide="check-circle" style="color: #10b981; width: 64px; height: 64px; margin-bottom: 1.5rem; filter: drop-shadow(0 0 10px rgba(16,185,129,0.5));"></i>
                            <h3 style="color: var(--white); font-size: 1.8rem; margin-bottom: 1rem;">Thank You!</h3>
                            <p style="color: var(--silver); font-size: 1.1rem; line-height: 1.6;">Your request has been sent successfully. We will get back to you shortly.</p>
                        </div>
                    `;
                    lucide.createIcons();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                alert('Oops! There was a problem submitting your form. Please try again or call us directly at 204.222.0723.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    });

    // --- CONTACT FORM PRE-FILL FROM QUERY PARAMETERS ---
    const prefillContactForm = () => {
        if (!window.location.pathname.includes('contact.html')) return;
        
        const params = new URLSearchParams(window.location.search);
        const tradeParam = params.get('trade'); // e.g. 'plumbing', 'heating', 'electrical'
        const serviceParam = params.get('service'); // e.g. 'Bathroom & Kitchen Renovations'
        
        if (tradeParam) {
            const selectEl = document.getElementById('serviceType');
            if (selectEl) {
                selectEl.value = tradeParam;
            }
        }
        
        if (serviceParam) {
            const messageEl = document.getElementById('message');
            if (messageEl) {
                messageEl.value = `Hello! I would like to request service or get a quote for: "${serviceParam}".\n\n[Please add details here]`;
            }
        }
    };
    prefillContactForm();

    // --- DYNAMIC STATUS WIDGET LOGIC ---
    const updateDynamicStatusWidget = () => {
        const widget = document.getElementById('map-status-widget');
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        const img = document.getElementById('status-van-img');
        
        if (!widget || !dot || !text || !img) return;

        const isWinnipegOperatingHours = () => {
            try {
                // Get current date/time in Winnipeg timezone
                const options = { timeZone: "America/Winnipeg", hour12: false, weekday: 'short', hour: 'numeric', minute: 'numeric' };
                const formatter = new Intl.DateTimeFormat('en-US', options);
                const parts = formatter.formatToParts(new Date());
                
                let weekday = "";
                let hour = 0;
                let minute = 0;
                
                for (const part of parts) {
                    if (part.type === 'weekday') weekday = part.value;
                    if (part.type === 'hour') hour = parseInt(part.value, 10);
                    if (part.type === 'minute') minute = parseInt(part.value, 10);
                }
                
                // Check if weekday is Mon, Tue, Wed, Thu, or Fri
                const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday);
                
                // Check if time is between 8:00 and 16:30 (4:30 PM)
                const timeInMinutes = hour * 60 + minute;
                const isBetweenHours = timeInMinutes >= (8 * 60) && timeInMinutes <= (16 * 60 + 30);
                
                return isWeekday && isBetweenHours;
            } catch (e) {
                // Fallback to local browser time if timezone formatting is not supported
                const now = new Date();
                const day = now.getDay();
                const hours = now.getHours();
                const mins = now.getMinutes();
                const isWeekday = day >= 1 && day <= 5;
                const timeInMinutes = hours * 60 + mins;
                return isWeekday && timeInMinutes >= (8 * 60) && timeInMinutes <= (16 * 60 + 30);
            }
        };

        if (isWinnipegOperatingHours()) {
            dot.className = 'status-dot green';
            text.textContent = 'Ready to Serve You';
        } else {
            dot.className = 'status-dot red';
            text.textContent = '24/7 Emergency Service';
        }
        img.style.display = 'block';
        img.style.opacity = '1';
    };
    updateDynamicStatusWidget();
});
