// Main JavaScript for Railway Navigation App

// Import necessary functions
// import { parseQRData, getLocationDescription, formatQRDataForDisplay } from "./qr-data.js"
// import { getTranslation } from "./translation.js"
// import { getDirections } from "./directions.js"
// import { Html5Qrcode } from "html5qrcode"

// Station data
const platforms = [
  { id: 1, name: "Platform 1" },
  { id: 2, name: "Platform 2" },
  { id: 3, name: "Platform 3" },
  { id: 4, name: "Platform 4" },
  { id: 5, name: "Platform 5" },
  { id: 6, name: "Platform 6" },
  { id: 7, name: "Platform 7" },
  { id: 8, name: "Platform 8" },
]

const positions = [
  { id: "north", name: "North" },
  { id: "middle", name: "Middle" },
  { id: "south", name: "South" },
]

// Expanded destinations list
const destinations = [
  { id: 1, name: "Exit Gate 1" },
  { id: 2, name: "Exit Gate 2" },
  { id: 3, name: "Exit Gate 3" },
  { id: 4, name: "Exit Gate 4" },
  { id: 5, name: "Exit Gate 5" },
  { id: 6, name: "Ticket Counter" },
  { id: 7, name: "Railway New Colony" },
  { id: 8, name: "Akkayapalem" },
  { id: 9, name: "RTC Complex" },
  { id: 10, name: "Airport" },
  { id: 11, name: "Sethamadhara" },
  { id: 12, name: "NAD Junction" },
  { id: 13, name: "Jagadhamba" },
  { id: 14, name: "Beach" },
  { id: 15, name: "Janapuram" },
  { id: 16, name: "Convent Junction" },
]

// Add the accessibility options data
const accessibilityOptions = [
  { id: "stairs", name: "Stairs" },
  { id: "lifts", name: "Lifts" },
  { id: "escalator", name: "Escalator" },
  { id: "ramps", name: "Ramps" },
]

// App state
let currentLanguage = localStorage.getItem("language") || "en"
let currentPlatform = ""
let currentPosition = ""
let currentDestination = ""
let currentAccessibility = ""
let currentStep = 0
let zoomLevel = 1
let showFullMap = false
let qrScanner = null
let isScanning = false

// Pinch zoom variables
let initialDistance = 0
let initialZoom = 1
let isPinching = false

// Translation function
let t = getTranslation(currentLanguage)

// DOM Elements
const loadingAnimation = document.getElementById("loading-animation")
const languageSelect = document.getElementById("language-select")
const platformSelect = document.getElementById("platform-select")
const positionSelect = document.getElementById("position-select")
const destinationSelect = document.getElementById("destination-select")
const accessibilitySelect = document.getElementById("accessibility-select")
const scanQrButton = document.getElementById("scan-qr-button")
const navigationContent = document.getElementById("navigation-content")
const mapTab = document.getElementById("map-tab")
const directionsTab = document.getElementById("directions-tab")
const mapContent = document.getElementById("map-content")
const directionsContent = document.getElementById("directions-content")
const mapPlaceholder = document.getElementById("map-placeholder")
const mapImageContainer = document.getElementById("map-image-container")
const mapImage = document.getElementById("map-image")
const toggleMapButton = document.getElementById("toggle-map-button")
const zoomInButton = document.getElementById("zoom-in")
const zoomOutButton = document.getElementById("zoom-out")
const directionsPlaceholder = document.getElementById("directions-placeholder")
const directionsSteps = document.getElementById("directions-steps")
const directionsFooter = document.getElementById("directions-footer")
const prevStepButton = document.getElementById("prev-step-button")
const nextStepButton = document.getElementById("next-step-button")
const currentStepElement = document.getElementById("current-step")
const totalStepsElement = document.getElementById("total-steps")
const qrScannerModal = document.getElementById("qr-scanner-modal")
const closeQrScanner = document.getElementById("close-qr-scanner")
const startScanningButton = document.getElementById("start-scanning-button")
const stopScanningButton = document.getElementById("stop-scanning-button")
const qrScannerError = document.getElementById("qr-scanner-error")
const qrResult = document.getElementById("qr-result")
const qrResultContent = document.getElementById("qr-result-content")

// Initialize the app
function initApp() {
  // Set initial language
  languageSelect.value = currentLanguage

  // Populate dropdowns
  populateDropdowns()

  // Update UI with translations
  updateTranslations()

  // Add event listeners
  addEventListeners()

  // Add pinch-to-zoom functionality
  setupPinchToZoom()

  // Add scroll-to-zoom functionality
  setupScrollToZoom()

  // Show loading animation
  setTimeout(() => {
    loadingAnimation.style.opacity = "0"
    setTimeout(() => {
      loadingAnimation.style.visibility = "hidden"
    }, 500)
  }, 1500)
}

