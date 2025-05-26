// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  initNetworkFlow()
  initParkingMap()
  initOsiModel()
  initPingSimulator()
  initTestingTools()
  initGeoMap()
  initPacketJourney()
  initDownloadButton()

  // Initialize new modules
  initProtocolsSection()
  initRealTimeMonitor()
  addAnimationsToExistingElements()

  // Add protocols and real-time monitor links to footer
  const footerLinks = document.querySelector(".footer-links")
  if (footerLinks) {
    footerLinks.innerHTML += `
      <a href="#protocols-used">Protocols</a>
      <a href="#real-time-monitor">Network Monitor</a>
    `
  }
})

// Network Flow Animation
function initNetworkFlow() {
  const canvas = document.getElementById("network-flow-canvas")
  const ctx = canvas.getContext("2d")
  const triggerButton = document.getElementById("trigger-sensor")
  const statusValue = document.getElementById("network-status-value")

  // Set canvas dimensions
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
  }

  resizeCanvas()
  window.addEventListener("resize", resizeCanvas)

  // Particle system for data flow visualization
  const particles = []
  let animationActive = false

  class Particle {
    constructor(x, y, targetX, targetY, color) {
      this.x = x
      this.y = y
      this.size = Math.random() * 3 + 2
      this.speedX = (targetX - x) / 100
      this.speedY = (targetY - y) / 100
      this.targetX = targetX
      this.targetY = targetY
      this.color = color
      this.alpha = 1
      this.reached = false
    }

    update() {
      if (!this.reached) {
        this.x += this.speedX
        this.y += this.speedY

        // Check if particle reached target
        const dx = Math.abs(this.x - this.targetX)
        const dy = Math.abs(this.y - this.targetY)

        if (dx < 5 && dy < 5) {
          this.reached = true
        }
      } else {
        this.alpha -= 0.05
      }
    }

    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = this.color.replace(")", `, ${this.alpha})`)
      ctx.fill()
    }
  }

  function getNodePosition(nodeId) {
    const node = document.getElementById(nodeId)
    const rect = node.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()

    return {
      x: rect.left - canvasRect.left + rect.width / 2,
      y: rect.top - canvasRect.top + rect.height / 2,
    }
  }

  function createParticles(startNodeId, endNodeId, color, count = 20) {
    const startPos = getNodePosition(startNodeId)
    const endPos = getNodePosition(endNodeId)

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        particles.push(
          new Particle(
            startPos.x + (Math.random() * 20 - 10),
            startPos.y + (Math.random() * 20 - 10),
            endPos.x + (Math.random() * 20 - 10),
            endPos.y + (Math.random() * 20 - 10),
            color,
          ),
        )
      }, i * 50)
    }
  }

  function animate() {
    if (!animationActive) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connection lines between nodes
    const nodes = ["sensor-node", "raspberry-node", "wifi-node", "server-node", "dashboard-node"]
    ctx.strokeStyle = "rgba(55, 65, 81, 0.5)"
    ctx.lineWidth = 2

    for (let i = 0; i < nodes.length - 1; i++) {
      const startPos = getNodePosition(nodes[i])
      const endPos = getNodePosition(nodes[i + 1])

      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(endPos.x, endPos.y)
      ctx.stroke()
    }

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update()
      particles[i].draw()

      // Remove particles with zero alpha
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1)
        i--
      }
    }

    requestAnimationFrame(animate)
  }

  function startAnimation() {
    if (animationActive) return

    animationActive = true
    statusValue.textContent = "Active"
    statusValue.style.color = "var(--success-color)"

    // Create particles for each step of the data flow
    setTimeout(() => {
      createParticles("sensor-node", "raspberry-node", "rgba(16, 185, 129, 1)")
      setTimeout(() => {
        createParticles("raspberry-node", "wifi-node", "rgba(59, 130, 246, 1)")
        setTimeout(() => {
          createParticles("wifi-node", "server-node", "rgba(139, 92, 246, 1)")
          setTimeout(() => {
            createParticles("server-node", "dashboard-node", "rgba(236, 72, 153, 1)")
            setTimeout(() => {
              statusValue.textContent = "Completed"
              setTimeout(() => {
                statusValue.textContent = "Idle"
                statusValue.style.color = "var(--accent-primary)"
                animationActive = false
              }, 2000)
            }, 1500)
          }, 1000)
        }, 1000)
      }, 1000)
    }, 500)

    animate()
  }

  triggerButton.addEventListener("click", startAnimation)

  // Start demo button
  document.getElementById("start-demo-btn").addEventListener("click", () => {
    // Scroll to network flow section
    document.getElementById("network-flow").scrollIntoView({ behavior: "smooth" })
    // Start the animation after scrolling
    setTimeout(startAnimation, 1000)
  })
}

