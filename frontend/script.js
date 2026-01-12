// ============================================
// Khmer Digit Recognition - Drawing Logic
// ============================================

// Canvas and context setup
const canvas = document.getElementById("drawingCanvas")
const ctx = canvas.getContext("2d")
const clearBtn = document.getElementById("clearBtn")
const predictBtn = document.getElementById("predictBtn")
const resultsContainer = document.getElementById("resultsContainer")
const errorContainer = document.getElementById("errorContainer")
const backendUrlElement = document.getElementById("backendUrl")

// Drawing state
let isDrawing = false
let strokes = [] // Array of strokes, each stroke is array of coordinates
let currentStroke = [] // Current stroke being drawn

// Configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"
const DRAWING_COLOR = "#2563eb"
const DRAWING_WIDTH = 3

// Initialize backend URL display
backendUrlElement.textContent = BACKEND_URL

// ============================================
// Canvas Setup and Styling
// ============================================

function setupCanvas() {
  // Set canvas background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Set drawing properties
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.lineWidth = DRAWING_WIDTH
  ctx.strokeStyle = DRAWING_COLOR
}

setupCanvas()

// ============================================
// Mouse Event Handlers
// ============================================

canvas.addEventListener("mousedown", (e) => {
  startDrawing(e.offsetX, e.offsetY)
})

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    draw(e.offsetX, e.offsetY)
  }
})

canvas.addEventListener("mouseup", () => {
  endDrawing()
})

canvas.addEventListener("mouseout", () => {
  if (isDrawing) {
    endDrawing()
  }
})

// ============================================
// Touch Event Handlers (Mobile Support)
// ============================================

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  startDrawing(x, y)
})

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault()
  if (isDrawing) {
    const touch = e.touches[0]
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    draw(x, y)
  }
})

canvas.addEventListener("touchend", (e) => {
  e.preventDefault()
  endDrawing()
})

// ============================================
// Drawing Functions
// ============================================

/**
 * Start a new stroke
 * Records the initial coordinates
 */
function startDrawing(x, y) {
  isDrawing = true
  currentStroke = [x, y] // Start with [x, y]
  ctx.beginPath()
  ctx.moveTo(x, y)

  // Clear error messages when user starts drawing
  clearError()
}

/**
 * Draw on canvas and record coordinates
 * Captures continuous coordinates as the user draws
 */
function draw(x, y) {
  // Draw line on canvas
  ctx.lineTo(x, y)
  ctx.stroke()

  // Add coordinates to current stroke
  // Store as flat array: [x0, y0, x1, y1, ...]
  currentStroke.push(x, y)
}

/**
 * End the current stroke
 * Saves the stroke to the strokes array
 */
function endDrawing() {
  if (!isDrawing) return

  isDrawing = false
  ctx.closePath()

  // Only save stroke if it has more than just starting point
  if (currentStroke.length > 2) {
    strokes.push(currentStroke)
    console.log("[Khmer OCR] Stroke recorded:", currentStroke.length / 2, "points")
  }

  currentStroke = []
}

/**
 * Clear the canvas and reset all strokes
 */
function clearCanvas() {
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  strokes = []
  currentStroke = []
  resultsContainer.innerHTML = '<p class="placeholder">No prediction yet. Draw a digit and click Predict!</p>'
  clearError()
  console.log("[Khmer OCR] Canvas cleared")
}

// ============================================
// API Communication
// ============================================

/**
 * Send strokes to backend for prediction
 * Makes POST request to /predict/strokes endpoint
 */
async function predictDigit() {
  if (strokes.length === 0) {
    showError("Please draw a digit first!")
    return
  }

  // Show loading state
  resultsContainer.innerHTML = '<p class="placeholder">Predicting...</p>'
  clearError()

  try {
    console.log("[Khmer OCR] Sending", strokes.length, "stroke(s) to backend")

    const response = await fetch(`${BACKEND_URL}/predict/strokes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        strokes: strokes,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("[Khmer OCR] Prediction response:", data)

    displayResults(data)
  } catch (error) {
    console.error("[Khmer OCR] Error during prediction:", error)
    showError(`Failed to connect to backend: ${error.message}`)
    resultsContainer.innerHTML = '<p class="placeholder">Prediction failed. Check the backend connection.</p>'
  }
}

/**
 * Display prediction results
 * Shows predicted character and confidence scores
 */
function displayResults(data) {
  resultsContainer.innerHTML = ""

  // Main prediction result
  if (data.predicted_character) {
    const resultDiv = document.createElement("div")
    resultDiv.className = "result-item highlight"
    resultDiv.innerHTML = `
            <div class="result-header">
                <span class="result-label">Predicted Digit:</span>
                <span class="result-value">${data.predicted_character}</span>
            </div>
            ${
              data.confidence !== undefined
                ? `<div class="confidence">Confidence: ${(data.confidence * 100).toFixed(1)}%</div>`
                : ""
            }
        `
    resultsContainer.appendChild(resultDiv)
  }

  // All predictions with scores
  if (data.scores && Array.isArray(data.scores)) {
    const scoresDiv = document.createElement("div")
    scoresDiv.className = "scores-list"

    // Get top 5 predictions
    const topScores = data.scores
      .map((score, index) => ({ digit: String(index), confidence: score }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)

    scoresDiv.innerHTML = "<h3>All Predictions (Top 5)</h3>"
    topScores.forEach((pred) => {
      const scoreItem = document.createElement("div")
      scoreItem.className = "score-item"
      const percentage = (pred.confidence * 100).toFixed(1)
      scoreItem.innerHTML = `
                <span class="score-digit">${pred.digit}</span>
                <div class="score-bar-container">
                    <div class="score-bar" style="width: ${percentage}%"></div>
                </div>
                <span class="score-percent">${percentage}%</span>
            `
      scoresDiv.appendChild(scoreItem)
    })

    resultsContainer.appendChild(scoresDiv)
  }

  // Debug info
  if (data.num_strokes) {
    const debugDiv = document.createElement("div")
    debugDiv.className = "debug-info"
    debugDiv.innerHTML = `
            <p><small>Strokes received: ${data.num_strokes}</small></p>
        `
    resultsContainer.appendChild(debugDiv)
  }
}

/**
 * Show error message
 */
function showError(message) {
  errorContainer.innerHTML = `<div class="error-message">${message}</div>`
}

/**
 * Clear error messages
 */
function clearError() {
  errorContainer.innerHTML = ""
}

// ============================================
// Event Listeners
// ============================================

clearBtn.addEventListener("click", clearCanvas)
predictBtn.addEventListener("click", predictDigit)

// Debug logs
console.log("[Khmer OCR] Frontend initialized")
console.log("[Khmer OCR] Backend URL:", BACKEND_URL)