// Setup pinch-to-zoom functionality
function setupPinchToZoom() {
  // Add touch event listeners to the map container
  mapContent.addEventListener("touchstart", handleTouchStart, { passive: false })
  mapContent.addEventListener("touchmove", handleTouchMove, { passive: false })
  mapContent.addEventListener("touchend", handleTouchEnd, { passive: false })
}

// Setup scroll-to-zoom functionality
function setupScrollToZoom() {
  // Add wheel event listener to the map container
  mapContent.addEventListener("wheel", handleWheel, { passive: false })
}

// Handle wheel event for scroll-to-zoom
function handleWheel(e) {
  // Prevent default scrolling behavior
  e.preventDefault()

  // Determine scroll direction and adjust zoom level
  // deltaY is positive when scrolling down, negative when scrolling up
  const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1

  // Apply new zoom level (with limits)
  zoomLevel = Math.min(2, Math.max(0.5, zoomLevel + zoomDelta))

  // Update the zoom
  updateZoom()
}

// Handle touch start event
function handleTouchStart(e) {
  if (e.touches.length === 2) {
    // Prevent default behavior to avoid page zooming
    e.preventDefault()

    // Calculate initial distance between two fingers
    initialDistance = getDistance(
      e.touches[0].clientX,
      e.touches[0].clientY,
      e.touches[1].clientX,
      e.touches[1].clientY,
    )

    // Store initial zoom level
    initialZoom = zoomLevel
    isPinching = true
  }
}

// Handle touch move event
function handleTouchMove(e) {
  if (isPinching && e.touches.length === 2) {
    // Prevent default behavior
    e.preventDefault()

    // Calculate new distance between fingers
    const currentDistance = getDistance(
      e.touches[0].clientX,
      e.touches[0].clientY,
      e.touches[1].clientX,
      e.touches[1].clientY,
    )

    // Calculate zoom ratio
    const ratio = currentDistance / initialDistance

    // Apply new zoom level (with limits)
    zoomLevel = Math.min(2, Math.max(0.5, initialZoom * ratio))

    // Update the zoom
    updateZoom()
  }
}

// Handle touch end event
function handleTouchEnd(e) {
  if (isPinching) {
    isPinching = false
  }
}

// Calculate distance between two points
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Populate dropdowns with data
function populateDropdowns() {
  // Platforms
  platforms.forEach((platform) => {
    const option = document.createElement("option")
    option.value = platform.id
    option.textContent = t(`platform${platform.id}`)
    platformSelect.appendChild(option)
  })

  // Positions
  positions.forEach((position) => {
    const option = document.createElement("option")
    option.value = position.id
    option.textContent = t(position.id)
    positionSelect.appendChild(option)
  })

  // Destinations
  destinations.forEach((destination) => {
    const option = document.createElement("option")
    option.value = destination.id
    option.textContent = t(`exit${destination.id}`)
    destinationSelect.appendChild(option)
  })

  // Accessibility options
  accessibilityOptions.forEach((option) => {
    const optionElement = document.createElement("option")
    optionElement.value = option.id
    optionElement.textContent = t(option.id)
    accessibilitySelect.appendChild(optionElement)
  })
}

