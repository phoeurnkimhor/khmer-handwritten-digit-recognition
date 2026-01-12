"use client"

import { useState } from "react"
import { CanvasDrawing } from "@/components/canvas-drawing"
import { PredictionDisplay } from "@/components/prediction-display"
import { Button } from "@/components/ui/button"

interface PredictionResult {
  predicted_digit: string
  confidence: number
  predictions: Array<{ digit: string; confidence: number }>
}

export default function Home() {
  const [strokes, setStrokes] = useState<number[][][]>([])
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = () => {
    if (strokes.length === 0) {
      setError("Please draw at least one stroke")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    // Simulate prediction for now
    setTimeout(() => {
      setResult({
        predicted_digit: "៣",
        confidence: 0.92,
        predictions: [
          { digit: "៣", confidence: 0.92 },
          { digit: "៥", confidence: 0.05 },
          { digit: "៨", confidence: 0.02 },
          { digit: "៦", confidence: 0.01 },
        ],
      })
      setLoading(false)
    }, 500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Khmer Digit Recognition</h1>
          <p className="text-muted-foreground">Draw a Khmer handwritten digit to see predictions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Canvas */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Draw a Digit</h2>
            <CanvasDrawing strokes={strokes} onStrokesChange={setStrokes} />

            <Button
              onClick={handlePredict}
              disabled={loading || strokes.length === 0}
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              {loading ? "Predicting..." : "Predict"}
            </Button>
          </div>

          {/* Right side - Results */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Prediction Results</h2>
            <PredictionDisplay result={result} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </main>
  )
}
