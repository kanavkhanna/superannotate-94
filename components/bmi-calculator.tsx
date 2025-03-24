"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calculator, Info, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function BMICalculator() {
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [bmi, setBmi] = useState<number | null>(null)
  const [category, setCategory] = useState("")
  const [errors, setErrors] = useState<{ height?: string; weight?: string; general?: string }>({})
  const [animateResult, setAnimateResult] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Reset animation state when BMI changes
  useEffect(() => {
    if (bmi !== null) {
      setAnimateResult(true)
      const timer = setTimeout(() => setAnimateResult(false), 500)
      return () => clearTimeout(timer)
    }
  }, [bmi])

  // Validate a single field
  const validateField = (field: "height" | "weight", value: string) => {
    const numValue = Number.parseFloat(value)

    if (!value.trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
    }

    if (isNaN(numValue) || numValue <= 0) {
      return `Please enter a valid ${field}`
    }

    if (field === "height") {
      if (numValue < 50) return "Height seems too low (min 50cm)"
      if (numValue > 250) return "Height seems too high (max 250cm)"
    }

    if (field === "weight") {
      if (numValue < 20) return "Weight seems too low (min 20kg)"
      if (numValue > 500) return "Weight seems too high (max 500kg)"
    }

    return undefined
  }

  // Handle input changes without showing errors
  const handleInputChange = (field: "height" | "weight", value: string) => {
    if (field === "height") {
      setHeight(value)
    } else {
      setWeight(value)
    }

    // If the form has been submitted before, update errors on change
    if (submitted) {
      const error = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: error }))
    }
  }

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark form as submitted
    setSubmitted(true)

    // Validate both fields
    const heightError = validateField("height", height)
    const weightError = validateField("weight", weight)

    // Update errors state
    setErrors({
      height: heightError,
      weight: weightError,
      general: undefined, // Clear any general errors
    })

    // If there are any errors, don't calculate BMI but keep previous results
    if (heightError || weightError) {
      return
    }

    try {
      const heightValue = Number.parseFloat(height)
      const weightValue = Number.parseFloat(weight)

      // Convert height from cm to meters
      const heightInMeters = heightValue / 100

      // Calculate BMI: weight (kg) / (height (m))²
      const bmiValue = weightValue / (heightInMeters * heightInMeters)

      // Check for invalid result
      if (!isFinite(bmiValue) || isNaN(bmiValue)) {
        throw new Error("Calculation resulted in an invalid value")
      }

      setBmi(Number.parseFloat(bmiValue.toFixed(1)))

      // Determine BMI category
      if (bmiValue < 18.5) {
        setCategory("Underweight")
      } else if (bmiValue < 25) {
        setCategory("Normal weight")
      } else if (bmiValue < 30) {
        setCategory("Overweight")
      } else {
        setCategory("Obese")
      }
    } catch (error) {
      // Keep previous results but show error
      setErrors((prev) => ({
        ...prev,
        general: "An error occurred during calculation. Please check your inputs.",
      }))
      console.error("BMI calculation error:", error)
    }
  }

  // Category color mapping using Tailwind CSS variable based colors
  const getCategoryStyles = () => {
    switch (category) {
      case "Underweight":
        return "bg-primary/10 text-primary border-primary/20"
      case "Normal weight":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "Overweight":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      case "Obese":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Calculate position on the BMI scale (0-100%)
  const getBmiScalePosition = () => {
    if (bmi === null) return 0

    // Clamp between 10 and 40 for the visual scale
    const clampedBmi = Math.max(10, Math.min(bmi, 40))
    // Convert to percentage (10 = 0%, 40 = 100%)
    return ((clampedBmi - 10) / 30) * 100
  }

  return (
    <Card className="w-full overflow-hidden border-muted/30 shadow-lg">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background pointer-events-none"
        aria-hidden="true"
      />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>BMI Calculator</span>
        </CardTitle>
        <CardDescription className="text-base">
          Calculate your Body Mass Index to check if your weight is healthy.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {errors.general && submitted && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={calculateBMI} noValidate className="grid gap-6 grid-cols-1">
          <div className="space-y-2">
            <Label
              htmlFor="height"
              className={`text-sm font-medium ${submitted && errors.height ? "text-destructive" : ""}`}
            >
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              inputMode="decimal"
              placeholder="Enter your height"
              value={height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              aria-describedby={submitted && errors.height ? "height-error" : undefined}
              aria-invalid={submitted && !!errors.height}
              className={`bg-background/50 backdrop-blur-sm ${submitted && errors.height ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {submitted && errors.height && (
              <p id="height-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.height}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="weight"
              className={`text-sm font-medium ${submitted && errors.weight ? "text-destructive" : ""}`}
            >
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              placeholder="Enter your weight"
              value={weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              aria-describedby={submitted && errors.weight ? "weight-error" : undefined}
              aria-invalid={submitted && !!errors.weight}
              className={`bg-background/50 backdrop-blur-sm ${submitted && errors.weight ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {submitted && errors.weight && (
              <p id="weight-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.weight}
              </p>
            )}
          </div>
          <div>
            <Button type="submit" className="w-full transition-all hover:shadow-md">
              Calculate BMI
            </Button>
          </div>
        </form>

        {bmi !== null && (
          <div
            className={`rounded-lg border p-4 transition-all duration-300 ${
              animateResult ? "scale-105" : "scale-100"
            } ${getCategoryStyles()}`}
            role="region"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Your BMI Result</h3>
                <p className="text-3xl font-bold">{bmi}</p>
                <p className="text-sm mt-1 font-medium">{category}</p>
              </div>

              <div>
                <div className="h-8 relative bg-muted/50 rounded-full overflow-hidden">
                  {/* BMI scale with distinct color sections */}
                  <div className="absolute inset-y-0 left-0 w-1/4 bg-primary/70" aria-hidden="true" />
                  <div className="absolute inset-y-0 left-1/4 w-1/4 bg-emerald-500/70" aria-hidden="true" />
                  <div className="absolute inset-y-0 left-2/4 w-1/4 bg-amber-500/70" aria-hidden="true" />
                  <div className="absolute inset-y-0 left-3/4 w-1/4 bg-destructive/70" aria-hidden="true" />

                  {/* BMI indicator */}
                  <div
                    className="absolute h-full w-2 bg-background shadow-md transform -translate-x-1/2 transition-all duration-500 z-10"
                    style={{ left: `${getBmiScalePosition()}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <span className="block font-medium text-primary">Under</span>
                    <span className="block">&lt;18.5</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-emerald-600 dark:text-emerald-400">Normal</span>
                    <span className="block">18.5-24.9</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-amber-600 dark:text-amber-400">Over</span>
                    <span className="block">25-29.9</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-medium text-destructive">Obese</span>
                    <span className="block">≥30</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-muted/30 p-4 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-medium">BMI Categories</h3>
          </div>
          <Separator className="mb-3" />
          <div className="grid grid-cols-1 gap-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/70" aria-hidden="true" />
              <span>Underweight: &lt; 18.5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" aria-hidden="true" />
              <span>Normal: 18.5 - 24.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500/70" aria-hidden="true" />
              <span>Overweight: 25 - 29.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/70" aria-hidden="true" />
              <span>Obese: ≥ 30</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

