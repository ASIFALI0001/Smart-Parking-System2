        // Mock database with updated parking slots
        const mockDB = {
            users: [],
            currentUser: null,
            parkingSlots: [
                { id: 1, type: 'general', status: 'occupied', customerName: 'John Smith', carNumber: 'CA-5432', startTime: '09:15', endTime: '17:30', cost: '$15.00' },
                { id: 2, type: 'general', status: 'available' },
                { id: 3, type: 'vip', status: 'occupied', assignedTo: 'Sarah Johnson', carNumber: 'CA-1234', assignedBy: 'Admin' },
                { id: 4, type: 'vip', status: 'vacant' },
                { id: 5, type: 'emergency', status: 'occupied' },
                { id: 6, type: 'emergency', status: 'vacant' },
                { id: 7, type: 'ev', status: 'charging', customerName: 'Michael Chen', carNumber: 'EV-7890', startTime: '10:45', endTime: '16:30', chargingStatus: '75%', cost: '$20.00' },
                { id: 8, type: 'ev', status: 'vacant' }
            ],
            activityData: {
                labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                datasets: [{
                    label: 'Cars',
                    data: [8, 12, 18, 22, 24, 20, 25, 28, 22],
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            }
        };

        // ─── Air Quality Monitoring Logic ───
        const airQualityData = {
            co: { value: 2.1, safeThreshold: 9, warningThreshold: 15, unit: 'ppm' },
            no2: { value: 0.03, safeThreshold: 0.05, warningThreshold: 0.1, unit: 'ppm' },
            benzene: { value: 0.8, safeThreshold: 5, warningThreshold: 10, unit: 'ppb' },
            nh3: { value: 0.5, safeThreshold: 25, warningThreshold: 35, unit: 'ppm' }
        };

        function updateAirQualityDisplay() {
            Object.keys(airQualityData).forEach(gas => {
                const data = airQualityData[gas];
                const element = document.getElementById(`${gas}-value`);
                const bar = document.getElementById(`${gas}-bar`);
                const status = document.getElementById(`${gas}-status`);

                element.textContent = `${data.value.toFixed(2)} ${data.unit}`;

                let percentage = (data.value / data.warningThreshold) * 100;
                percentage = Math.min(percentage, 100);

                bar.style.width = `${percentage}%`;

                // Clear previous classes
                bar.className = 'air-quality-bar';
                status.className = 'air-quality-status';

                if (data.value <= data.safeThreshold) {
                    bar.classList.add('bar-normal');
                    status.classList.add('status-normal');
                    status.textContent = 'Normal';
                } else if (data.value <= data.warningThreshold) {
                    bar.classList.add('bar-warning');
                    status.classList.add('status-warning');
                    status.textContent = 'Elevated';
                } else {
                    bar.classList.add('bar-danger');
                    status.classList.add('status-danger');
                    status.textContent = 'Warning!';
                }
            });

            updateOverallAirQuality();
        }

        function updateOverallAirQuality() {
            const overallStatus = document.getElementById('overall-status');
            const overallDesc = document.getElementById('overall-description');

            let warningCount = 0;
            let dangerCount = 0;

            Object.keys(airQualityData).forEach(gas => {
                const data = airQualityData[gas];
                if (data.value > data.warningThreshold) dangerCount++;
                else if (data.value > data.safeThreshold) warningCount++;
            });

            if (dangerCount > 0) {
                overallStatus.textContent = 'Poor';
                overallStatus.style.background = 'linear-gradient(90deg, #fe4f4f 0%, #fe4f9e 100%)';
                overallDesc.textContent = 'Unhealthy air quality detected. Ventilation needed.';
            } else if (warningCount > 0) {
                overallStatus.textContent = 'Moderate';
                overallStatus.style.background = 'linear-gradient(90deg, #febe4f 0%, #fe7e4f 100%)';
                overallDesc.textContent = 'Some pollutants are elevated. Monitor closely.';
            } else {
                overallStatus.textContent = 'Good';
                overallStatus.style.background = 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)';
                overallDesc.textContent = 'Air quality is within safe limits.';
            }
        }

        function simulateSensorUpdates() {
            setInterval(() => {
                Object.keys(airQualityData).forEach(gas => {
                    const fluctuation = (Math.random() - 0.5) * 0.2;
                    airQualityData[gas].value = Math.max(0, airQualityData[gas].value + fluctuation);
                });

                if (Math.random() < 0.05) {
                    const randomGas = Object.keys(airQualityData)[Math.floor(Math.random() * Object.keys(airQualityData).length)];
                    airQualityData[randomGas].value += Math.random() * 5;
                }

                updateAirQualityDisplay();
            }, 3000);
        }

        // DOM Elements
        const landingPage = document.getElementById('landing-page');
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        const dashboardPage = document.getElementById('dashboard-page');
        const statsSection = document.getElementById('stats-section');
        const slotModal = document.getElementById('slot-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalInfo = document.getElementById('modal-info');
        const closeModal = document.getElementById('close-modal');
        const orgNameDisplay = document.getElementById('org-name-display');

        // 3D Parking Scene Variables
        let parkingScene, parkingCamera, parkingRenderer;
        let parkingSlots = [];
        let raycaster, mouse;

        // Page Navigation Functions
        function showPage(page) {
            // Hide all pages
            landingPage.style.display = 'none';
            loginPage.style.display = 'none';
            registerPage.style.display = 'none';
            dashboardPage.style.display = 'none';

            // Show selected page
            if (page === 'landing') landingPage.style.display = 'flex';
            if (page === 'login') loginPage.style.display = 'flex';
            if (page === 'register') registerPage.style.display = 'flex';
            if (page === 'dashboard') {
                dashboardPage.style.display = 'block';
                initParkingScene();
                initStatsChart();
                initScrollAnimations();
                updateStatsCounters();
                initAirQualityMonitoring();
            }
        }

        // Navigation event listeners
        document.getElementById('to-login-button').addEventListener('click', () => showPage('login'));
        document.getElementById('to-register-button').addEventListener('click', () => showPage('register'));
        document.getElementById('register-to-login').addEventListener('click', () => showPage('login'));
        document.getElementById('login-to-register').addEventListener('click', () => showPage('register'));
        document.getElementById('logout-btn').addEventListener('click', () => {
            mockDB.currentUser = null;
            showPage('landing');
        });

        // Form Submissions
        document.getElementById('register-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const user = {
                orgName: document.getElementById('org-name').value,
                email: document.getElementById('org-email').value,
                password: document.getElementById('org-password').value,
                operatorName: document.getElementById('operator-name').value
            };

            mockDB.users.push(user);
            this.reset();
            alert('Registration successful! Please log in.');
            showPage('login');
        });

        document.getElementById('login-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const user = mockDB.users.find(u => u.email === email && u.password === password);

            if (user) {
                mockDB.currentUser = user;
                orgNameDisplay.textContent = user.orgName;
                showPage('dashboard');
            } else {
                if (mockDB.users.length === 0) {
                    const demoUser = {
                        orgName: 'Demo Organization',
                        email: email,
                        password: password,
                        operatorName: 'Demo Operator'
                    };
                    mockDB.users.push(demoUser);
                    mockDB.currentUser = demoUser;
                    orgNameDisplay.textContent = demoUser.orgName;
                    showPage('dashboard');
                } else {
                    alert('Invalid email or password. Please try again.');
                }
            }

            this.reset();
        });

        // Three.js Background
        const container = document.getElementById('canvas-container');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;

        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            transparent: true,
            color: 0x4facfe,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 5;

        // Mouse movement effect
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;

            // Mouse follow with damping
            particlesMesh.rotation.y += (mouseX * 0.1 - particlesMesh.rotation.y) * 0.05;
            particlesMesh.rotation.x += (mouseY * 0.1 - particlesMesh.rotation.x) * 0.05;

            renderer.render(scene, camera);
        };

        animate();

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Button hover effect with glow
        const buttons = document.querySelectorAll('.button-3d');
        const glow = document.getElementById('glow');

        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                gsap.to(glow, {
                    x: e.clientX - 25,
                    y: e.clientY - 25,
                    opacity: 0.5,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(glow, {
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Clock functionality
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
        }

        setInterval(updateClock, 1000);
        updateClock();

        // Initial animations
        gsap.from('.logo', {
            y: -50,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });

        gsap.from('.subtitle', {
            y: -30,
            opacity: 0,
            duration: 1.2,
            delay: 0.3,
            ease: 'power3.out'
        });

        gsap.from('#to-login-button', {
            x: -50,
            opacity: 0,
            duration: 1,
            delay: 0.6,
            ease: 'power3.out'
        });

        gsap.from('#to-register-button', {
            x: 50,
            opacity: 0,
            duration: 1,
            delay: 0.6,
            ease: 'power3.out'
        });

        // 3D Parking Scene Implementation
        function initParkingScene() {
            // Check if scene is already initialized
            if (parkingScene) return;

            const container = document.getElementById('parking-scene');

            // Scene setup
            parkingScene = new THREE.Scene();
            parkingScene.background = new THREE.Color(0x10172a);

            // Camera setup
            parkingCamera = new THREE.PerspectiveCamera(
                60,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            parkingCamera.position.set(0, 15, 15);

            // Renderer setup
            parkingRenderer = new THREE.WebGLRenderer({ antialias: true });
            parkingRenderer.setSize(container.clientWidth, container.clientHeight);
            parkingRenderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(parkingRenderer.domElement);

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            parkingScene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 5);
            parkingScene.add(directionalLight);

            // Ground
            const groundGeometry = new THREE.PlaneGeometry(30, 20);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.8
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            parkingScene.add(ground);

            // Grid
            const gridHelper = new THREE.GridHelper(30, 30, 0x4facfe, 0x222a42);
            parkingScene.add(gridHelper);

            // Parking slots
            createParkingSlots();

            // Setup raycaster for interaction
            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            container.addEventListener('click', onParkingClick, false);

            // MapControls for zooming in/out and panning
            const zoomInBtn = document.getElementById('zoom-in');
            const zoomOutBtn = document.getElementById('zoom-out');
            const resetViewBtn = document.getElementById('reset-view');

            zoomInBtn.addEventListener('click', () => {
                parkingCamera.position.z -= 1;
            });

            zoomOutBtn.addEventListener('click', () => {
                parkingCamera.position.z += 1;
            });

            resetViewBtn.addEventListener('click', () => {
                parkingCamera.position.set(0, 15, 15);
                parkingCamera.lookAt(0, 0, 0);
            });

            // Animation loop
            function animateParkingScene() {
                requestAnimationFrame(animateParkingScene);

                // Add some gentle movement to the camera
                parkingCamera.position.y += Math.sin(Date.now() * 0.001) * 0.01;

                // Rotate slots slightly for effect
                parkingSlots.forEach(slot => {
                    if (slot.userData.hovering) {
                        slot.rotation.y += 0.02;
                    }
                });

                parkingRenderer.render(parkingScene, parkingCamera);
            }

            // Window resize handling
            window.addEventListener('resize', () => {
                parkingCamera.aspect = container.clientWidth / container.clientHeight;
                parkingCamera.updateProjectionMatrix();
                parkingRenderer.setSize(container.clientWidth, container.clientHeight);
            });

            animateParkingScene();
        }

        function createParkingSlots() {
            // Clear existing slots
            parkingSlots.forEach(slot => parkingScene.remove(slot));
            parkingSlots = [];

            const slotGeometry = new THREE.BoxGeometry(3, 0.2, 6);

            // Define materials for different slot types
            const materials = {
                general: new THREE.MeshStandardMaterial({ color: 0x4facfe }),
                vip: new THREE.MeshStandardMaterial({ color: 0xa964fe }),
                emergency: new THREE.MeshStandardMaterial({ color: 0xfe4f4f }),
                ev: new THREE.MeshStandardMaterial({ color: 0x4ffe91 })
            };

            // Layout: 2 rows of 4 slots each
            const slotPositions = [
                // Row 1
                { x: -9, z: -3, type: 'general', index: 0 },
                { x: -3, z: -3, type: 'general', index: 1 },
                { x: 3, z: -3, type: 'vip', index: 2 },
                { x: 9, z: -3, type: 'vip', index: 3 },

                // Row 2
                { x: -9, z: 5, type: 'emergency', index: 4 },
                { x: -3, z: 5, type: 'emergency', index: 5 },
                { x: 3, z: 5, type: 'ev', index: 6 },
                { x: 9, z: 5, type: 'ev', index: 7 }
            ];

            slotPositions.forEach((pos, i) => {
                const slotData = mockDB.parkingSlots[i];
                const material = materials[slotData.type].clone();

                // Adjust opacity based on status
                if (slotData.status === 'available' || slotData.status === 'vacant') {
                    material.transparent = true;
                    material.opacity = 0.6;
                }

                const slot = new THREE.Mesh(slotGeometry, material);
                slot.position.set(pos.x, 0.1, pos.z);
                slot.userData = {
                    type: slotData.type,
                    id: slotData.id,
                    index: i,
                    hovering: false
                };

                // Add visual indicators based on status
                if (slotData.status === 'occupied' || slotData.status === 'reserved' || slotData.status === 'charging') {
                    // Add a car or indicator
                    const indicatorGeometry = new THREE.BoxGeometry(2, 1, 4);
                    const indicatorMaterial = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.8
                    });
                    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
                    indicator.position.set(pos.x, 0.7, pos.z);
                    indicator.userData.isCar = true;
                    parkingScene.add(indicator);

                    // For EV charging, add a "charging" effect
                    if (slotData.status === 'charging') {
                        const chargingGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                        const chargingMaterial = new THREE.MeshBasicMaterial({
                            color: 0x4ffe91,
                            transparent: true,
                            opacity: 0.8
                        });
                        const chargingIndicator = new THREE.Mesh(chargingGeometry, chargingMaterial);
                        chargingIndicator.position.set(pos.x, 1.2, pos.z - 1.5);
                        chargingIndicator.userData.isChargingIndicator = true;

                        // Pulsing animation
                        const pulseAnimation = () => {
                            gsap.to(chargingIndicator.scale, {
                                x: 1.5,
                                y: 1.5,
                                z: 1.5,
                                duration: 1,
                                ease: 'power1.inOut',
                                repeat: -1,
                                yoyo: true
                            });
                        };

                        pulseAnimation();
                        parkingScene.add(chargingIndicator);
                    }
                }

                parkingSlots.push(slot);
                parkingScene.add(slot);
            });
        }

        function onParkingClick(event) {
            // Calculate mouse position in normalized device coordinates
            const rect = event.target.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, parkingCamera);

            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(parkingSlots);

            if (intersects.length > 0) {
                const selectedSlot = intersects[0].object;
                const slotIndex = selectedSlot.userData.index;
                const slotData = mockDB.parkingSlots[slotIndex];

                // Animate the selected slot
                gsap.to(selectedSlot.position, {
                    y: 0.5,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.to(selectedSlot.position, {
                            y: 0.1,
                            duration: 0.3,
                            ease: 'power2.in'
                        });
                    }
                });

                // Show slot details in modal
                openSlotModal(slotData);
            }
        }

        function openSlotModal(slotData) {
            modalTitle.textContent = `Slot #${slotData.id} - ${slotData.type.toUpperCase()}`;

            let modalContent = '';

            switch (slotData.type) {
                case 'general':
                    if (slotData.status === 'occupied' || slotData.status === 'reserved') {
                        modalContent = `
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">
                            <span class="badge ${slotData.status === 'reserved' ? 'badge-warning' : 'badge-danger'}">
                                ${slotData.status === 'reserved' ? 'Reserved' : 'Occupied'}
                            </span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Customer:</div>
                        <div class="info-value">${slotData.customerName || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Vehicle:</div>
                        <div class="info-value">${slotData.carNumber || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Time:</div>
                        <div class="info-value">${slotData.startTime || 'N/A'} - ${slotData.endTime || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Cost:</div>
                        <div class="info-value">${slotData.cost || 'N/A'}</div>
                    </div>
                `;
                    } else {
                        modalContent = `
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">
                            <span class="badge badge-success">Available</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Rate:</div>
                        <div class="info-value">$5.00/hour</div>
                    </div>
                `;
                    }
                    break;

                case 'ev':
                    if (slotData.status === 'charging') {
                        modalContent = `
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">
                            <span class="badge badge-warning">Charging</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Customer:</div>
                        <div class="info-value">${slotData.customerName || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Vehicle:</div>
                        <div class="info-value">${slotData.carNumber || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Charge Level:</div>
                        <div class="info-value">${slotData.chargingStatus || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Time Remaining:</div>
                        <div class="info-value">${slotData.timeRemaining || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Cost:</div>
                        <div class="info-value">${slotData.cost || 'N/A'}</div>
                    </div>
                `;
                    } else {
                        modalContent = `
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">
                            <span class="badge badge-success">Available</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Charging Type:</div>
                        <div class="info-value">Type 2 Connector</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Power Output:</div>
                        <div class="info-value">22 kW</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Rate:</div>
                        <div class="info-value">$10.00/hour + $0.30/kWh</div>
                    </div>
                `;
                    }
                    break;

                default:
                    modalContent = `
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value">
                        <span class="badge ${slotData.status === 'occupied' ? 'badge-danger' : 'badge-success'}">
                            ${slotData.status === 'occupied' ? 'Occupied' : 'Available'}
                        </span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Type:</div>
                    <div class="info-value">${slotData.type.toUpperCase()}</div>
                </div>
            `;
            }

            modalInfo.innerHTML = modalContent;
            slotModal.classList.add('active');
        }

        // Close modal event
        closeModal.addEventListener('click', () => {
            slotModal.classList.remove('active');
        });

        // Close modal when clicking outside
        slotModal.addEventListener('click', (e) => {
            if (e.target === slotModal) {
                slotModal.classList.remove('active');
            }
        });

        // Initialize Stats Chart
        function initStatsChart() {
            const ctx = document.getElementById('activity-chart').getContext('2d');

            // Configure gradient for chart
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, 'rgba(79, 172, 254, 0.5)');
            gradient.addColorStop(1, 'rgba(79, 172, 254, 0.0)');

            mockDB.activityData.datasets[0].backgroundColor = gradient;

            const activityChart = new Chart(ctx, {
                type: 'line',
                data: mockDB.activityData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(16, 23, 41, 0.8)',
                            titleColor: '#4facfe',
                            bodyColor: '#ffffff',
                            bodyFont: {
                                family: 'Orbitron'
                            },
                            borderColor: 'rgba(79, 172, 254, 0.3)',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.7)'
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 4,
                            backgroundColor: '#4facfe',
                            hoverRadius: 6,
                            hoverBorderWidth: 2,
                            hoverBorderColor: '#ffffff'
                        },
                        line: {
                            tension: 0.4
                        }
                    }
                }
            });
        }

        // Update stats counters
        function updateStatsCounters() {
            // Count active bookings (general and EV slots that are occupied/charging)
            const activeBookings = mockDB.parkingSlots.filter(slot =>
                (slot.type === 'general' || slot.type === 'ev') &&
                (slot.status === 'occupied' || slot.status === 'charging')
            ).length;

            // Count cars logged (all occupied slots)
            const carsLogged = mockDB.parkingSlots.filter(slot =>
                slot.status === 'occupied' || slot.status === 'charging'
            ).length;

            // Calculate today's earnings (sum of all occupied slots' costs)
            let earnings = 0;
            mockDB.parkingSlots.forEach(slot => {
                if (slot.status === 'occupied' || slot.status === 'charging') {
                    const cost = parseFloat(slot.cost?.replace('$', '') || 0);
                    earnings += cost;
                }
            });

            document.getElementById('active-bookings').textContent = activeBookings;
            document.getElementById('cars-logged').textContent = carsLogged;
            document.getElementById('today-earnings').textContent = `$${earnings.toFixed(2)}`;
        }

        // Initialize scroll animations
        function initScrollAnimations() {
            gsap.registerPlugin(ScrollTrigger);

            // Stats section animation
            gsap.to('.stats-section', {
                scrollTrigger: {
                    trigger: '.stats-section',
                    start: 'top 80%',
                    end: 'bottom bottom',
                    scrub: 1,
                    onEnter: () => {
                        gsap.to('.stats-section', {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            ease: 'power3.out'
                        });

                        // Animate in each stat card
                        gsap.fromTo('.stat-card', {
                            y: 50,
                            opacity: 0
                        }, {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            stagger: 0.2,
                            ease: 'power3.out'
                        });

                        // Animate in chart container
                        gsap.fromTo('.chart-container', {
                            y: 50,
                            opacity: 0
                        }, {
                            y: 0,
                            opacity: 1,
                            duration: 0.8,
                            delay: 0.6,
                            ease: 'power3.out'
                        });
                    }
                }
            });
        }

        // Call this in showPage('dashboard')
        function initAirQualityMonitoring() {
            updateAirQualityDisplay();
            simulateSensorUpdates();

            gsap.from('.air-quality-card', {
                scrollTrigger: {
                    trigger: '#air-quality-section',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
        }

        // Function to open bookings modal
        function openBookingsModal() {
            const bookingsModal = document.getElementById('bookings-modal');
            const bookingsList = document.querySelector('.bookings-list');

            // Clear previous bookings
            bookingsList.innerHTML = '';

            // Filter only occupied general and EV slots
            const activeBookings = mockDB.parkingSlots.filter(slot =>
                (slot.type === 'general' || slot.type === 'ev') &&
                (slot.status === 'occupied' || slot.status === 'charging')
            );

            if (activeBookings.length === 0) {
                bookingsList.innerHTML = '<div style="text-align: center; padding: 20px; opacity: 0.7;">No active bookings currently</div>';
            } else {
                // Add all active bookings
                activeBookings.forEach(booking => {
                    // Determine slot color based on type
                    let slotColor = booking.type === 'general' ? '#4facfe' : '#4ffe91';

                    const bookingItem = document.createElement('div');
                    bookingItem.className = 'booking-item';
                    bookingItem.innerHTML = `
                <div class="booking-header">
                    <div class="booking-id">Slot #${booking.id}</div>
                    <div class="booking-time">${booking.startTime || 'N/A'} - ${booking.endTime || 'N/A'}</div>
                </div>
                <div class="booking-details">
                    <div class="booking-detail">
                        <div class="detail-label">Customer</div>
                        <div class="detail-value">${booking.customerName || 'N/A'}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="detail-label">Vehicle</div>
                        <div class="detail-value">${booking.carNumber || 'N/A'}</div>
                    </div>
                    <div class="booking-detail">
                        <div class="detail-label">Slot Type</div>
                        <div class="detail-value">
                            <span class="slot-type-indicator" style="background-color: ${slotColor};"></span>
                            ${booking.type.toUpperCase()}
                        </div>
                    </div>
                    <div class="booking-detail">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">
                            <span class="badge ${booking.status === 'charging' ? 'badge-warning' : 'badge-danger'}">
                                ${booking.status === 'charging' ? 'Charging' : 'Occupied'}
                            </span>
                        </div>
                    </div>
                    ${booking.status === 'charging' ? `
                    <div class="booking-detail">
                        <div class="detail-label">Charge Level</div>
                        <div class="detail-value">${booking.chargingStatus || 'N/A'}</div>
                    </div>
                    ` : ''}
                    <div class="booking-detail">
                        <div class="detail-label">Cost</div>
                        <div class="detail-value">${booking.cost || 'N/A'}</div>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="booking-btn cancel-btn" data-slot-id="${booking.id}">End Session</button>
                </div>
            `;
                    bookingsList.appendChild(bookingItem);
                });
            }
            // Show the modal
            bookingsModal.classList.add('active');

            // Add event listeners to the cancel buttons
            document.querySelectorAll('.cancel-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const slotId = parseInt(this.getAttribute('data-slot-id'));
                    endParkingSession(slotId);
                });
            });
        }

        function endParkingSession(slotId) {
            if (confirm('Are you sure you want to end this parking session?')) {
                // Find the slot in our mock DB
                const slotIndex = mockDB.parkingSlots.findIndex(slot => slot.id === slotId);

                if (slotIndex !== -1) {
                    // Update the slot status
                    mockDB.parkingSlots[slotIndex].status = 'available';
                    if (mockDB.parkingSlots[slotIndex].type === 'ev') {
                        mockDB.parkingSlots[slotIndex].status = 'vacant';
                    }

                    // Remove the customer data
                    delete mockDB.parkingSlots[slotIndex].customerName;
                    delete mockDB.parkingSlots[slotIndex].carNumber;
                    delete mockDB.parkingSlots[slotIndex].startTime;
                    delete mockDB.parkingSlots[slotIndex].endTime;
                    delete mockDB.parkingSlots[slotIndex].chargingStatus;
                    delete mockDB.parkingSlots[slotIndex].cost;

                    // Update the 3D visualization
                    updateParkingSlotVisualization(slotId);

                    // Update stats counters
                    updateStatsCounters();

                    // Close the modal and reopen to refresh the list
                    document.getElementById('bookings-modal').classList.remove('active');
                    setTimeout(openBookingsModal, 300);
                }
            }
        }

        function updateParkingSlotVisualization(slotId) {
            // Find the slot in the Three.js scene
            const slot = parkingSlots.find(s => s.userData.id === slotId);
            if (!slot) return;

            // Find the slot data
            const slotData = mockDB.parkingSlots.find(s => s.id === slotId);

            // Change the slot's material opacity to show it's available
            slot.material.opacity = 0.6;
            slot.material.transparent = true;

            // Remove the car and charging indicator from the scene
            const toRemove = [];

            parkingScene.children.forEach(obj => {
                const isCar = obj.userData?.isCar;
                const isCharger = obj.userData?.isChargingIndicator;

                if ((isCar || isCharger) &&
                    Math.abs(obj.position.x - slot.position.x) < 0.1 &&
                    Math.abs(obj.position.z - slot.position.z) < 0.1) {
                    toRemove.push(obj);
                }

                // For EV charger, it's slightly offset on Z axis
                if (isCharger &&
                    Math.abs(obj.position.x - slot.position.x) < 0.1 &&
                    Math.abs(obj.position.z - (slot.position.z - 1.5)) < 0.1) {
                    toRemove.push(obj);
                }
            });

            toRemove.forEach(obj => parkingScene.remove(obj));
        }

        // Add event listeners
        document.addEventListener('DOMContentLoaded', function () {
            // Active bookings card click
            const activeBookingsCard = document.getElementById('active-bookings').parentElement.parentElement;
            activeBookingsCard.addEventListener('click', openBookingsModal);

            // Close bookings modal
            document.getElementById('close-bookings-modal').addEventListener('click', function () {
                document.getElementById('bookings-modal').classList.remove('active');
            });

            // Close modal when clicking outside
            document.getElementById('bookings-modal').addEventListener('click', function (e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // Added a polyfill for TextGeometry to avoid errors
        THREE.FontLoader = function () {
            this.load = function (url, callback) {
                // Mock font loading
                return {};
            };
        };

        THREE.TextGeometry = function (text, parameters) {
            // Return a simple box geometry instead
            return new THREE.BoxGeometry(0.1, 0.1, 0.1);
        };

        // Initialize with landing page visible
        showPage('landing');