// Update UI with translations
function updateTranslations() {
  // Update function with current language
  t = getTranslation(currentLanguage)

  // Update static text elements
  document.getElementById("app-title").textContent = t("railwayNavigator")
  document.getElementById("find-your-way").textContent = t("findYourWay")
  document.getElementById("platform-label").textContent = t("platform")
  document.getElementById("position-label").textContent = t("position")
  document.getElementById("destination-label").textContent = t("destination")
  document.getElementById("accessibility-label").textContent = t("accessibility")
  document.getElementById("select-platform").textContent = t("selectPlatform")
  document.getElementById("select-position").textContent = t("selectPosition")
  document.getElementById("select-destination").textContent = t("selectDestination")
  document.getElementById("select-accessibility").textContent = t("selectAccessibility")
  document.getElementById("scan-qr-text") && (document.getElementById("scan-qr-text").textContent = t("scanQRCode"))
  document.getElementById("map-text").textContent = t("map")
  document.getElementById("directions-text").textContent = t("directions")
  document.getElementById("select-all-options").textContent = t("selectAllOptions")
  document.getElementById("no-directions-available").textContent = t("noDirectionsAvailable")
  document.getElementById("full-station-map-text").textContent = showFullMap ? t("showRoute") : t("fullStationMap")
  document.getElementById("step-text").textContent = t("step")
  document.getElementById("previous-step-text").textContent = t("previousStep")
  document.getElementById("next-step-text").textContent = t("nextStep")
  document.getElementById("scan-qr-code-title").textContent = t("scanQRCode")
  document.getElementById("start-scanning-text").textContent = t("startScanning")
  document.getElementById("stop-scanning-text").textContent = t("stopScanning")

  // Update dropdown options
  updateDropdownOptions(platformSelect, platforms, "platform")
  updateDropdownOptions(positionSelect, positions, "position")
  updateDropdownOptions(destinationSelect, destinations, "destination")
  updateDropdownOptions(accessibilitySelect, accessibilityOptions, "accessibility")

  // Update directions if available
  if (currentPlatform && currentPosition && currentDestination && currentAccessibility) {
    updateDirections()
  }
}

// Update dropdown options with translations
function updateDropdownOptions(selectElement, options, prefix) {
  // Save current value
  const currentValue = selectElement.value

  // Clear options except the first one (placeholder)
  while (selectElement.options.length > 1) {
    selectElement.remove(1)
  }

  // Add translated options
  options.forEach((option) => {
    const optionElement = document.createElement("option")
    optionElement.value = option.id

    // Use appropriate translation key based on the dropdown type
    if (prefix === "platform") {
      optionElement.textContent = t(`platform${option.id}`)
    } else if (prefix === "position") {
      optionElement.textContent = t(option.id)
    } else if (prefix === "destination") {
      optionElement.textContent = t(`exit${option.id}`)
    } else if (prefix === "accessibility") {
      optionElement.textContent = t(option.id)
    }

    selectElement.appendChild(optionElement)
  })

  // Restore selected value
  selectElement.value = currentValue
}

// Add event listeners
function addEventListeners() {
  // Language selector
  languageSelect.addEventListener("change", (e) => {
    currentLanguage = e.target.value
    localStorage.setItem("language", currentLanguage)
    updateTranslations()
  })

  // Platform selector
  platformSelect.addEventListener("change", (e) => {
    currentPlatform = e.target.value
    updateNavigation()

    // Add animation class
    platformSelect.classList.add("selected")
    setTimeout(() => platformSelect.classList.remove("selected"), 300)
  })

  // Position selector
  positionSelect.addEventListener("change", (e) => {
    currentPosition = e.target.value
    updateNavigation()

    // Add animation class
    positionSelect.classList.add("selected")
    setTimeout(() => positionSelect.classList.remove("selected"), 300)
  })

  // Destination selector
  destinationSelect.addEventListener("change", (e) => {
    currentDestination = e.target.value
    updateNavigation()

    // Add animation class
    destinationSelect.classList.add("selected")
    setTimeout(() => destinationSelect.classList.remove("selected"), 300)
  })

  // Accessibility selector
  accessibilitySelect.addEventListener("change", (e) => {
    currentAccessibility = e.target.value
    updateNavigation()

    // Add animation class
    accessibilitySelect.classList.add("selected")
    setTimeout(() => accessibilitySelect.classList.remove("selected"), 300)
  })

  // QR Scanner button
  scanQrButton.addEventListener("click", () => {
    qrScannerModal.classList.remove("hidden")
    qrResult.classList.add("hidden")
  })

  // Close QR Scanner
  closeQrScanner.addEventListener("click", () => {
    stopQrScanner()
    qrScannerModal.classList.add("hidden")
  })

  // Start scanning button
  startScanningButton.addEventListener("click", startQrScanner)

  // Stop scanning button
  stopScanningButton.addEventListener("click", stopQrScanner)

  // Tab buttons
  mapTab.addEventListener("click", () => {
    setActiveTab("map")
  })

  directionsTab.addEventListener("click", () => {
    setActiveTab("directions")
  })

  // Zoom controls
  zoomInButton.addEventListener("click", () => {
    zoomLevel = Math.min(2, zoomLevel + 0.2)
    updateZoom()
  })

  zoomOutButton.addEventListener("click", () => {
    zoomLevel = Math.max(0.5, zoomLevel - 0.2)
    updateZoom()
  })

  // Toggle map button
  toggleMapButton.addEventListener("click", () => {
    showFullMap = !showFullMap
    updateMap()
    toggleMapButton.querySelector("span").textContent = showFullMap ? t("showRoute") : t("fullStationMap")
  })

  // Step navigation buttons
  prevStepButton.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1)
    updateStepHighlight()
  })

  nextStepButton.addEventListener("click", () => {
    currentStep = Math.min(getDirectionSteps().length - 1, currentStep + 1)
    updateStepHighlight()
  })
}

