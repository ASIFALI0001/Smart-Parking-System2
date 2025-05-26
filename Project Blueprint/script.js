// Global variables
let scene, camera, renderer, particles;
let flowchartExpanded = false;
let activeNode = null;
let activeTab = 'hardware';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initCustomCursor();
    initThreeJS();
    initFlowchart();
    initFeatures();
    initImplementation();
    initScrollAnimations();
    initLucideIcons();
});

// Custom cursor functionality
function initCustomCursor() {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!cursorDot || !cursorRing) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth cursor movement
        dotX += (mouseX - dotX) * 0.8;
        dotY += (mouseY - dotY) * 0.8;
        ringX += (mouseX - ringX) * 0.3;
        ringY += (mouseY - ringY) * 0.3;

        cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;
        cursorRing.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}

// Three.js initialization
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create particle system
    createParticles();

    // Create floating objects
    createFloatingObjects();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4f46e5, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 5;

    // Animation loop
    animate();

    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        colors[i] = 0.3 + Math.random() * 0.7;
        colors[i + 1] = 0.3 + Math.random() * 0.7;
        colors[i + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createFloatingObjects() {
    // Create floating geometric shapes
    const geometries = [
        new THREE.IcosahedronGeometry(0.5, 1),
        new THREE.OctahedronGeometry(0.4),
        new THREE.TetrahedronGeometry(0.6)
    ];

    const colors = [0x4f46e5, 0x06b6d4, 0x8b5cf6];

    for (let i = 0; i < 3; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: colors[i],
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });

        const mesh = new THREE.Mesh(geometries[i], material);
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5
        );

        mesh.userData = {
            rotationSpeed: Math.random() * 0.02 + 0.01,
            floatSpeed: Math.random() * 0.01 + 0.005
        };

        scene.add(mesh);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate particles
    if (particles) {
        particles.rotation.y = time * 0.1;
        const positions = particles.geometry.attributes.position.array;

        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(time + i) * 0.01;
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Animate floating objects
    scene.children.forEach(child => {
        if (child.userData && child.userData.rotationSpeed) {
            child.rotation.x += child.userData.rotationSpeed;
            child.rotation.y += child.userData.rotationSpeed * 0.7;
            child.position.y += Math.sin(time * child.userData.floatSpeed) * 0.01;
        }
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Flowchart functionality
function initFlowchart() {
    const nodes = [
        { id: 'raspberry-pi', label: 'Raspberry Pi Hub', x: 50, y: 50, color: '#4f46e5', icon: 'server' },
        { id: 'sensors', label: 'IoT Sensors', x: 20, y: 30, color: '#06b6d4', icon: 'wifi' },
        { id: 'security', label: 'Security System', x: 80, y: 30, color: '#8b5cf6', icon: 'shield' },
        { id: 'dashboard', label: 'Dashboard UI', x: 50, y: 80, color: '#ec4899', icon: 'bar-chart-4' },
        { id: 'cloud', label: 'Cloud Storage', x: 20, y: 70, color: '#10b981', icon: 'cloud' },
        { id: 'environmental', label: 'Environmental Monitoring', x: 80, y: 70, color: '#f59e0b', icon: 'thermometer' }
    ];

    const connections = [
        { from: 'raspberry-pi', to: 'sensors', color: '#06b6d4' },
        { from: 'raspberry-pi', to: 'security', color: '#8b5cf6' },
        { from: 'raspberry-pi', to: 'dashboard', color: '#ec4899' },
        { from: 'raspberry-pi', to: 'cloud', color: '#10b981' },
        { from: 'raspberry-pi', to: 'environmental', color: '#f59e0b' },
        { from: 'sensors', to: 'dashboard', color: '#06b6d4' },
        { from: 'cloud', to: 'dashboard', color: '#10b981' },
        { from: 'security', to: 'dashboard', color: '#8b5cf6' },
        { from: 'environmental', to: 'dashboard', color: '#f59e0b' }
    ];

    const nodeDetails = {
        'raspberry-pi': {
            title: 'Raspberry Pi Hub',
            description: 'Acts as the main controller for all parking-related operations.',
            features: [
                'Collects data from sensors (ultrasonic, IR, flame)',
                'Controls buzzer alarms and access mechanisms',
                'Handles cloud sync and MQTT messaging',
                'Connects with dashboard and mobile devices'
            ]
        },
        'sensors': {
            title: 'IoT Sensors',
            description: 'A combination of sensors enabling accurate parking slot detection.',
            features: [
                'Ultrasonic sensors for slot status (occupied/vacant)',
                'IR sensors for entry/exit detection',
                'Flame sensors for fire detection',
                'Buzzer activation on threshold triggers'
            ]
        },
        'security': {
            title: 'Security System',
            description: 'Helps safeguard the parking lot using multiple entry mechanisms.',
            features: [
                'IR entry/exit tracking',
                'Gate control via Raspberry Pi',
                'Optional facial recognition / camera module',
                'Real-time intrusion alerts'
            ]
        },
        'dashboard': {
            title: 'Dashboard UI',
            description: 'Visual interface for real-time monitoring and interaction.',
            features: [
                'Color-coded parking slot status',
                'Live alerts for fire or entry activity',
                'Mobile responsive and interactive',
                'Booking/reservation options'
            ]
        },
        'cloud': {
            title: 'Cloud Storage',
            description: 'Stores all sensor logs and occupancy data for reporting.',
            features: [
                'Firebase or MongoDB integration',
                'Data backup and analytics',
                'Accessible from any device',
                'Helps in load forecasting'
            ]
        },
        'environmental': {
            title: 'Environmental Monitoring',
            description: 'Sensors for environmental safety inside the parking area.',
            features: [
                'Flame sensors for early fire detection',
                'Buzzer alert for smoke/heat/fire',
                'Temperature and humidity tracking',
                'Supports auto ventilation triggers'
            ]
        }
    };

    createFlowchartNodes(nodes);
    createFlowchartConnections(connections, nodes);

    // Store data globally for use in other functions
    window.flowchartData = { nodes, connections, nodeDetails };
}

function createFlowchartNodes(nodes) {
    const container = document.getElementById('flowchart-nodes');
    if (!container) return;

    container.innerHTML = '';

    nodes.forEach(node => {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'flowchart-node';
        nodeElement.style.left = `${node.x}%`;
        nodeElement.style.top = `${node.y}%`;
        nodeElement.dataset.nodeId = node.id;

        nodeElement.innerHTML = `
            <div class="node-header">
                <div class="node-icon" style="background-color: ${node.color}30;">
                    <i data-lucide="${node.icon}" style="color: ${node.color}; width: 16px; height: 16px;"></i>
                </div>
                <span class="node-label">${node.label}</span>
            </div>
        `;

        nodeElement.addEventListener('click', () => toggleNodeDetails(node.id));
        container.appendChild(nodeElement);
    });

    // Re-initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function createFlowchartConnections(connections, nodes) {
    const svg = document.getElementById('flowchart-svg');
    if (!svg) return;

    svg.innerHTML = '';

    connections.forEach((conn, index) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);

        if (!fromNode || !toNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${fromNode.x}%`);
        line.setAttribute('y1', `${fromNode.y}%`);
        line.setAttribute('x2', `${toNode.x}%`);
        line.setAttribute('y2', `${toNode.y}%`);
        line.setAttribute('stroke', conn.color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-opacity', '0.6');
        line.setAttribute('stroke-dasharray', flowchartExpanded ? '0' : '5,5');

        svg.appendChild(line);

        // Create animated particle
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('r', '3');
        particle.setAttribute('fill', conn.color);
        particle.setAttribute('opacity', '0.8');

        const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateX.setAttribute('attributeName', 'cx');
        animateX.setAttribute('values', `${fromNode.x}%;${toNode.x}%;${fromNode.x}%`);
        animateX.setAttribute('dur', '4s');
        animateX.setAttribute('repeatCount', 'indefinite');
        animateX.setAttribute('begin', `${index * 0.5}s`);

        const animateY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateY.setAttribute('attributeName', 'cy');
        animateY.setAttribute('values', `${fromNode.y}%;${toNode.y}%;${fromNode.y}%`);
        animateY.setAttribute('dur', '4s');
        animateY.setAttribute('repeatCount', 'indefinite');
        animateY.setAttribute('begin', `${index * 0.5}s`);

        particle.appendChild(animateX);
        particle.appendChild(animateY);
        svg.appendChild(particle);
    });
}

function toggleFlowchart() {
    const flowchart = document.getElementById('flowchart');
    const expandIcon = document.getElementById('expand-icon');
    const btnText = document.getElementById('flowchart-btn-text');

    flowchartExpanded = !flowchartExpanded;

    if (flowchartExpanded) {
        flowchart.classList.add('expanded');
        expandIcon.setAttribute('data-lucide', 'minimize');
        btnText.textContent = 'Simplify Diagram';
    } else {
        flowchart.classList.remove('expanded');
        expandIcon.setAttribute('data-lucide', 'maximize');
        btnText.textContent = 'Expand Diagram';
    }

    // Re-create connections with updated dash array
    if (window.flowchartData) {
        createFlowchartConnections(window.flowchartData.connections, window.flowchartData.nodes);
    }

    // Re-initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

function toggleNodeDetails(nodeId) {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    const detailsPanel = document.getElementById('node-details');

    if (!nodeElement || !detailsPanel || !window.flowchartData) return;

    // Remove active class from all nodes
    document.querySelectorAll('.flowchart-node').forEach(node => {
        node.classList.remove('active');
    });

    if (activeNode === nodeId) {
        // Hide details if clicking the same node
        activeNode = null;
        detailsPanel.style.display = 'none';
    } else {
        // Show details for new node
        activeNode = nodeId;
        nodeElement.classList.add('active');

        const nodeData = window.flowchartData.nodeDetails[nodeId];
        const nodeInfo = window.flowchartData.nodes.find(n => n.id === nodeId);

        detailsPanel.innerHTML = `
            <div class="node-details-header">
                <div class="node-details-icon" style="background-color: ${nodeInfo.color}20;">
                    <i data-lucide="${nodeInfo.icon}" style="color: ${nodeInfo.color}; width: 40px; height: 40px;"></i>
                </div>
                <div>
                    <h3 class="node-details-title" style="color: ${nodeInfo.color};">${nodeData.title}</h3>
                    <p class="node-details-description">${nodeData.description}</p>
                </div>
            </div>
            <h4 class="node-features-title">Key Features:</h4>
            <ul class="node-features-list">
                ${nodeData.features.map(feature => `
                    <li class="node-feature-item">
                        <div class="feature-dot" style="background-color: ${nodeInfo.color};"></div>
                        ${feature}
                    </li>
                `).join('')}
            </ul>
        `;

        detailsPanel.style.display = 'block';

        // Re-initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Features section
function initFeatures() {
    const featuresData = [
        {
            title: 'Real-Time Detection',
            description: 'Ultrasonic sensors continuously monitor parking spaces with near-zero latency updates',
            icon: 'activity',
            color: '#3b82f6',
            details: [
                'HC-SR04 ultrasonic sensors',
                'Distance-based vehicle detection',
                'Instant status updates',
                '99.9% accuracy rate'
            ]
        },
        {
            title: 'Wireless Data Transmission',
            description: 'Seamless communication between sensors and web dashboard via Wi-Fi connectivity',
            icon: 'wifi',
            color: '#10b981',
            details: [
                'Wi-Fi enabled Raspberry Pi',
                'MQTT protocol communication',
                'Cloud database sync',
                'Remote monitoring'
            ]
        },
        {
            title: 'Interactive Dashboard',
            description: 'User-friendly web interface displaying real-time parking availability with visual indicators',
            icon: 'bar-chart-4',
            color: '#f59e0b',
            details: [
                'Color-coded slot status',
                'Mobile responsive design',
                'Real-time data visualization',
                'Multi-device accessibility'
            ]
        },
        {
            title: 'Scalable Architecture',
            description: 'Modular system design allowing easy addition or removal of parking slots',
            icon: 'layers',
            color: '#ef4444',
            details: [
                'Modular sensor deployment',
                'Easy slot configuration',
                'Expandable to multiple lots',
                'Future-proof design'
            ]
        },
        {
            title: 'Cloud Integration',
            description: 'Firebase/MongoDB integration for data storage and real-time synchronization',
            icon: 'cloud',
            color: '#ec4899',
            details: [
                'Real-time database updates',
                'Historical data storage',
                'Cross-platform sync',
                'Backup and recovery'
            ]
        },
        {
            title: 'Smart Automation',
            description: 'Automated responses and notifications based on parking lot conditions and usage patterns',
            icon: 'zap',
            color: '#8b5cf6',
            details: [
                'Automated status updates',
                'Usage pattern analysis',
                'Predictive availability',
                'Smart notifications'
            ]
        }
    ];

    const grid = document.getElementById('features-grid');
    if (!grid) return;

    grid.innerHTML = '';

    featuresData.forEach((feature, index) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.style.setProperty('--feature-color', feature.color);

        card.innerHTML = `
            <div class="feature-icon" style="background-color: ${feature.color}20; color: ${feature.color};">
                <i data-lucide="${feature.icon}" style="width: 24px; height: 24px;"></i>
            </div>
            <h3 class="feature-title" style="color: ${feature.color};">${feature.title}</h3>
            <p class="feature-description">${feature.description}</p>
            <div class="feature-details" style="display: none;">
                <ul>
                    ${feature.details.map(detail => `
                        <li>
                            <span style="background-color: ${feature.color};"></span>
                            ${detail}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = `0 0 30px ${feature.color}30`;
            card.querySelector('.feature-details').style.display = 'block';
        });

        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = '';
            card.querySelector('.feature-details').style.display = 'none';
        });

        // Add CSS custom properties for the glow effect
        card.style.setProperty('--glow-color', feature.color + '30');

        grid.appendChild(card);
    });

    // Re-initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Implementation section
function initImplementation() {
    const implementationData = {
        hardware: [
            {
                title: 'Central Processing',
                items: [
                    'Raspberry Pi 3/4 as main controller',
                    'Custom sensor interface board',
                    'Wi-Fi connectivity module',
                    'Power management system'
                ],
                icon: 'cpu',
                color: '#3b82f6'
            },
            {
                title: 'Sensor Network',
                items: [
                    'HC-SR04 ultrasonic distance sensors',
                    'Jumper wires and breadboard connections',
                    'Resistors for circuit protection',
                    'Weatherproof sensor housings'
                ],
                icon: 'wifi',
                color: '#10b981'
            },
            {
                title: 'Infrastructure',
                items: [
                    'Mounting brackets for sensors',
                    'Cable management system',
                    'Power distribution units',
                    'Environmental protection enclosures'
                ],
                icon: 'shield',
                color: '#8b5cf6'
            }
        ],
        software: [
            {
                title: 'Backend Systems',
                items: [
                    'Python for sensor data processing',
                    'FastAPI for RESTful web services',
                    'MQTT broker for real-time communication',
                    'Cron/Daemon scripts for automation'
                ],
                icon: 'server',
                color: '#3b82f6'
            },
            {
                title: 'Frontend Development',
                items: [
                    'HTML/CSS/JavaScript for web interface',
                    'AJAX/Fetch API for real-time updates',
                    'Responsive design for mobile devices',
                    'Interactive parking lot visualization'
                ],
                icon: 'layers',
                color: '#ec4899'
            },
            {
                title: 'Database & Cloud',
                items: [
                    'Firebase Realtime Database',
                    'MongoDB for data storage',
                    'RESTful API endpoints',
                    'Real-time data synchronization'
                ],
                icon: 'cloud',
                color: '#8b5cf6'
            }
        ],
        connectivity: [
            {
                title: 'Detection Process',
                items: [
                    'Ultrasonic sensor measures distance',
                    'Python script processes sensor data',
                    'Threshold comparison for occupancy',
                    'Status flag generation (occupied/vacant)'
                ],
                icon: 'activity',
                color: '#3b82f6'
            },
            {
                title: 'Data Transmission',
                items: [
                    'HTTP requests to FastAPI server',
                    'Real-time database updates',
                    'MQTT messaging for instant sync',
                    'Error handling and retry logic'
                ],
                icon: 'wifi',
                color: '#10b981'
            },
            {
                title: 'User Interface',
                items: [
                    'Web dashboard fetches live data',
                    'Color-coded slot visualization',
                    'Auto-refresh without page reload',
                    'Mobile-friendly responsive design'
                ],
                icon: 'bar-chart-4',
                color: '#ef4444'
            }
        ]
    };

    // Create tab content
    Object.keys(implementationData).forEach(tabId => {
        const content = document.getElementById(`${tabId}-content`);
        if (!content) return;

        content.innerHTML = `
            <div class="implementation-grid">
                ${implementationData[tabId].map(section => `
                    <div class="implementation-card" style="--section-color: ${section.color};">
                        <div class="implementation-header">
                            <i data-lucide="${section.icon}" style="color: ${section.color}; width: 32px; height: 32px;"></i>
                            <h3 class="implementation-title">${section.title}</h3>
                        </div>
                        <ul class="implementation-list">
                            ${section.items.map(item => `
                                <li>
                                    <span style="background-color: ${section.color};"></span>
                                    ${item}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    });

    // Tab functionality
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const tabId = trigger.dataset.tab;

            // Remove active class from all triggers and contents
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked trigger and corresponding content
            trigger.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');

            activeTab = tabId;
        });
    });

    // Re-initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.section-header, .feature-card, .description-card, .implementation-card, .team-member');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function showFullDiagram() {
    document.getElementById('diagram-modal').style.display = 'flex';
}

function hideFullDiagram() {
    document.getElementById('diagram-modal').style.display = 'none';
}

// Initialize Lucide icons
function initLucideIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Handle smooth scrolling for navigation links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('diagram-modal');
    if (e.target === modal) {
        hideFullDiagram();
    }
});

// Handle escape key for modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideFullDiagram();
    }
});

// Parallax effect for floating badges
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-badge');

    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});