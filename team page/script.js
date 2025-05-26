// Galaxy Background Effect using Three.js
class GalaxyBackground {
    constructor() {
        this.canvas = document.getElementById('galaxyCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.galaxyGroup = null;
        this.galaxyPoints = null;
        this.galaxyGeometry = null;
        this.galaxyMaterial = null;
        this.ambientStars = null;
        this.shootingStars = [];
        this.animationId = null;
        this.clock = new THREE.Clock();
        this.time = 0;
        
        this.parameters = {
            count: 80000,
            size: 0.015,
            radius: 6,
            branches: 4,
            spin: 1.2,
            randomness: 0.3,
            randomnessPower: 2.5,
            insideColor: "#ff6030",
            outsideColor: "#1b3984",
            rotationSpeed: 0.05,
            pulseSpeed: 0.3,
            pulseIntensity: 0.1,
        };
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.galaxyGroup = new THREE.Group();
        this.scene.add(this.galaxyGroup);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(4, 4, 4);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor("#000000", 1);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;
        this.controls.enablePan = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        
        // Generate galaxy and stars
        this.generateGalaxy();
        this.generateAmbientStars();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Shooting star interval
        setInterval(() => {
            if (Math.random() > 0.8) {
                this.createShootingStar();
            }
            this.cleanupShootingStars();
        }, 3000);
    }
    
    generateGalaxy() {
        // Dispose old galaxy
        if (this.galaxyPoints !== null) {
            this.galaxyGeometry?.dispose();
            this.galaxyMaterial?.dispose();
            this.galaxyGroup.remove(this.galaxyPoints);
        }
        
        // Geometry
        this.galaxyGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.parameters.count * 3);
        const colors = new Float32Array(this.parameters.count * 3);
        
        const colorInside = new THREE.Color(this.parameters.insideColor);
        const colorOutside = new THREE.Color(this.parameters.outsideColor);
        
        for (let i = 0; i < this.parameters.count; i++) {
            const i3 = i * 3;
            
            // Position
            const radius = Math.random() * this.parameters.radius;
            const spinAngle = radius * this.parameters.spin;
            const branchAngle = ((i % this.parameters.branches) / this.parameters.branches) * Math.PI * 2;
            
            const randomX = Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) * this.parameters.randomness * radius;
            const randomY = Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) * this.parameters.randomness * radius;
            const randomZ = Math.pow(Math.random(), this.parameters.randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) * this.parameters.randomness * radius;
            
            positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
            positions[i3 + 1] = randomY;
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
            
            // Color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / this.parameters.radius);
            
            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }
        
        this.galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // Material
        this.galaxyMaterial = new THREE.PointsMaterial({
            size: this.parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
        });
        
        // Points
        this.galaxyPoints = new THREE.Points(this.galaxyGeometry, this.galaxyMaterial);
        this.galaxyGroup.add(this.galaxyPoints);
    }
    
    generateAmbientStars() {
        const count = 3000;
        const radius = 50;
        
        const starsGeometry = new THREE.BufferGeometry();
        const starsPositions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius;
            
            starsPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
            starsPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starsPositions[i3 + 2] = r * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 0.1,
            sizeAttenuation: true,
            color: "#ffffff",
            transparent: true,
            opacity: 0.6,
        });
        
        this.ambientStars = new THREE.Points(starsGeometry, starsMaterial);
        this.galaxyGroup.add(this.ambientStars);
    }
    
    createShootingStar() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 25;
        
        const position = new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
        
        const direction = new THREE.Vector3(
            -position.x + (Math.random() - 0.5) * 10,
            -position.y + (Math.random() - 0.5) * 10,
            -position.z + (Math.random() - 0.5) * 10
        ).normalize();
        
        // Create star head
        const starGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.position.copy(position);
        
        // Create trail
        const trailGeometry = new THREE.BufferGeometry();
        const trailPositions = new Float32Array(15 * 3);
        
        for (let i = 0; i < 15; i++) {
            const i3 = i * 3;
            trailPositions[i3] = position.x - i * 0.15 * direction.x;
            trailPositions[i3 + 1] = position.y - i * 0.15 * direction.y;
            trailPositions[i3 + 2] = position.z - i * 0.15 * direction.z;
        }
        
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
        
        const trailMaterial = new THREE.PointsMaterial({
            size: 0.12,
            sizeAttenuation: true,
            color: "#ffffff",
            transparent: true,
            opacity: 0.7,
        });
        
        const trail = new THREE.Points(trailGeometry, trailMaterial);
        
        const shootingStar = new THREE.Group();
        shootingStar.add(starMesh);
        shootingStar.add(trail);
        shootingStar.userData.direction = direction;
        shootingStar.userData.active = true;
        
        this.scene.add(shootingStar);
        this.shootingStars.push(shootingStar);
    }
    
    cleanupShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            if (!this.shootingStars[i].userData.active) {
                this.scene.remove(this.shootingStars[i]);
                this.shootingStars.splice(i, 1);
            }
        }
    }
    
    animate() {
        const delta = this.clock.getDelta();
        this.time += delta;
        
        // Update controls
        this.controls.update();
        
        // Rotate the galaxy
        this.galaxyGroup.rotation.y += delta * this.parameters.rotationSpeed;
        
        // Pulse effect
        const pulse = Math.sin(this.time * this.parameters.pulseSpeed) * this.parameters.pulseIntensity;
        this.galaxyGroup.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        
        // Update shooting stars
        for (const star of this.shootingStars) {
            if (star.userData.active) {
                star.position.x += star.userData.direction.x * delta * 25;
                star.position.y += star.userData.direction.y * delta * 25;
                star.position.z += star.userData.direction.z * delta * 25;
                
                const distanceFromCenter = star.position.length();
                if (distanceFromCenter < 2) {
                    star.userData.active = false;
                }
            }
        }
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.galaxyGeometry?.dispose();
        this.galaxyMaterial?.dispose();
        this.ambientStars?.geometry.dispose();
        this.ambientStars?.material.dispose();
        
        this.shootingStars.forEach((star) => {
            this.scene.remove(star);
        });
        
        this.controls.dispose();
        this.renderer.dispose();
    }
}

// Particle Animation for Team Cards
class ParticleAnimation {
    constructor() {
        this.initParticles();
    }
    
    initParticles() {
        const teamCards = document.querySelectorAll('.team-card');
        
        teamCards.forEach((card, cardIndex) => {
            const particlesContainer = card.querySelector('.particles');
            
            // Create particles
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random position
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                
                // Random animation delay
                particle.style.animationDelay = Math.random() * 3 + 's';
                particle.style.animationDuration = (4 + Math.random() * 2) + 's';
                
                particlesContainer.appendChild(particle);
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize galaxy background
    const galaxy = new GalaxyBackground();
    
    // Initialize particle animations
    const particles = new ParticleAnimation();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        galaxy.dispose();
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Add smooth scroll behavior if needed
    });
});

// Add hover effects for team cards
document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
    });
});