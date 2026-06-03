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

// Close mobile menu when a nav link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
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
            window.scrollTo({
                top: targetElement.offsetTop - 100, // Account for fixed header
                behavior: 'smooth'
            });
        }
    });
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

    const paths = {
        'drop': new Path2D('M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z'),
        'lightning': new Path2D('M 13 2 L 3 14 L 12 14 L 11 22 L 21 10 L 12 10 Z'),
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
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function generateShapePoints() {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const oCtx = offCanvas.getContext('2d', { willReadFrequently: true });
        
        const targetSize = Math.max(250, Math.min(width, height) * 0.35); // Card-sized footprint
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
                oCtx.lineWidth = 1.5;
                oCtx.strokeStyle = 'rgba(255, 0, 0, 1)';
                oCtx.stroke(pathKeys[key].path);
            }
            oCtx.restore();
            
            const imageData = oCtx.getImageData(0, 0, width, height).data;
            const points = [];
            
            const step = Math.max(3, Math.floor(width / 300)); 
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

            let dxM = mouse.x - this.x;
            let dyM = mouse.y - this.y;
            let distance = Math.sqrt(dxM * dxM + dyM * dyM);
            let repelX = 0;
            let repelY = 0;
            
            if (mouse.x !== null && distance < mouse.radius) {
                let forceDirectionX = dxM / distance;
                let forceDirectionY = dyM / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                // Stronger repel so mouse interaction is distinctly noticeable
                let repelStrength = isFormed ? (this.density * 1.5) : (this.density * 3.5);
                repelX = -forceDirectionX * force * repelStrength;
                repelY = -forceDirectionY * force * repelStrength;
            }
            
            this.floatAngle += this.floatSpeed;
            // Reduce floating distance when formed for tighter shape
            let activeFloatRadius = isFormed ? (this.floatRadius * 0.3) : this.floatRadius;
            const floatOffsetX = Math.cos(this.floatAngle) * activeFloatRadius;
            const floatOffsetY = Math.sin(this.floatAngle) * activeFloatRadius;
            
            let finalDestX = destX + floatOffsetX + repelX;
            let finalDestY = destY + floatOffsetY + repelY;

            let baseGatherSpeed = isFormed ? 0.18 : 0.08;
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
        generateShapePoints(); 
        particles = [];
        // Dynamically scale number of particles based on screen area so it fills the screen perfectly no matter the aspect ratio!
        let numParticles = Math.floor((width * height) / 2500);
        numParticles = Math.min(Math.max(numParticles, 400), 1500); // Keep it performant
        
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
            hoveredCard = card;
            if (card.classList.contains('plumbing')) currentShape = 'plumbing';
            if (card.classList.contains('heating')) {
                currentShape = card.classList.contains('climate-cold') ? 'heating_snow' : 'heating_flame';
                const video = card.querySelector('.frost-video');
                if (video && card.classList.contains('climate-cold')) {
                    video.currentTime = 0;
                    video.play().catch(err => console.log('Video play interrupted:', err));
                }
            }
            if (card.classList.contains('electrical')) currentShape = 'electrical';
        });
        
        card.addEventListener('mouseleave', () => {
            hoveredCard = null;
            currentShape = null; 
            if (card.classList.contains('heating')) {
                const video = card.querySelector('.frost-video');
                if (video) {
                    video.pause();
                }
            }
        });
    });
}