// Parking Map Simulation
function initParkingMap() {
  const parkingSlots = document.querySelectorAll(".parking-slot")
  const dataFlowSteps = document.getElementById("data-flow-steps")

  parkingSlots.forEach((slot) => {
    slot.addEventListener("click", function () {
      // Reset all slots
      parkingSlots.forEach((s) => {
        s.classList.remove("occupied", "available")
      })

      // Toggle slot status
      if (this.classList.contains("occupied")) {
        this.classList.remove("occupied")
        this.classList.add("available")
      } else {
        this.classList.add("occupied")
      }

      const slotId = this.getAttribute("data-slot")

      // Update data flow steps
      dataFlowSteps.innerHTML = ""

      const steps = [
        { icon: "🅿️", label: `Slot ${slotId} status changed` },
        { icon: "📡", label: "Sensor detects change" },
        { icon: "🥧", label: "Raspberry Pi processes data" },
        { icon: "📤", label: `HTTP POST to /api/parking/update` },
        { icon: "🖥️", label: "Server received data" },
        { icon: "📊", label: "Dashboard updated" },
      ]

      steps.forEach((step, index) => {
        const stepElement = document.createElement("div")
        stepElement.className = "flow-step fade-in"
        stepElement.style.animationDelay = `${index * 0.2}s`
        stepElement.innerHTML = `
          <div class="step-icon">${step.icon}</div>
          <div class="step-label">${step.label}</div>
        `
        dataFlowSteps.appendChild(stepElement)
      })
    })
  })
}

// OSI Model Explanation
function initOsiModel() {
  const osiLayers = document.querySelectorAll(".osi-layer")

  osiLayers.forEach((layer) => {
    // Add animated-element class to all layers
    layer.classList.add("animated-element")

    // Create layer details element if it doesn't exist
    if (!layer.querySelector(".layer-details")) {
      const layerName = layer.getAttribute("data-layer")
      const layerNumber = layer.querySelector(".layer-number").textContent
      const layerTooltip = layer.querySelector(".layer-tooltip")

      // Create layer details from tooltip content
      const layerDetails = document.createElement("div")
      layerDetails.className = "layer-details"
      layerDetails.innerHTML = layerTooltip.innerHTML

      // Add animation elements
      const animationEl = document.createElement("div")
      animationEl.className = "layer-animation"
      animationEl.innerHTML = `<div class="animation-icon ${layerName}-icon float">🔄</div>`
      layerDetails.appendChild(animationEl)

      layer.appendChild(layerDetails)
    }

    // Add click event to show details
    layer.addEventListener("click", function () {
      // Remove active class from all layers
      osiLayers.forEach((l) => l.classList.remove("active"))

      // Add active class to clicked layer
      this.classList.add("active")

      // Add floating animation to the layer icon
      const layerIcon = this.querySelector(".layer-number")
      layerIcon.classList.add("float")

      // Remove animation after details are closed
      setTimeout(() => {
        if (!this.classList.contains("active")) {
          layerIcon.classList.remove("float")
        }
      }, 3000)
    })
  })

  // Close layer details when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".osi-layer")) {
      osiLayers.forEach((layer) => {
        layer.classList.remove("active")
        const layerIcon = layer.querySelector(".layer-number")
        layerIcon.classList.remove("float")
      })
    }
  })
}

