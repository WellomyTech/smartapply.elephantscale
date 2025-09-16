"use client"

import React, { useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2, Info, AlertTriangle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatusType = "success" | "error" | "loading" | "info" | "warning"

interface StatusBarProps {
  message: string
  type: StatusType
  visible: boolean
  onClose?: () => void
  autoHide?: boolean
  duration?: number
  showProgress?: boolean
  progressValue?: number
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-gradient-to-r from-red-500/10 to-rose-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-700 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400",
  },
  loading: {
    icon: Loader2,
    bgColor: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  info: {
    icon: Info,
    bgColor: "bg-gradient-to-r from-cyan-500/10 to-blue-500/10",
    borderColor: "border-cyan-500/20",
    textColor: "text-cyan-700 dark:text-cyan-300",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-gradient-to-r from-amber-500/10 to-yellow-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-700 dark:text-amber-300",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
}

export function StatusBar({
  message,
  type,
  visible,
  onClose,
  autoHide = true,
  duration = 5000,
  showProgress = false,
  progressValue = 0
}: StatusBarProps) {
  const [isVisible, setIsVisible] = useState(visible)
  const [animatedMessage, setAnimatedMessage] = useState(message)
  const [dots, setDots] = useState("")
  const config = statusConfig[type]
  const Icon = config.icon

  useEffect(() => { setIsVisible(visible) }, [visible])
  useEffect(() => { setAnimatedMessage(message) }, [message])

  // Animated dots for loading states
  useEffect(() => {
    if (type === "loading" && visible) {
      const interval = setInterval(() => {
        setDots(prev => (prev === "..." ? "" : prev + "."))
      }, 500)
      return () => clearInterval(interval)
    } else {
      setDots("")
    }
  }, [type, visible])

  useEffect(() => {
    if (visible && autoHide && type !== "loading") {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, autoHide, type, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div
        className={cn(
          "relative flex flex-col gap-2 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 ease-out",
          config.bgColor,
          config.borderColor,
          "animate-in slide-in-from-top-2 fade-in-0",
          // REMOVED animate-pulse on loading to prevent blinking
          // type === "loading" && "animate-pulse"
        )}
      >
        {/* Main content */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon
              className={cn(
                "h-5 w-5 flex-shrink-0",
                config.iconColor,
                // Keep only the spinner animation
                type === "loading" && "animate-spin"
              )}
            />
          </div>
          <p
            className={cn("text-sm font-medium flex-1", config.textColor)}
            aria-live="polite"
          >
            {animatedMessage}
            {type === "loading" && dots}
          </p>
          {onClose && type !== "loading" && (
            <button
              onClick={() => { setIsVisible(false); onClose() }}
              className={cn("ml-2 hover:opacity-70 transition-opacity text-lg leading-none", config.textColor)}
              aria-label="Close status"
            >
              ×
            </button>
          )}
        </div>

        {/* Progress bar */}
        {(type === "loading" || showProgress) && (
          <div className="w-full bg-white/20 dark:bg-black/20 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                // Make the bar steady; no pulse
                type === "loading"
                  ? "bg-blue-600/60" // steady indeterminate-looking bar
                  : "bg-gradient-to-r from-emerald-400 to-emerald-600"
              )}
              style={{
                width: type === "loading"
                  ? "100%"
                  : `${Math.min(100, Math.max(0, progressValue))}%`
              }}
            />
          </div>
        )}

        {/* OPTIONAL animated background — comment out to remove any residual flicker */}
        {/* {type === "loading" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-blue-500/5 animate-gradient-x"></div>
        )} */}
      </div>
    </div>
  )
}


// Hook for managing status bar state
export function useStatusBar() {
  const [status, setStatus] = useState<{
    message: string
    type: StatusType
    visible: boolean
  }>({
    message: "",
    type: "info",
    visible: false,
  })

  const showStatus = (message: string, type: StatusType) => {
    setStatus({ message, type, visible: true })
  }

  const hideStatus = () => {
    setStatus(prev => ({ ...prev, visible: false }))
  }

  return {
    status,
    showStatus,
    hideStatus,
  }
}