// Update navigation based on selections
function updateNavigation() {
  // Reset zoom and step
  zoomLevel = 1
  currentStep = 0

  // Check if all selections are made
  if (currentPlatform && currentPosition && currentDestination && currentAccessibility) {
    navigationContent.classList.remove("hidden")
    updateMap()
    updateDirections()
  } else {
    navigationContent.classList.add("hidden")
  }
}

// Update map display
function updateMap() {
  const imagePath = getImagePath()
  if (imagePath) {
    mapImage.src = imagePath
    mapImageContainer.classList.remove("hidden")
    mapPlaceholder.classList.add("hidden")
  } else {
    mapImageContainer.classList.add("hidden")
    mapPlaceholder.classList.remove("hidden")
  }

  updateZoom()
}

// Get image path based on selections
function getImagePath() {
  const accessibilityPath = `images/platform_${currentPlatform}/position_${currentPosition}_${currentDestination}_${currentAccessibility}.png`
  const generalPath = `images/fullMap.svg`

  if (!currentPlatform || !currentPosition || !currentDestination || !currentAccessibility) {
    return null
  }

  /*
   * SVG IMAGE STORAGE INSTRUCTIONS:
   *
   * 1. Create a folder structure as follows:
   *    - images/
   *      - platform_1/
   *      - platform_2/
   *      - ... (one folder for each platform)
   *
   * 2. Name your SVG files using this pattern:
   *    position_[position]_[destination].svg
   *    Example: position_north_1.svg for north position to Exit Gate 1
   *
   * 3. For accessibility-specific routes, use:
   *    position_[position]_[destination]_[accessibility].svg
   *    Example: position_north_1_ramps.svg for north position to Exit Gate 1 using ramps
   *
   * 4. Place a full station map at:
   *    images/full_station_map.svg
   *
   * 5. The app will first try to load accessibility-specific maps, then fall back to general maps
   */

  // Try to get a specific image with accessibility
  if (toggleMapButton.innerText == "Show Route") {
    return accessibilityPath
  }
  // If the specific image doesn't exist, fall back to the general one
  else {
    return generalPath
  }
}

// Update zoom level
function updateZoom() {
  mapImageContainer.style.transform = `scale(${zoomLevel})`

  // Update button states
  zoomInButton.disabled = zoomLevel >= 2
  zoomOutButton.disabled = zoomLevel <= 0.5
}

// Update directions
function updateDirections() {
  const directions = getDirections(
    currentPlatform,
    currentPosition,
    currentDestination,
    currentAccessibility,
    currentLanguage,
  )

  if (directions) {
    const steps = getDirectionSteps()

    // Clear previous steps
    directionsSteps.innerHTML = ""

    // Add new steps
    steps.forEach((step, index) => {
      const stepElement = document.createElement("div")
      stepElement.className = `direction-step ${index === 0 ? "active" : ""}`
      stepElement.dataset.step = index

      const stepContent = document.createElement("div")
      stepContent.className = "step-content"

      const stepNumber = document.createElement("div")
      stepNumber.className = "step-number"
      stepNumber.textContent = index + 1

      const stepText = document.createElement("p")
      stepText.textContent = step

      stepContent.appendChild(stepNumber)
      stepContent.appendChild(stepText)
      stepElement.appendChild(stepContent)

      // Add animation delay for each step
      stepElement.style.animationDelay = `${index * 0.1}s`

      directionsSteps.appendChild(stepElement)
    })

    // Show steps and footer
    directionsSteps.classList.remove("hidden")
    directionsFooter.classList.remove("hidden")
    directionsPlaceholder.classList.add("hidden")

    // Update step counter
    currentStepElement.textContent = currentStep + 1
    totalStepsElement.textContent = steps.length

    // Update button states
    prevStepButton.disabled = currentStep === 0
    nextStepButton.disabled = currentStep === steps.length - 1
  } else {
    // Hide steps and footer, show placeholder
    directionsSteps.classList.add("hidden")
    directionsFooter.classList.add("hidden")
    directionsPlaceholder.classList.remove("hidden")
  }
}

