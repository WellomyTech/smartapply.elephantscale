'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiStepProps {
  stepNumber: number
  title: string
  description: string
}

export default function ConfettiStep({ stepNumber, title, description }: ConfettiStepProps) {
  const [hasTriggered, setHasTriggered] = useState(false)
  const stepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggered) {
            setHasTriggered(true)
            
            // Trigger confetti after a short delay
            setTimeout(() => {
              if (!stepRef.current) return
              
              const rect = stepRef.current.getBoundingClientRect()
              const x = (rect.left + rect.width / 2) / window.innerWidth
              const y = (rect.top + rect.height / 2) / window.innerHeight

              // Smaller, more subtle confetti effect
              const defaults = {
                origin: { x, y },
                spread: 60,
                ticks: 80,
                gravity: 1.2,
                decay: 0.92,
                startVelocity: 20,
              }

              function shoot() {
                confetti({
                  ...defaults,
                  particleCount: 15,
                  scalar: 0.6,
                  shapes: ['star'],
                  colors: ['#3b82f6', '#06b6d4', '#6366f1']
                })

                confetti({
                  ...defaults,
                  particleCount: 10,
                  scalar: 0.4,
                  shapes: ['circle'],
                  colors: ['#3b82f6', '#06b6d4']
                })
              }

              shoot()
              setTimeout(shoot, 100)
            }, 300)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (stepRef.current) {
      observer.observe(stepRef.current)
    }

    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current)
      }
    }
  }, [hasTriggered])

  return (
    <div ref={stepRef} className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
        <span className="text-2xl font-bold text-white">
          {stepNumber}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        {description}
      </p>
    </div>
  )
}
