 // UI Functionality
 document.addEventListener('DOMContentLoaded', function () {
    // Global variables for session tracking
    let sessionActive = false;
    let sessionStartTime = null;
    let timerInterval = null;
    let reservedEndTime = null;
    let hasExceededTime = false;
    let paidAmount = false;

    // Add ripple effect to all buttons
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Tabs functionality
    const tabs = document.querySelectorAll('.tab');
    const forms = document.querySelectorAll('.form-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                    form.style.animation = 'fadeIn 0.6s ease-out';
                }
            });

            // Hide thank you message when switching tabs
            document.getElementById('thank-you').style.display = 'none';
        });
    });

    // Walk-In Form Submit
    document.getElementById('walk-in-btn').addEventListener('click', function () {
        const name = document.getElementById('walk-name').value;
        const vehicle = document.getElementById('walk-vehicle').value;
        const contact = document.getElementById('walk-contact').value;

        if (name && vehicle && contact) {
            // Show loading spinner
            document.getElementById('walkin-spinner').style.display = 'block';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                document.getElementById('walkin-spinner').style.display = 'none';
                this.disabled = false;
                
                document.getElementById('thank-you').style.display = 'block';
                document.getElementById('thank-you').style.animation = 'bounceIn 0.8s ease-out';

                // Clear form
                document.getElementById('walk-name').value = '';
                document.getElementById('walk-vehicle').value = '';
                document.getElementById('walk-contact').value = '';
            }, 1500);
        } else {
            alert('Please fill in all fields');
        }
    });

    // Login Form Submit
    document.getElementById('login-btn').addEventListener('click', function () {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (email && password) {
            // Show loading spinner
            document.getElementById('login-spinner').style.display = 'block';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                document.getElementById('login-spinner').style.display = 'none';
                this.disabled = false;
                
                // Show dashboard
                document.getElementById('auth-panel').style.display = 'none';
                document.getElementById('dashboard').style.display = 'block';
                document.getElementById('dashboard').style.animation = 'fadeIn 0.8s ease-out';

                // Set user name (mock data)
                document.getElementById('user-display-name').textContent = email.split('@')[0];
                document.getElementById('user-display-name').style.animation = 'pulse 2s infinite alternate';
            }, 1500);
        } else {
            alert('Please enter both email and password');
        }
    });

    // Register Form Submit
    document.getElementById('register-btn').addEventListener('click', function () {
        const name = document.getElementById('reg-name').value;
        const age = document.getElementById('reg-age').value;
        const car = document.getElementById('reg-car').value;
        const phone = document.getElementById('reg-phone').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        if (name && age && car && phone && email && password) {
            // Show loading spinner
            document.getElementById('register-spinner').style.display = 'block';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                document.getElementById('register-spinner').style.display = 'none';
                this.disabled = false;
                
                alert('Registration successful! Please login with your credentials.');

                // Switch to login tab
                document.querySelector('[data-tab="login"]').click();

                // Pre-fill login form
                document.getElementById('login-email').value = email;

                // Clear registration form
                document.getElementById('reg-name').value = '';
                document.getElementById('reg-age').value = '';
                document.getElementById('reg-car').value = '';
                document.getElementById('reg-phone').value = '';
                document.getElementById('reg-email').value = '';
                document.getElementById('reg-password').value = '';
            }, 1500);
        } else {
            alert('Please fill in all fields');
        }
    });

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function () {
        document.getElementById('auth-panel').style.display = 'block';
        document.getElementById('auth-panel').style.animation = 'fadeIn 0.8s ease-out';
        document.getElementById('dashboard').style.display = 'none';

        // Clear fields and reset UI
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('parking-lot').selectedIndex = 0;
        document.getElementById('reservation-form').style.display = 'none';
        document.getElementById('confirmation').style.display = 'none';
        document.getElementById('active-session').style.display = 'none';

        // Reset session variables
        resetSession();
    });

    // Reset session variables
    function resetSession() {
        sessionActive = false;
        sessionStartTime = null;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        reservedEndTime = null;
        hasExceededTime = false;
        paidAmount = false;

        // Hide fine counter and reset
        document.getElementById('fine-counter').style.display = 'none';
        document.getElementById('fine-amount').textContent = '0';
        document.getElementById('active-session').classList.remove('fine');
    }

    // Parking lot selection
    document.getElementById('parking-lot').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const rate = selectedOption.getAttribute('data-rate');

        // Show reservation form with animation
        document.getElementById('reservation-form').style.display = 'block';
        document.getElementById('reservation-form').style.animation = 'fadeIn 0.6s ease-out';
        document.getElementById('confirmation').style.display = 'none';

        // Update rate display
        document.getElementById('rate-display').textContent = rate;

        // Reset time fields
        document.getElementById('parking-date').value = '';
        document.getElementById('start-time').value = '';
        document.getElementById('end-time').value = '';
        document.getElementById('cost-display').textContent = '0';
    });

    // Calculate cost when time changes
    function calculateCost() {
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
    
        if (startTime && endTime) {
            const start = new Date(`2023-01-01T${startTime}`);
            const end = new Date(`2023-01-01T${endTime}`);
            let hours = (end - start) / (1000 * 60 * 60);
    
            // Add minimum 1 hour charge
            if (hours > 0 && hours < 1) {
                hours = 1;
            }
    
            if (hours <= 0) {
                hours = 0;
                document.getElementById('cost-display').textContent = '0';
                document.getElementById('reserve-btn').disabled = true;
            } else {
                const rate = parseFloat(document.getElementById('rate-display').textContent);
                const cost = Math.ceil(hours * rate);
                document.getElementById('cost-display').textContent = cost;
                document.getElementById('reserve-btn').disabled = false;
            }
        }
    }

    document.getElementById('start-time').addEventListener('change', calculateCost);
    document.getElementById('end-time').addEventListener('change', calculateCost);

    // Set default date to today
    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    // Add leading zeros if needed
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    document.getElementById('parking-date').value = `${year}-${month}-${day}`;

    // Format date for display (DD/MM/YYYY)
    function formatDate(dateString) {
        const [y, m, d] = dateString.split('-');
        return `${d}/${m}/${y}`;
    }

    // Reserve parking spot
    document.getElementById('reserve-btn').addEventListener('click', function () {
        const parkingLot = document.getElementById('parking-lot');
        const lotName = parkingLot.options[parkingLot.selectedIndex].text;
        const date = document.getElementById('parking-date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const cost = document.getElementById('cost-display').textContent;

        if (date && startTime && endTime) {
            // Show loading spinner
            document.getElementById('reserve-spinner').style.display = 'block';
            this.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                document.getElementById('reserve-spinner').style.display = 'none';
                this.disabled = false;
                
                // Format times for display
                const formattedStart = formatTime(startTime);
                const formattedEnd = formatTime(endTime);
                const formattedDate = formatDate(date);

                // Store end time for checking overstay
                reservedEndTime = endTime;

                // Show confirmation with animation
                document.getElementById('confirmed-lot').textContent = lotName;
                document.getElementById('confirmed-date').textContent = formattedDate;
                document.getElementById('confirmed-start').textContent = formattedStart;
                document.getElementById('confirmed-end').textContent = formattedEnd;
                document.getElementById('confirmed-cost').textContent = cost;
                document.getElementById('confirmation').style.display = 'block';
                document.getElementById('confirmation').style.animation = 'fadeIn 0.6s ease-out';

                // Update session card (but don't show yet)
                document.getElementById('session-location').textContent = lotName;
                document.getElementById('session-duration').textContent = `${formattedStart} - ${formattedEnd}`;
                document.getElementById('session-cost').textContent = `₹${cost}`;
                document.getElementById('end-time-display').textContent = formattedEnd;

                // Hide reservation form
                document.getElementById('reservation-form').style.display = 'none';
            }, 1500);
        } else {
            alert('Please select date and time');
        }
    });

    // Walk In button functionality
    document.getElementById('walk-in-start-btn').addEventListener('click', function () {
        // Get current time
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        const formattedNow = formatTime(currentTime);

        // Start session
        sessionActive = true;
        sessionStartTime = now;
        document.getElementById('entry-time').textContent = formattedNow;
        document.getElementById('current-duration').textContent = '00:00:00';

        // Show active session card with animation
        document.getElementById('active-session').style.display = 'block';
        document.getElementById('active-session').style.animation = 'fadeInUp 0.6s ease-out';
        document.getElementById('reservation-card').style.display = 'none';

        // Start duration timer
        startDurationTimer();

        // Check if already past end time (for demo purposes)
        checkEndTimeExceeded();
    });

    // Start duration timer
    function startDurationTimer() {
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            if (!sessionActive) return;

            const now = new Date();
            const elapsedMs = now - sessionStartTime;

            // Calculate hours, minutes, seconds
            const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

            // Format as HH:MM:SS
            const formattedTime = [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');

            // Update timer display
            document.getElementById('duration-timer').textContent = formattedTime;
            document.getElementById('current-duration').textContent = formattedTime;

            // Check if exceeded end time
            checkEndTimeExceeded();
        }, 1000);
    }

    // Check if current time exceeds reserved end time
    function checkEndTimeExceeded() {
        if (!reservedEndTime || !sessionActive) return;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        const [endHours, endMinutes] = reservedEndTime.split(':').map(Number);

        // Check if current time is past end time
        if ((currentHours > endHours) ||
            (currentHours === endHours && currentMinutes > endMinutes)) {

            if (!hasExceededTime) {
                hasExceededTime = true;

                // Show fine counter with animation
                document.getElementById('fine-counter').style.display = 'block';
                document.getElementById('fine-amount').textContent = '50';
                document.getElementById('fine-counter').style.animation = 'shake 0.5s ease-in-out infinite alternate, flashFine 1s infinite alternate';

                // Add fine styling
                document.getElementById('active-session').classList.add('fine');
            }
        }
    }

    // Format time for display (12-hour format)
    function formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hoursNum = parseInt(hours);
        const period = hoursNum >= 12 ? 'PM' : 'AM';
        const hours12 = hoursNum % 12 || 12;
        return `${hours12}:${minutes} ${period}`;
    }

    // Payment button functionality
    document.getElementById('pay-btn').addEventListener('click', function () {
        let totalAmount = parseInt(document.getElementById('confirmed-cost').textContent);

        // Add fine if applicable
        if (hasExceededTime) {
            totalAmount += 50; // ₹50 fine
        }

        // Show payment processing animation
        this.textContent = 'Processing...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = 'Pay Now';
            this.disabled = false;
            
            alert(`Payment of ₹${totalAmount} processed successfully!`);

            // Enable end session button with animation
            document.getElementById('end-session-btn').disabled = false;
            document.getElementById('end-session-btn').style.animation = 'pulse 1s infinite alternate';

            // Mark as paid
            paidAmount = true;

            // Remove fine styling but keep fine display for record
            document.getElementById('active-session').classList.remove('fine');
        }, 1500);
    });

    // End session button
    document.getElementById('end-session-btn').addEventListener('click', function () {
        // Hide end session button and show walk out button
        this.style.display = 'none';
        document.getElementById('walk-out-btn').style.display = 'block';
        document.getElementById('walk-out-btn').style.animation = 'fadeIn 0.6s ease-out';

        // Stop the timer
        clearInterval(timerInterval);
        sessionActive = false;
    });

    // Walk Out button
    document.getElementById('walk-out-btn').addEventListener('click', function () {
        // Hide active session
        document.getElementById('active-session').style.display = 'none';

        // Show and reset reservation card with animation
        document.getElementById('reservation-card').style.display = 'block';
        document.getElementById('reservation-card').style.animation = 'fadeIn 0.6s ease-out';
        document.getElementById('parking-lot').selectedIndex = 0;
        document.getElementById('reservation-form').style.display = 'none';
        document.getElementById('confirmation').style.display = 'none';

        // Reset session
        resetSession();

        // Reset UI elements
        document.getElementById('walk-out-btn').style.display = 'none';
        document.getElementById('end-session-btn').style.display = 'block';
        document.getElementById('end-session-btn').disabled = true;
        document.getElementById('end-session-btn').style.animation = 'none';

        // Show thank you message
        alert('Thank you for using Parker Portal!');
    });
});