// Ping/Latency Simulator
function initPingSimulator() {
  const startPingBtn = document.getElementById("start-ping")
  const stopPingBtn = document.getElementById("stop-ping")
  const pingPacket = document.getElementById("ping-packet")
  const latencyValue = document.getElementById("latency-value")
  const ttlValue = document.getElementById("ttl-value")
  const hopsValue = document.getElementById("hops-value")
  const pingLogContent = document.getElementById("ping-log-content")

  let pingInterval
  let pingCount = 0

  function startPing() {
    startPingBtn.disabled = true
    stopPingBtn.disabled = false
    pingCount = 0

    pingInterval = setInterval(() => {
      pingCount++
      simulatePing()

      if (pingCount >= 10) {
        stopPing()
      }
    }, 3000)

    simulatePing()
  }

  function stopPing() {
    clearInterval(pingInterval)
    startPingBtn.disabled = false
    stopPingBtn.disabled = true
    pingPacket.style.display = "none"
  }

  function simulatePing() {
    // Reset packet position
    pingPacket.style.left = "0%"
    pingPacket.style.display = "block"

    // Generate random latency between 2-15ms
    const latency = Math.floor(Math.random() * 13) + 2
    const ttl = 64
    const hops = 2

    // Animate packet
    setTimeout(() => {
      pingPacket.style.left = "50%"
      setTimeout(() => {
        pingPacket.style.left = "100%"
        setTimeout(() => {
          pingPacket.style.display = "none"

          // Update metrics
          latencyValue.textContent = `${latency} ms`
          ttlValue.textContent = ttl
          hopsValue.textContent = hops

          // Add log entry
          const logEntry = document.createElement("div")
          logEntry.className = "log-entry"
          logEntry.textContent = `[${new Date().toLocaleTimeString()}] 64 bytes from 192.168.1.10: icmp_seq=${pingCount} ttl=${ttl} time=${latency} ms`
          pingLogContent.prepend(logEntry)
        }, 500)
      }, 500)
    }, 500)
  }

  startPingBtn.addEventListener("click", startPing)
  stopPingBtn.addEventListener("click", stopPing)
}

