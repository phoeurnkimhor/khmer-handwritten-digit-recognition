"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PredictionResult {
  predicted_digit: string
  confidence: number
  predictions: Array<{ digit: string; confidence: number }>
}

interface PredictionDisplayProps {
  result: PredictionResult | null
  loading: boolean
  error: string | null
}

export function PredictionDisplay({ result, loading, error }: PredictionDisplayProps) {
  if (!result && !loading && !error) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Draw a Khmer digit and click Predict to see results</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Sending to backend...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-center text-destructive text-sm">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-center text-3xl">{result.predicted_digit}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Confidence</p>
            <p className="text-2xl font-bold text-primary">{(result.confidence * 100).toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Placeholder text */}
            <p className="text-center text-muted-foreground text-sm py-4">
              Draw a digit and predictions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
