"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface CanvasDrawingProps {
  onStrokesChange: (strokes: number[][][]) => void
  strokes: number[][][]
}

export function CanvasDrawing({ onStrokesChange, strokes }: CanvasDrawingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<number[]>([])
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  // Initialize canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeCanvas = () => {
      // Use ResizeObserver for more accurate container measurements
      const containerRect = container.getBoundingClientRect()
      const width = Math.min(containerRect.width - 4, 600) // Max 600px width
      const height = Math.min(width * 0.6, 360) // 60% of width for 5:3 aspect ratio
      
      // Set both the actual canvas size and display size
      canvas.width = width
      canvas.height = height
      
      // Ensure the canvas display size matches exactly
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.style.display = 'block'

      redrawCanvas()
    }

    const redrawCanvas = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Set drawing properties
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Redraw all existing strokes
      strokes.forEach((stroke) => {
        if (stroke.length < 2) return

        ctx.beginPath()
        ctx.moveTo(stroke[0], stroke[1])

        for (let i = 2; i < stroke.length; i += 2) {
          ctx.lineTo(stroke[i], stroke[i + 1])
        }
        ctx.stroke()
      })
    }

    // Initial setup
    setTimeout(resizeCanvas, 0) // Ensure DOM is ready

    // Use ResizeObserver for better resize detection
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    
    resizeObserver.observe(container)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [strokes])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ("touches" in e) {
      e.preventDefault() // Prevent scrolling on touch
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Get the actual canvas dimensions
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const displayWidth = rect.width
    const displayHeight = rect.height

    // Calculate the scale factors
    const scaleX = canvasWidth / displayWidth
    const scaleY = canvasHeight / displayHeight
    
    // Convert display coordinates to canvas coordinates
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    
    // Clamp coordinates to canvas bounds
    const clampedX = Math.max(0, Math.min(canvasWidth, x))
    const clampedY = Math.max(0, Math.min(canvasHeight, y))
    
    return { x: clampedX, y: clampedY }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return

    console.log(`Mouse down at: ${coords.x}, ${coords.y}`)
    setIsDrawing(true)
    setCurrentStroke([coords.x, coords.y])
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return

    // Update mouse position for display
    setMousePosition({ x: Math.round(coords.x), y: Math.round(coords.y) })

    if (!isDrawing) return

    console.log(`Drawing to: ${coords.x}, ${coords.y}`)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set drawing properties
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw line from last point to current point
    if (currentStroke.length >= 2) {
      const lastIndex = currentStroke.length - 2
      ctx.beginPath()
      ctx.moveTo(currentStroke[lastIndex], currentStroke[lastIndex + 1])
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
    }

    // Add coordinates to current stroke
    setCurrentStroke(prev => [...prev, coords.x, coords.y])
  }

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    
    if (isDrawing && currentStroke.length > 0) {
      console.log('Stroke completed as flat array:', currentStroke)

      // Add new stroke to strokes array (currentStroke is already flat)
      const newStrokes = [...strokes, [...currentStroke]]
      onStrokesChange(newStrokes)
      setCurrentStroke([])
    }
    setIsDrawing(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleMouseDown(e as any)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleMouseMove(e)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    handleMouseUp(e)
  }

  const handleClear = () => {
    console.log('Canvas cleared')
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    onStrokesChange([])
    setCurrentStroke([])
  }

  const printAllCoordinates = () => {
    console.log('All strokes as flat coordinate arrays:')
    strokes.forEach((stroke, strokeIndex) => {
      console.log(`Stroke ${strokeIndex + 1}: [${stroke.join(', ')}]`)
    })
    
    // Also print in the format you want
    console.log('\nFlat format for each stroke:')
    strokes.forEach((stroke, strokeIndex) => {
      const coordString = stroke.map((coord, i) => 
        i % 2 === 0 ? `${stroke[i]},${stroke[i + 1]}` : ''
      ).filter(Boolean).join(',')
      console.log(`Stroke ${strokeIndex + 1}: ${coordString}`)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="border-2 border-border rounded-lg overflow-hidden bg-white"
        style={{ width: '100%', maxWidth: '600px', aspectRatio: '5/3' }} // Changed from '1' to '5/3'
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="block cursor-crosshair w-full h-full"
          style={{ touchAction: 'none' }}
        />
      </div>

      {mousePosition && (
        <div className="text-sm text-muted-foreground">
          Mouse position: ({mousePosition.x}, {mousePosition.y})
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleClear} variant="outline" className="flex-1 bg-transparent">
          Clear Canvas
        </Button>
        <Button onClick={printAllCoordinates} variant="outline" className="flex-1 bg-transparent">
          Print Coordinates
        </Button>
        <div className="flex items-center text-sm text-muted-foreground">
          {strokes.length > 0 && `${strokes.length} stroke${strokes.length !== 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  )
}
