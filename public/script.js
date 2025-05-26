// 3D Background Animation
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;

const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Materials
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0x4e54ff,
    transparent: true,
    opacity: 0.8
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Animation
function animate() {
    requestAnimationFrame(animate);
    particlesMesh.rotation.x += 0.00005;
    particlesMesh.rotation.y += 0.0001;
    renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');
const closeMenu = document.querySelector('.close-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

function closeMenuFunction() {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

closeMenu.addEventListener('click', closeMenuFunction);
overlay.addEventListener('click', closeMenuFunction);

mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenuFunction);
});

// Scroll down button
const scrollDownBtn = document.querySelector('.scroll-down');
scrollDownBtn.addEventListener('click', () => {
    const featuresSection = document.getElementById('features');
    featuresSection.scrollIntoView({ behavior: 'smooth' });
});

// Smooth scrolling for all navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Login card animations with GSAP
const parkerCard = document.getElementById('parker-card');
const orgCard = document.getElementById('org-card');

gsap.from([parkerCard, orgCard], {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.3,
    delay: 0.5,
    ease: "power3.out"
});

// Feature cards animation on scroll
const featureCards = document.querySelectorAll('.feature-card');

function checkCards() {
    const triggerBottom = window.innerHeight * 0.8;

    featureCards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;

        if (cardTop < triggerBottom) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
        }
    });
}

// Set initial state for feature cards
featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', checkCards);

// Form submission handling
const contactForm = document.querySelector('.contact-form form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Simple validation
    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields');
        return;
    }

    // In a real application, you would send this data to a server
    console.log('Form submitted:', { name, email, subject, message });

    // Reset form
    contactForm.reset();

    // Show success message (you could replace this with a more elegant UI feedback)
    alert('Message sent successfully! We will get back to you soon.');
});

// Initialize the page animations
window.addEventListener('load', () => {
    // Hero content animation
    gsap.from('.hero h1', { duration: 1, y: -50, opacity: 0, ease: "power3.out" });
    gsap.from('.hero p', { duration: 1, y: -30, opacity: 0, delay: 0.3, ease: "power3.out" });

    // Check for feature cards visibility on initial load
    checkCards();
});

// Add this code to your existing JavaScript, just before the end of your file

// Enhanced hover animations for feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    // Create random float values for subtle idle animations
    const randomDuration = 2 + Math.random() * 2; // Between 2-4 seconds
    const randomDelay = Math.random() * 2; // Between 0-2 seconds

    // Create subtle "floating" effect when not hovered
    gsap.to(card, {
        y: -5,
        duration: randomDuration,
        delay: randomDelay,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Add hover animations
    card.addEventListener('mouseenter', () => {
        // Stop the floating animation
        gsap.killTweensOf(card);

        // Create a timeline for hover animations
        const tl = gsap.timeline();

        tl.to(card, {
            scale: 1.05,
            y: -15,
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            duration: 0.4,
            ease: "power2.out"
        });

        // Animate the icon
        const icon = card.querySelector('i');
        tl.to(icon, {
            scale: 1.3,
            rotation: 5,
            duration: 0.5,
            color: "#00e5ff",
            ease: "elastic.out(1, 0.3)"
        }, "-=0.3");

        // Animate the heading
        const heading = card.querySelector('h3');
        tl.to(heading, {
            y: -5,
            color: "#00e5ff",
            duration: 0.3,
            ease: "power1.out"
        }, "-=0.4");

        // Create a particle burst effect
        if (!card.querySelector('.particles-container')) {
            const particlesContainer = document.createElement('div');
            particlesContainer.className = 'particles-container';
            particlesContainer.style.position = 'absolute';
            particlesContainer.style.top = '0';
            particlesContainer.style.left = '0';
            particlesContainer.style.width = '100%';
            particlesContainer.style.height = '100%';
            particlesContainer.style.pointerEvents = 'none';
            particlesContainer.style.zIndex = '3';
            card.appendChild(particlesContainer);

            // Create particles
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.borderRadius = '50%';
                particle.style.backgroundColor = '#00e5ff';
                particle.style.opacity = '0';
                particle.style.top = '50%';
                particle.style.left = '50%';
                particlesContainer.appendChild(particle);

                // Animate each particle
                gsap.to(particle, {
                    x: (Math.random() - 0.5) * 80,
                    y: (Math.random() - 0.5) * 80,
                    opacity: Math.random() * 0.7,
                    scale: Math.random() * 3,
                    duration: 0.8 + Math.random() * 0.6,
                    onComplete: () => {
                        gsap.to(particle, {
                            opacity: 0,
                            duration: 0.4
                        });
                    }
                });
            }
        }
    });

    // Reset animations on mouse leave
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            scale: 1,
            y: 0,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Restart the subtle floating animation
                gsap.to(card, {
                    y: -5,
                    duration: randomDuration,
                    delay: randomDelay,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });

        // Reset icon and heading
        const icon = card.querySelector('i');
        gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            clearProps: "color",
            ease: "power1.inOut"
        });

        const heading = card.querySelector('h3');
        gsap.to(heading, {
            y: 0,
            clearProps: "color",
            duration: 0.3,
            ease: "power1.inOut"
        });

        // Remove particles container
        setTimeout(() => {
            const particlesContainer = card.querySelector('.particles-container');
            if (particlesContainer) {
                particlesContainer.remove();
            }
        }, 1000);
    });
});