// Testing Tools Showcase
function initTestingTools() {
  const toolButtons = document.querySelectorAll(".tool-button")
  const terminalOutput = document.getElementById("terminal-output")

  const toolOutputs = {
    ping: `<div class="command-line">
      <span class="prompt">smartpark@server:~$</span>
      <span class="command">ping 192.168.1.100</span>
    </div>
    <div class="output-line">PING 192.168.1.100 (192.168.1.100) 56(84) bytes of data.</div>
    <div class="output-line">64 bytes from 192.168.1.100: icmp_seq=1 ttl=64 time=2.05 ms</div>
    <div class="output-line">64 bytes from 192.168.1.100: icmp_seq=2 ttl=64 time=1.89 ms</div>
    <div class="output-line">64 bytes from 192.168.1.100: icmp_seq=3 ttl=64 time=2.12 ms</div>
    <div class="output-line">64 bytes from 192.168.1.100: icmp_seq=4 ttl=64 time=1.95 ms</div>
    <div class="output-line">64 bytes from 192.168.1.100: icmp_seq=5 ttl=64 time=2.01 ms</div>
    <div class="output-line">
      <br>
      --- 192.168.1.100 ping statistics ---
    </div>
    <div class="output-line">5 packets transmitted, 5 received, 0% packet loss, time 4007ms</div>
    <div class="output-line">rtt min/avg/max/mdev = 1.890/2.004/2.120/0.086 ms</div>`,

    traceroute: `<div class="command-line">
      <span class="prompt">smartpark@server:~$</span>
      <span class="command">traceroute 192.168.1.100</span>
    </div>
    <div class="output-line">traceroute to 192.168.1.100 (192.168.1.100), 30 hops max, 60 byte packets</div>
    <div class="output-line"> 1  gateway (192.168.1.1)  0.456 ms  0.412 ms  0.402 ms</div>
    <div class="output-line"> 2  192.168.1.100 (192.168.1.100)  1.875 ms  1.862 ms  1.843 ms</div>`,

    nmap: `<div class="command-line">
      <span class="prompt">smartpark@server:~$</span>
      <span class="command">nmap -sV 192.168.1.100</span>
    </div>
    <div class="output-line">Starting Nmap 7.93 ( https://nmap.org ) at 2025-05-26 18:54 UTC</div>
    <div class="output-line">Nmap scan report for sensor-node (192.168.1.100)</div>
    <div class="output-line">Host is up (0.0019s latency).</div>
    <div class="output-line">Not shown: 997 closed ports</div>
    <div class="output-line">PORT     STATE SERVICE VERSION</div>
    <div class="output-line">22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)</div>
    <div class="output-line">80/tcp   open  http    nginx 1.18.0 (Ubuntu)</div>
    <div class="output-line">1883/tcp open  mqtt    Mosquitto MQTT protocol 2.0.15</div>
    <div class="output-line">MAC Address: 00:1A:2B:3C:4D:5E (Unknown)</div>
    <div class="output-line">Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel</div>
    <div class="output-line">
      <br>
      Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
    </div>
    <div class="output-line">Nmap done: 1 IP address (1 host up) scanned in 8.75 seconds</div>`,

    wireshark: `<div class="command-line">
      <span class="prompt">smartpark@server:~$</span>
      <span class="command">tshark -i eth0 -c 5 host 192.168.1.100</span>
    </div>
    <div class="output-line">Capturing on 'eth0'</div>
    <div class="output-line">    1 0.000000000 192.168.1.10 → 192.168.1.100 TCP 74 43210 → 1883 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM=1 TSval=3302114018 TSecr=0 WS=128</div>
    <div class="output-line">    2 0.000152432 192.168.1.100 → 192.168.1.10 TCP 74 1883 → 43210 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0 MSS=1460 SACK_PERM=1 TSval=2698176932 TSecr=3302114018 WS=128</div>
    <div class="output-line">    3 0.000264341 192.168.1.10 → 192.168.1.100 TCP 66 43210 → 1883 [ACK] Seq=1 Ack=1 Win=64256 Len=0 TSval=3302114018 TSecr=2698176932</div>
    <div class="output-line">    4 0.000908761 192.168.1.10 → 192.168.1.100 MQTT 90 Connect Command</div>
    <div class="output-line">    5 0.001172219 192.168.1.100 → 192.168.1.10 MQTT 69 Connect Ack</div>
    <div class="output-line">5 packets captured</div>`,
  }

  toolButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Update active button
      toolButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Update terminal output
      const tool = this.getAttribute("data-tool")
      terminalOutput.innerHTML = toolOutputs[tool]

      // Add typing animation effect
      const commandLine = terminalOutput.querySelector(".command")
      const originalText = commandLine.textContent
      commandLine.textContent = ""

      let i = 0
      const typeInterval = setInterval(() => {
        if (i < originalText.length) {
          commandLine.textContent += originalText.charAt(i)
          i++
        } else {
          clearInterval(typeInterval)
        }
      }, 50)
    })
  })
}

