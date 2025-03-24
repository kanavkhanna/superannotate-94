export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-md w-full">
        <BMICalculator />
      </div>
    </main>
  )
}

import BMICalculator from "@/components/bmi-calculator"