// Get direction steps as array
function getDirectionSteps() {
  const directions = getDirections(
    currentPlatform,
    currentPosition,
    currentDestination,
    currentAccessibility,
    currentLanguage,
  )
  return directions ? directions.split("\n").filter((step) => step.trim()) : []
}

// Update step highlight
function updateStepHighlight() {
  // Remove active class from all steps
  const stepElements = directionsSteps.querySelectorAll(".direction-step")
  stepElements.forEach((el) => el.classList.remove("active"))

  // Add active class to current step
  const currentStepElement = directionsSteps.querySelector(`.direction-step[data-step="${currentStep}"]`)
  if (currentStepElement) {
    currentStepElement.classList.add("active")

    // Scroll to current step
    currentStepElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  // Update step counter
  document.getElementById("current-step").textContent = currentStep + 1

  // Update button states
  prevStepButton.disabled = currentStep === 0
  nextStepButton.disabled = currentStep === getDirectionSteps().length - 1
}

// Set active tab
function setActiveTab(tabId) {
  // Update tab buttons
  mapTab.classList.toggle("active", tabId === "map")
  directionsTab.classList.toggle("active", tabId === "directions")

  // Update tab content
  mapContent.classList.toggle("active", tabId === "map")
  directionsContent.classList.toggle("active", tabId === "directions")
}

// Start QR scanner
function startQrScanner() {
  if (isScanning) return

  const qrReader = document.getElementById("qr-reader")
  qrScannerError.classList.add("hidden")
  qrResult.classList.add("hidden")

  // Show scanning instructions
  const instructions = document.createElement("div")
  instructions.className = "qr-instructions"
  instructions.textContent = t("pointCameraAtQRCode")
  qrReader.appendChild(instructions)

  try {
    qrScanner = new Html5Qrcode("qr-reader")

    // Show loading indicator
    const loadingIndicator = document.createElement("div")
    loadingIndicator.className = "qr-loading"
    loadingIndicator.innerHTML = `<div class="spinner"></div><p>${t("accessingCamera")}</p>`
    qrReader.appendChild(loadingIndicator)

    // Get available cameras and select the appropriate one
    Html5Qrcode.getCameras()
      .then(cameras => {
        // Default to environment camera if available, otherwise use the first camera
        let cameraId = { facingMode: "environment" };

        // If we have multiple cameras, prefer the back camera
        if (cameras && cameras.length > 0) {
          // Try to find a back camera
          const backCamera = cameras.find(camera =>
            camera.label.toLowerCase().includes('back') ||
            camera.label.toLowerCase().includes('rear')
          );

          // Use back camera if found, otherwise use the first camera
          cameraId = backCamera ? backCamera.id : cameras[0].id;
        }

        return qrScanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Handle QR code result
            handleQrResult(decodedText)
            stopQrScanner()

            // Close the QR scanner modal after successful scan
            qrScannerModal.classList.add("hidden")
          },
          (errorMessage) => {
            // QR code scanning error (ignore)
            console.log(errorMessage)
          }
        );
      })
      .then(() => {
        isScanning = true
        startScanningButton.classList.add("hidden")
        stopScanningButton.classList.remove("hidden")

        // Remove loading indicator
        const loadingElement = qrReader.querySelector(".qr-loading")
        if (loadingElement) loadingElement.remove()

        // Update instructions
        if (instructions) {
          instructions.textContent = t("scanningForQRCodes")
          setTimeout(() => {
            if (qrReader.contains(instructions)) {
              instructions.remove()
            }
          }, 3000)
        }
      })
      .catch((err) => {
        qrScannerError.textContent = t("cameraAccessError")
        qrScannerError.classList.remove("hidden")
        console.error("Error starting QR scanner:", err)

        // Remove loading indicator
        const loadingElement = qrReader.querySelector(".qr-loading")
        if (loadingElement) loadingElement.remove()

        // Update instructions
        if (instructions) {
          instructions.textContent = t("cameraAccessDenied")
        }
      })
  } catch (err) {
    qrScannerError.textContent = t("cameraAccessError")
    qrScannerError.classList.remove("hidden")
    console.error("Error initializing QR scanner:", err)

    // Update instructions
    if (instructions) {
      instructions.textContent = t("scannerInitializationFailed")
    }
  }
}

// Stop QR scanner
function stopQrScanner() {
  if (qrScanner && isScanning) {
    qrScanner
      .stop()
      .then(() => {
        isScanning = false
        startScanningButton.classList.remove("hidden")
        stopScanningButton.classList.add("hidden")
      })
      .catch((err) => {
        console.error("Error stopping QR scanner:", err)
      })
  }
}