// GeoMap of System Reachability
function initGeoMap() {
  const geoMapSvg = document.getElementById("geo-map-svg")
  const zoomInBtn = document.getElementById("zoom-in")
  const zoomOutBtn = document.getElementById("zoom-out")
  const resetMapBtn = document.getElementById("reset-map")

  // Create a simplified world map using SVG
  const worldMap = `
    <svg viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect x="0" y="0" width="1000" height="500" fill="#0a0e17" />
      
      <!-- Continents (simplified) -->
      <path d="M150,120 Q250,80 350,120 T550,150 T750,120 T900,150 L900,250 Q750,280 600,250 T350,280 T150,250 Z" fill="#1f2937" stroke="#374151" stroke-width="2" />
      <path d="M200,300 Q300,280 400,300 T600,320 T800,300 L800,400 Q650,420 500,400 T250,420 Z" fill="#1f2937" stroke="#374151" stroke-width="2" />
      
      <!-- Parking Lot Location -->
      <circle id="parking-location" cx="300" cy="200" r="10" fill="#10b981" class="pulse" />
      
      <!-- Server Location -->
      <circle id="server-location" cx="500" cy="250" r="10" fill="#3b82f6" class="pulse" />
      
      <!-- Client Access Points -->
      <circle class="client-point" cx="700" cy="150" r="5" fill="#8b5cf6" />
      <circle class="client-point" cx="400" cy="350" r="5" fill="#8b5cf6" />
      <circle class="client-point" cx="600" cy="180" r="5" fill="#8b5cf6" />
      <circle class="client-point" cx="250" cy="280" r="5" fill="#8b5cf6" />
      
      <!-- Data Paths -->
      <path d="M300,200 C350,220 450,230 500,250" stroke="#10b981" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      <path d="M500,250 C550,230 650,170 700,150" stroke="#3b82f6" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      <path d="M500,250 C480,280 420,330 400,350" stroke="#3b82f6" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      <path d="M500,250 C530,230 580,190 600,180" stroke="#3b82f6" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      <path d="M500,250 C450,260 300,270 250,280" stroke="#3b82f6" stroke-width="2" fill="none" stroke-dasharray="5,5" />
      
      <!-- Labels -->
      <text x="290" y="185" fill="#ffffff" font-size="12" text-anchor="end">Smart Parking Lot</text>
      <text x="510" y="270" fill="#ffffff" font-size="12">Cloud Server</text>
      <text x="710" y="145" fill="#ffffff" font-size="12">Mobile App</text>
      <text x="410" y="365" fill="#ffffff" font-size="12">Web Dashboard</text>
      <text x="610" y="175" fill="#ffffff" font-size="12">Admin Panel</text>
      <text x="240" y="295" fill="#ffffff" font-size="12" text-anchor="end">Maintenance Team</text>
    </svg>
  `

  geoMapSvg.innerHTML = worldMap

  // Zoom functionality
  let scale = 1
  let translateX = 0
  let translateY = 0

  function updateMapTransform() {
    const svg = geoMapSvg.querySelector("svg")
    svg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`
  }

  zoomInBtn.addEventListener("click", () => {
    if (scale < 3) {
      scale += 0.5
      updateMapTransform()
    }
  })

  zoomOutBtn.addEventListener("click", () => {
    if (scale > 0.5) {
      scale -= 0.5
      updateMapTransform()
    }
  })

  resetMapBtn.addEventListener("click", () => {
    scale = 1
    translateX = 0
    translateY = 0
    updateMapTransform()
  })

  // Pan functionality
  let isDragging = false
  let startX, startY

  geoMapSvg.addEventListener("mousedown", (e) => {
    isDragging = true
    startX = e.clientX - translateX
    startY = e.clientY - translateY
    geoMapSvg.style.cursor = "grabbing"
  })

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      translateX = e.clientX - startX
      translateY = e.clientY - startY
      updateMapTransform()
    }
  })

  document.addEventListener("mouseup", () => {
    isDragging = false
    geoMapSvg.style.cursor = "grab"
  })

  // Add hover effect to locations
  const locations = geoMapSvg.querySelectorAll("circle")
  locations.forEach((location) => {
    location.addEventListener("mouseover", function () {
      this.setAttribute("r", Number.parseInt(this.getAttribute("r")) * 1.5)
    })

    location.addEventListener("mouseout", function () {
      this.setAttribute("r", Number.parseInt(this.getAttribute("r")) / 1.5)
    })
  })
}

// Packet Journey Infographic
function initPacketJourney() {
  const journeySteps = document.querySelectorAll(".journey-step")

  journeySteps.forEach((step) => {
    step.addEventListener("click", function () {
      // Remove active class from all steps
      journeySteps.forEach((s) => s.classList.remove("active"))

      // Add active class to clicked step
      this.classList.add("active")
    })
  })
}

// Download Button
function initDownloadButton() {
  const downloadBtn = document.getElementById("download-report")

  downloadBtn.addEventListener("click", (e) => {
    e.preventDefault()

    // Create a dummy PDF download (in a real implementation, this would be a real PDF)
    alert(
      "In a real implementation, this would download the SmartPark_CN_Implementation.pdf file with detailed network documentation.",
    )
  })
}

// Add these functions at the end of the file

// Protocol Cards Flip Animation
function initProtocolsSection() {
  const protocolCards = document.querySelectorAll(".protocol-card")

  protocolCards.forEach((card) => {
    card.addEventListener("click", function () {
      this.classList.toggle("flipped")
    })
  })
}

// Real-Time Network Monitor
function initRealTimeMonitor() {
  const startMonitorBtn = document.getElementById("start-monitor")
  const stopMonitorBtn = document.getElementById("stop-monitor")
  const monitorInterval = document.getElementById("monitor-interval")
  const trafficChartCanvas = document.getElementById("traffic-chart")
  const successGaugeCanvas = document.getElementById("success-gauge")
  const successRateValue = document.getElementById("success-rate-value")
  const connectionsList = document.getElementById("connections-list")
  const eventsLog = document.getElementById("events-log")

  if (!startMonitorBtn || !stopMonitorBtn) return

  let monitoringInterval
  let trafficChart
  let successGauge

  // Initialize charts
  initTrafficChart()
  initSuccessGauge()

  function initTrafficChart() {
    // Create a simple traffic chart using canvas
    const ctx = trafficChartCanvas.getContext("2d")
    const width = (trafficChartCanvas.width = trafficChartCanvas.parentElement.clientWidth)
    const height = (trafficChartCanvas.height = 200)

    // Initial data
    const dataPoints = Array(30).fill(0)

    function drawChart() {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background grid
      ctx.strokeStyle = "rgba(55, 65, 81, 0.3)"
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw data line
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.beginPath()

      const maxValue = Math.max(...dataPoints, 10)

      dataPoints.forEach((value, index) => {
        const x = (width / (dataPoints.length - 1)) * index
        const y = height - (value / maxValue) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Add gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)")
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")

      ctx.fillStyle = gradient
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()
      ctx.fill()
    }

    // Update data and redraw
    function updateTrafficData() {
      // Shift data points left
      dataPoints.shift()

      // Add new random data point
      const newValue = Math.random() * 50 + 10
      dataPoints.push(newValue)

      drawChart()
    }

    // Initial draw
    drawChart()

    // Expose update function
    trafficChart = {
      update: updateTrafficData,
    }
  }

  function initSuccessGauge() {
    // Create a simple gauge using canvas
    const ctx = successGaugeCanvas.getContext("2d")
    const width = (successGaugeCanvas.width = successGaugeCanvas.parentElement.clientWidth)
    const height = (successGaugeCanvas.height = 200)
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    let successRate = 0

    function drawGauge() {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background arc
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false)
      ctx.lineWidth = 20
      ctx.strokeStyle = "rgba(55, 65, 81, 0.3)"
      ctx.stroke()

      // Draw success rate arc
      const endAngle = Math.PI + (successRate / 100) * Math.PI

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false)
      ctx.lineWidth = 20

      // Gradient color based on success rate
      let color
      if (successRate >= 90) {
        color = "#10b981" // Green for high success
      } else if (successRate >= 70) {
        color = "#f59e0b" // Yellow for medium success
      } else {
        color = "#ef4444" // Red for low success
      }

      ctx.strokeStyle = color
      ctx.stroke()

      // Update text value
      if (successRateValue) {
        successRateValue.textContent = `${Math.round(successRate)}%`
        successRateValue.style.color = color
      }
    }

    // Update success rate and redraw
    function updateSuccessRate() {
      // Random success rate between 70% and 100%
      successRate = Math.random() * 30 + 70
      drawGauge()
    }

    // Initial draw
    drawGauge()

    // Expose update function
    successGauge = {
      update: updateSuccessRate,
    }
  }

  function updateConnectionsList() {
    if (!connectionsList) return

    // Simulate connection changes
    const connections = connectionsList.querySelectorAll(".connection-item")

    connections.forEach((connection) => {
      // 10% chance to change status
      if (Math.random() < 0.1) {
        const status = connection.querySelector(".connection-status")
        if (status.classList.contains("active")) {
          status.classList.remove("active")
          status.classList.add("inactive")
          status.textContent = "Inactive"
        } else {
          status.classList.remove("inactive")
          status.classList.add("active")
          status.textContent = "Active"
        }
      }
    })
  }

  function addNetworkEvent() {
    if (!eventsLog) return

    const eventTypes = ["info", "warning", "error"]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    const eventMessages = [
      "Sensor Node connected",
      "High latency detected",
      "Connection timeout",
      "Authentication successful",
      "Data packet received",
      "MQTT subscription updated",
      "System health check completed",
      "Firewall rule updated",
      "Network interface restarted",
    ]

    const message = eventMessages[Math.floor(Math.random() * eventMessages.length)]

    // Create new event item
    const eventItem = document.createElement("div")
    eventItem.className = "event-item"

    // Current time
    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`

    eventItem.innerHTML = `
      <div class="event-time">${timeString}</div>
      <div class="event-type ${eventType}">${eventType.toUpperCase()}</div>
      <div class="event-message">${message}</div>
    `

    // Add to log
    eventsLog.prepend(eventItem)

    // Limit to 10 events
    const events = eventsLog.querySelectorAll(".event-item")
    if (events.length > 10) {
      eventsLog.removeChild(events[events.length - 1])
    }
  }

  function startMonitoring() {
    const interval = Number.parseInt(monitorInterval.value)

    startMonitorBtn.disabled = true
    stopMonitorBtn.disabled = false

    // Update charts and data
    monitoringInterval = setInterval(() => {
      if (trafficChart) trafficChart.update()
      if (successGauge) successGauge.update()
      updateConnectionsList()

      // 30% chance to add a new event
      if (Math.random() < 0.3) {
        addNetworkEvent()
      }
    }, interval)
  }

  function stopMonitoring() {
    clearInterval(monitoringInterval)
    startMonitorBtn.disabled = false
    stopMonitorBtn.disabled = true
  }

  startMonitorBtn.addEventListener("click", startMonitoring)
  stopMonitorBtn.addEventListener("click", stopMonitoring)
}

// Add animation classes to existing elements
function addAnimationsToExistingElements() {
  // Add animated-element class to security cards
  document.querySelectorAll(".security-card").forEach((card) => {
    card.classList.add("animated-element")
  })

  // Add animated-element class to journey steps
  document.querySelectorAll(".journey-step").forEach((step) => {
    step.classList.add("animated-element")
  })

  // Add pulse-glow animation to the start demo button
  const startDemoBtn = document.getElementById("start-demo-btn")
  if (startDemoBtn) {
    startDemoBtn.classList.add("pulse-glow")
  }

  // Add float animation to specific elements
  document.querySelectorAll(".node-icon").forEach((icon) => {
    icon.classList.add("float")
  })
}
