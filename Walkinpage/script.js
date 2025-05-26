 // DOM Elements
 const walkInPage = document.getElementById('walkInPage');
 const confirmationPage = document.getElementById('confirmationPage');
 const walkInForm = document.getElementById('walkInForm');
 const slotNumber = document.getElementById('slotNumber');
 const entryTimeEl = document.getElementById('entryTime');
 const durationEl = document.getElementById('duration');
 const currentTimeEl = document.getElementById('currentTime');
 const currentTimeHeader = document.getElementById('current-time');
 const currentDateEl = document.getElementById('current-date');
 const currentPriceEl = document.getElementById('currentPrice');
 const payButton = document.getElementById('payButton');
 const endSessionButton = document.getElementById('endSessionButton');
 const sessionEndedEl = document.getElementById('sessionEnded');
 const walkOutButton = document.getElementById('walkOutButton');
 const paymentOptions = document.querySelectorAll('.payment-option');
 const progressBar = document.getElementById('progressBar');
 const notification = document.getElementById('notification');
 const fullNameInput = document.getElementById('fullName');
 const vehicleNumberInput = document.getElementById('vehicleNumber');
 const contactNumberInput = document.getElementById('contactNumber');
 const parkingLotSelect = document.getElementById('parkingLot');
 const particles = document.getElementById('particles');

 // Variables
 let entryTime = null;
 let intervalId = null;
 let totalSeconds = 0;
 let currentPrice = 30;  // Start with ₹30 base charge
 let selectedPaymentMethod = null;

 // Create particles
 function createParticles() {
     particles.innerHTML = '';
     const count = window.innerWidth > 768 ? 15 : 10;
     
     for (let i = 0; i < count; i++) {
         const size = Math.random() * 10 + 5;
         const particle = document.createElement('div');
         particle.classList.add('particle');
         particle.style.width = `${size}px`;
         particle.style.height = `${size}px`;
         particle.style.left = `${Math.random() * 100}%`;
         particle.style.top = `${Math.random() * 100}%`;
         particle.style.animationDelay = `${Math.random() * 5}s`;
         particle.style.animationDuration = `${15 + Math.random() * 10}s`;
         particles.appendChild(particle);
     }
 }

 // Show notification
 function showNotification(title, message, type = 'info') {
     const notificationEl = document.getElementById('notification');
     const notificationTitle = notificationEl.querySelector('.notification-title');
     const notificationMessage = notificationEl.querySelector('.notification-message');
     
     // Set border color based on type
     if (type === 'success') {
         notificationEl.style.borderLeft = '4px solid var(--success)';
     } else if (type === 'error') {
         notificationEl.style.borderLeft = '4px solid var(--danger)';
     } else {
         notificationEl.style.borderLeft = '4px solid var(--accent)';
     }
     
     notificationTitle.textContent = title;
     notificationMessage.textContent = message;
     
     notificationEl.classList.add('active');
     
     setTimeout(() => {
         notificationEl.classList.remove('active');
     }, 5000);
 }

 // Update current time in header
 function updateCurrentTime() {
     const now = new Date();
     const timeString = now.toLocaleTimeString('en-US');
     const dateString = now.toLocaleDateString('en-US', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
     });
     
     currentTimeHeader.textContent = timeString;
     currentDateEl.textContent = dateString;
     
     if (currentTimeEl) {
         currentTimeEl.textContent = timeString;
     }
 }

 // Start timer and price calculation
 function startTimer() {
     entryTime = new Date();
     entryTimeEl.textContent = entryTime.toLocaleTimeString('en-US');
     
     intervalId = setInterval(() => {
         totalSeconds++;
         
         // Calculate duration
         const hours = Math.floor(totalSeconds / 3600);
         const minutes = Math.floor((totalSeconds % 3600) / 60);
         const seconds = totalSeconds % 60;
         const durationString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
         durationEl.textContent = durationString;
         
         // Calculate price (₹100 per hour)
         currentPrice = 30 + Math.ceil((totalSeconds / 3600) * 100); // Add base charge to hourly rate
         currentPriceEl.textContent = `₹${currentPrice}`;
         payButton.textContent = `Pay ₹${currentPrice}`;
         
         // Update current time
         updateCurrentTime();
         
         // Add glow effect to price when it changes
         currentPriceEl.classList.add('glow');
         setTimeout(() => {
             currentPriceEl.classList.remove('glow');
         }, 1000);
     }, 1000);
 }

 // Generate random slot number with animation
 function generateRandomSlot() {
     const randomSlot = Math.floor(Math.random() * 20) + 1;
     
     // Animate the slot number
     let currentSlot = 1;
     const slotInterval = setInterval(() => {
         slotNumber.textContent = `Slot No. ${currentSlot}`;
         if (currentSlot === randomSlot) {
             clearInterval(slotInterval);
         } else {
             currentSlot++;
         }
     }, 50);
     
     return randomSlot;
 }

 // Form validation
 function validateForm() {
     let isValid = true;
     
     // Validate full name
     if (fullNameInput.value.trim().length < 3) {
         fullNameInput.parentElement.parentElement.classList.add('invalid');
         isValid = false;
     } else {
         fullNameInput.parentElement.parentElement.classList.remove('invalid');
         fullNameInput.parentElement.parentElement.classList.add('valid');
     }
     
     // Validate vehicle number
     const vehicleRegex = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;
     if (!vehicleRegex.test(vehicleNumberInput.value)) {
         vehicleNumberInput.parentElement.parentElement.classList.add('invalid');
         isValid = false;
     } else {
         vehicleNumberInput.parentElement.parentElement.classList.remove('invalid');
         vehicleNumberInput.parentElement.parentElement.classList.add('valid');
     }
     
     // Validate contact number
     const contactRegex = /^\d{10}$/;
     if (!contactRegex.test(contactNumberInput.value)) {
         contactNumberInput.parentElement.parentElement.classList.add('invalid');
         isValid = false;
     } else {
         contactNumberInput.parentElement.parentElement.classList.remove('invalid');
         contactNumberInput.parentElement.parentElement.classList.add('valid');
     }
     
     // Validate parking lot
     if (!parkingLotSelect.value) {
         parkingLotSelect.parentElement.classList.add('invalid');
         isValid = false;
     } else {
         parkingLotSelect.parentElement.classList.remove('invalid');
         parkingLotSelect.parentElement.classList.add('valid');
     }
     
     return isValid;
 }

 // Real-time form validation
 fullNameInput.addEventListener('input', () => {
     if (fullNameInput.value.trim().length < 3) {
         fullNameInput.parentElement.parentElement.classList.add('invalid');
     } else {
         fullNameInput.parentElement.parentElement.classList.remove('invalid');
         fullNameInput.parentElement.parentElement.classList.add('valid');
     }
 });

 vehicleNumberInput.addEventListener('input', () => {
     const vehicleRegex = /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;
     if (!vehicleRegex.test(vehicleNumberInput.value)) {
         vehicleNumberInput.parentElement.parentElement.classList.add('invalid');
     } else {
         vehicleNumberInput.parentElement.parentElement.classList.remove('invalid');
         vehicleNumberInput.parentElement.parentElement.classList.add('valid');
     }
 });

 contactNumberInput.addEventListener('input', () => {
     const contactRegex = /^\d{10}$/;
     if (!contactRegex.test(contactNumberInput.value)) {
         contactNumberInput.parentElement.parentElement.classList.add('invalid');
     } else {
         contactNumberInput.parentElement.parentElement.classList.remove('invalid');
         contactNumberInput.parentElement.parentElement.classList.add('valid');
     }
 });

 parkingLotSelect.addEventListener('change', () => {
     if (!parkingLotSelect.value) {
         parkingLotSelect.parentElement.classList.add('invalid');
     } else {
         parkingLotSelect.parentElement.classList.remove('invalid');
         parkingLotSelect.parentElement.classList.add('valid');
     }
 });

 // Form submission
 walkInForm.addEventListener('submit', (e) => {
     e.preventDefault();
     
     if (!validateForm()) {
         showNotification('Error', 'Please fill all fields correctly', 'error');
         return;
     }
     
     // Get form values
     const fullName = fullNameInput.value;
     const vehicleNumber = vehicleNumberInput.value;
     const contactNumber = contactNumberInput.value;
     const parkingLot = parkingLotSelect.value;
     
     // Animated page transition
     walkInPage.classList.add('slide-out-left');
     
     setTimeout(() => {
         // Generate random slot number with animation
         const slot = generateRandomSlot();
         
         // Switch to confirmation page
         walkInPage.classList.remove('active');
         walkInPage.classList.remove('slide-out-left');
         confirmationPage.classList.add('active');
         confirmationPage.classList.add('slide-in-right');
         
         // Start timer and update current time
         startTimer();
         updateCurrentTime();
         
         // Show success notification
         showNotification('Success', 'Parking slot assigned successfully', 'success');
         
         setTimeout(() => {
             confirmationPage.classList.remove('slide-in-right');
         }, 500);
     }, 500);
 });

 // Payment method selection
 paymentOptions.forEach(option => {
     option.addEventListener('click', () => {
         paymentOptions.forEach(opt => opt.classList.remove('selected'));
         option.classList.add('selected');
         selectedPaymentMethod = option.dataset.method;
         
         // Enable pay button if payment method is selected
         payButton.disabled = false;
         
         // Add pulse effect to pay button
         payButton.classList.add('glow');
         setTimeout(() => {
             payButton.classList.remove('glow');
         }, 1000);
     });
 });

 // Pay button
 payButton.addEventListener('click', () => {
     if (!selectedPaymentMethod) {
         showNotification('Error', 'Please select a payment method', 'error');
         return;
     }
     
     // Show progress bar
     progressBar.style.display = 'block';
     
     // Simulate payment processing
     payButton.innerHTML = '<div class="loading-animation"><div></div><div></div><div></div></div> Processing...';
     payButton.disabled = true;
     
     setTimeout(() => {
         // Hide progress bar
         progressBar.style.display = 'none';
         
         // Show success notification
         showNotification('Payment Success', `Payment of ₹${currentPrice} successful using ${selectedPaymentMethod}!`, 'success');
         
         // Update button text
         payButton.innerHTML = `Paid ₹${currentPrice}`;
         
         // Enable end session button with glow effect
         endSessionButton.disabled = false;
         endSessionButton.classList.add('glow');
         setTimeout(() => {
             endSessionButton.classList.remove('glow');
         }, 2000);
     }, 2000);
 });

 // End session button
 endSessionButton.addEventListener('click', () => {
     // Stop timer
     clearInterval(intervalId);
     
     // Show session ended message with animation
     sessionEndedEl.style.display = 'block';
     
     // Show walk out button with animation
     setTimeout(() => {
         walkOutButton.style.display = 'block';
         walkOutButton.classList.add('glow');
         
         // Animate walk out button
         walkOutButton.style.animation = 'fadeIn 0.5s forwards';
     }, 1000);
     
     // Disable buttons
     endSessionButton.disabled = true;
     payButton.disabled = true;
     
     // Show success notification
     showNotification('Session Ended', 'Your parking session has ended.', 'success');
 });

 // Walk out button
 walkOutButton.addEventListener('click', () => {
     // Show thank you notification
     showNotification('Thank You', 'Thank you for using our parking service!', 'success');
     
     // Animate page transition
     confirmationPage.classList.add('slide-out-left');
     
     setTimeout(() => {
         // Reset and go back to walk-in page
         confirmationPage.classList.remove('active');
         confirmationPage.classList.remove('slide-out-left');
         walkInPage.classList.add('active');
         walkInPage.classList.add('slide-in-right');
         
         // Reset form with animation
         walkInForm.reset();
         
         // Reset all form validation
         document.querySelectorAll('.form-group').forEach(group => {
             group.classList.remove('valid');
             group.classList.remove('invalid');
         });
         
         // Reset variables
         entryTime = null;
         totalSeconds = 0;
         currentPrice = 30;  // Reset to base charge
         selectedPaymentMethod = null;
         
         // Reset UI elements
         sessionEndedEl.style.display = 'none';
         walkOutButton.style.display = 'none';
         payButton.disabled = true;
         endSessionButton.disabled = true;
         paymentOptions.forEach(opt => opt.classList.remove('selected'));
         
         setTimeout(() => {
             walkInPage.classList.remove('slide-in-right');
         }, 500);
     }, 500);
 });

 // Create interactive particles
 createParticles();
 window.addEventListener('resize', createParticles);

 // Initialize
 updateCurrentTime();
 setInterval(updateCurrentTime, 1000);