// --- WEATHER WIDGET LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    async function initWeatherWidget() {
        try {
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
                const display = document.getElementById('tempDisplay');
                const fluid = document.querySelector('.thermo-fluid');
                const heatingCard = document.querySelector('.heating');
                
                if (display && fluid) {
                    display.textContent = `${Math.round(temp)}°C`;
                    
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
        } catch (e) {
            console.error('Weather widget failed:', e);
        }
    }
    initWeatherWidget();

    function initDashboard() {
        const dashboard = document.querySelector('.compact-dashboard');
        const selectors = document.querySelectorAll('.selector-btn');
        const canvas = document.getElementById('telemetry-wave');
        if (!dashboard || !selectors || !canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        function resizeCanvas() {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        // Force an initial layout sync
        setTimeout(resizeCanvas, 100);

        // Current telemetry mode
        let currentMode = 'plumbing';

        const profiles = {
            plumbing: {
                amplitude: 20,
                frequency: 0.015,
                speed: 0.05,
                color1: '#0088ff',
                noise: 0.05,
                type: 'sine',
                metrics: [
                    { label: 'FLOW RATE', val: 4.8, unit: ' GPM', variance: 0.3 },
                    { label: 'SYSTEM PRESSURE', val: 55.0, unit: ' PSI', variance: 1.5 }
                ]
            },
            heating: {
                amplitude: 25,
                frequency: 0.03,
                speed: 0.08,
                color1: '#ff4400',
                noise: 0.25,
                type: 'thermal',
                metrics: [
                    { label: 'BTU OUTPUT', val: 42500, unit: ' BTU/h', variance: 400 },
                    { label: 'ZONE TEMPERATURE', val: 21.4, unit: ' °C', variance: 0.2 }
                ]
            },
            electrical: {
                amplitude: 30,
                frequency: 0.04,
                speed: 0.12,
                color1: '#ffc000',
                noise: 0.4,
                type: 'pulse',
                metrics: [
                    { label: 'GRID LOAD', val: 12.8, unit: ' kW', variance: 0.6 },
                    { label: 'VOLTAGE', val: 240.2, unit: ' V', variance: 0.8 }
                ]
            }
        };

        // Smoothly interpolated values
        let currentAmp = profiles.plumbing.amplitude;
        let currentFreq = profiles.plumbing.frequency;
        let currentSpeed = profiles.plumbing.speed;
        let currentNoise = profiles.plumbing.noise;
        let color1 = profiles.plumbing.color1;

        let time = 0;

        // Fluctuating values representation
        let metricsState = [
            { val: 4.8 },
            { val: 55.0 }
        ];

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        // Interpolate colors
        function interpolateColor(colorA, colorB, factor) {
            const rgbA = hexToRgb(colorA);
            const rgbB = hexToRgb(colorB);
            if (!rgbA || !rgbB) return colorA;

            const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * factor);
            const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * factor);
            const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * factor);
            return `rgb(${r}, ${g}, ${b})`;
        }

        function drawWave() {
            ctx.clearRect(0, 0, width, height);

            time += currentSpeed;

            // Interpolate toward target profile values
            const target = profiles[currentMode];
            currentAmp += (target.amplitude - currentAmp) * 0.1;
            currentFreq += (target.frequency - currentFreq) * 0.1;
            currentSpeed += (target.speed - currentSpeed) * 0.1;
            currentNoise += (target.noise - currentNoise) * 0.1;
            color1 = interpolateColor(color1, target.color1, 0.1);
            
            // Draw gradient background wave fill
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let x = 0; x <= width; x += 2) {
                let y = height / 2;

                if (target.type === 'sine') {
                    y += Math.sin(x * currentFreq + time) * currentAmp;
                    y += Math.cos(x * (currentFreq * 0.5) - time * 0.5) * (currentAmp * 0.3);
                } else if (target.type === 'thermal') {
                    y += Math.sin(x * currentFreq + time) * currentAmp;
                    y += Math.sin(x * (currentFreq * 2) - time * 1.5) * (currentAmp * 0.25);
                    y += (Math.random() - 0.5) * currentAmp * currentNoise;
                } else if (target.type === 'pulse') {
                    let base = Math.sin(x * currentFreq + time);
                    let pulse = Math.sign(base) * Math.pow(Math.abs(base), 0.25);
                    y += pulse * currentAmp;
                    if (Math.sin(x * 0.1 + time * 3) > 0.8) {
                        y += (Math.random() - 0.5) * currentAmp * currentNoise * 2.5;
                    }
                }

                ctx.lineTo(x, y);
            }

            ctx.lineTo(width, height);
            ctx.closePath();

            ctx.fillStyle = grad;
            ctx.globalAlpha = 0.12;
            ctx.fill();

            // Draw line on top
            ctx.beginPath();
            for (let x = 0; x <= width; x += 2) {
                let y = height / 2;

                if (target.type === 'sine') {
                    y += Math.sin(x * currentFreq + time) * currentAmp;
                    y += Math.cos(x * (currentFreq * 0.5) - time * 0.5) * (currentAmp * 0.3);
                } else if (target.type === 'thermal') {
                    y += Math.sin(x * currentFreq + time) * currentAmp;
                    y += Math.sin(x * (currentFreq * 2) - time * 1.5) * (currentAmp * 0.25);
                    y += (Math.random() - 0.5) * currentAmp * currentNoise;
                } else if (target.type === 'pulse') {
                    let base = Math.sin(x * currentFreq + time);
                    let pulse = Math.sign(base) * Math.pow(Math.abs(base), 0.25);
                    y += pulse * currentAmp;
                    if (Math.sin(x * 0.1 + time * 3) > 0.8) {
                        y += (Math.random() - 0.5) * currentAmp * currentNoise * 2.5;
                    }
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = color1;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.85;
            ctx.stroke();

            requestAnimationFrame(drawWave);
        }

        // Fluctuate metrics data
        function updateMetrics() {
            const target = profiles[currentMode];
            target.metrics.forEach((m, idx) => {
                const labelEl = document.getElementById(`metric-label-${idx + 1}`);
                const valueEl = document.getElementById(`metric-value-${idx + 1}`);

                if (labelEl && valueEl) {
                    labelEl.textContent = m.label;
                    
                    const change = (Math.random() - 0.5) * m.variance;
                    metricsState[idx].val += change;
                    
                    const minBound = m.val - m.variance * 5;
                    const maxBound = m.val + m.variance * 5;
                    metricsState[idx].val = Math.max(minBound, Math.min(maxBound, metricsState[idx].val));

                    let formattedVal = metricsState[idx].val;
                    if (m.val % 1 !== 0) {
                        formattedVal = formattedVal.toFixed(1);
                    } else {
                        formattedVal = Math.round(formattedVal);
                    }

                    valueEl.textContent = `${formattedVal}${m.unit}`;
                }
            });
        }

        const initialTarget = profiles[currentMode];
        metricsState[0].val = initialTarget.metrics[0].val;
        metricsState[1].val = initialTarget.metrics[1].val;
        updateMetrics();

        // Interval to fluctuate stats slightly
        setInterval(updateMetrics, 800);

        selectors.forEach(btn => {
            const handleModeChange = () => {
                const trade = btn.getAttribute('data-trade');
                if (trade === currentMode) return;

                selectors.forEach(s => s.classList.remove('active'));
                btn.classList.add('active');

                dashboard.className = `compact-dashboard mode-${trade}`;
                currentMode = trade;

                metricsState[0].val = profiles[trade].metrics[0].val;
                metricsState[1].val = profiles[trade].metrics[1].val;
                updateMetrics();
            };

            btn.addEventListener('click', handleModeChange);
            btn.addEventListener('mouseenter', handleModeChange);
        });

        drawWave();
    }
    initDashboard();
});
