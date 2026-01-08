'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function AnimatedArrow() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="hidden md:flex items-center justify-center h-full">
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
        <ArrowRight 
          className="w-8 h-8 text-slate-400 dark:text-slate-600 animate-pulse" 
          strokeWidth={2.5}
        />
      </div>
      <style jsx>{`
        @keyframes slideRight {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(8px);
          }
        }
        .animate-pulse {
          animation: slideRight 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