// Handle QR code result
function handleQrResult(result) {
  // Parse and validate QR data
  const qrData = parseQRData(result)

  if (qrData) {
    // Display QR result in modal
    displayQRResult(qrData)

    // Show success notification
    showNotification(t("qrCodeScanned"), getLocationDescription(qrData, t), "success")

    // Update platform selection
    platformSelect.value = qrData.platform
    currentPlatform = qrData.platform
    platformSelect.classList.add("has-value")
    platformSelect.classList.add("selected")
    platformSelect.classList.add("qr-highlight")
    setTimeout(() => platformSelect.classList.remove("selected"), 300)
    setTimeout(() => platformSelect.classList.remove("qr-highlight"), 1000)

    // Update position selection
    positionSelect.value = qrData.position
    currentPosition = qrData.position
    positionSelect.classList.add("has-value")
    positionSelect.classList.add("selected")
    positionSelect.classList.add("qr-highlight")
    setTimeout(() => positionSelect.classList.remove("selected"), 300)
    setTimeout(() => positionSelect.classList.remove("qr-highlight"), 1000)

    // Set accessibility if provided in QR code
    if (qrData.accessibility) {
      accessibilitySelect.value = qrData.accessibility
      currentAccessibility = qrData.accessibility
      accessibilitySelect.classList.add("has-value")
      accessibilitySelect.classList.add("selected")
      accessibilitySelect.classList.add("qr-highlight")
      setTimeout(() => accessibilitySelect.classList.remove("selected"), 300)
      setTimeout(() => accessibilitySelect.classList.remove("qr-highlight"), 1000)
    }

    // Update navigation
    updateNavigation()

    // If QR code is older than 24 hours, show a warning
    if (qrData.timestamp && Date.now() - qrData.timestamp > 24 * 60 * 60 * 1000) {
      showNotification(t("oldQRCode"), t("qrCodeMayBeOutdated"), "warning")
    }
  } else {
    // Show error notification for invalid QR code
    showNotification(t("invalidQRCode"), t("qrCodeFormatInvalid"), "error")

    // Display error in QR result area
    qrResult.classList.remove("hidden")
    qrResultContent.innerHTML = `
      <div class="qr-error">
        <p>${t("invalidQRCodeFormat")}</p>
        <p class="qr-raw-data">${result}</p>
      </div>
    `
  }
}

// Display QR result in modal
function displayQRResult(qrData) {
  // Format QR data for display
  const formattedData = formatQRDataForDisplay(qrData, t)

  if (formattedData) {
    qrResult.classList.remove("hidden")
    qrResultContent.innerHTML = ""

    // Create result items
    Object.keys(formattedData).forEach((key) => {
      const item = document.createElement("div")
      item.className = "qr-result-item"

      const label = document.createElement("span")
      label.className = "qr-result-label"
      label.textContent = formattedData[key].label

      const value = document.createElement("span")
      value.className = "qr-result-value"
      value.textContent = formattedData[key].value

      item.appendChild(label)
      item.appendChild(value)
      qrResultContent.appendChild(item)
    })
  }
}

// Show notification
function showNotification(title, message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <div class="notification-header">
      <h3>${title}</h3>
      <button class="close-notification">&times;</button>
    </div>
    <p>${message}</p>
  `

  // Add to document
  document.body.appendChild(notification)

  // Add animation
  setTimeout(() => notification.classList.add("show"), 10)

  // Add close button functionality
  notification.querySelector(".close-notification").addEventListener("click", () => {
    notification.classList.remove("show")
    setTimeout(() => notification.remove(), 300)
  })

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }
  }, 5000)
}

// Add CSS class for selected dropdowns
document.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", function () {
    if (this.value) {
      this.classList.add("has-value")
    } else {
      this.classList.remove("has-value")
    }
  })
})

//Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)

document.getElementById("scan-qr-button").addEventListener("click", function () {
  document.getElementById("qrModal").style.display = "block";
});

function closeQRModal() {
  document.getElementById("qrModal").style.display = "none";
}

// Listen for message from iframe
window.addEventListener('message', function (event) {
  if (event.data === 'closeModal') {
    closeQRModal();
  }
});

function openScannerPage() {
  // Open scanner.html in a modal
  const qrModal = document.getElementById("qrModal");
  qrModal.style.display = "block";
}

// Close the QR modal
function closeQRModal() {
  const qrModal = document.getElementById("qrModal");
  qrModal.style.display = "none";
}
