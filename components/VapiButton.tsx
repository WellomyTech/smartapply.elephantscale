'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

declare global {
  interface Window {
    vapiSDK?: any
  }
}

interface VapiButtonProps {
  reportId: number | string | null
}

export default function VapiButton({ reportId }: VapiButtonProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const scriptId = 'vapi-widget-script'
    const onLoaded = () => {
      const int = setInterval(() => {
        if (window.vapiSDK) {
          clearInterval(int)
          setReady(true)
        }
      }, 100)
    }

    if (document.getElementById(scriptId)) {
      onLoaded()
      return
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js'
    script.async = true
    script.onload = onLoaded
    document.body.appendChild(script)
  }, [])

  const handleClick = () => {
    if (!window.vapiSDK || !reportId) return
    window.vapiSDK.run({
      assistant: '9295e1aa-6e41-4334-9dc4-030954c7274a',
      apiKey: '4b3fb521-9ad5-439a-8224-cdb78e2e78e8',
      assistantOverrides: {
        variableValues: { report_id: reportId },
      },
    })
  }

  return (
    <Button onClick={handleClick} disabled={!ready || !reportId} className="inline-flex items-center gap-2">
      <Phone className="h-4 w-4" />
      {ready ? 'Start Interview' : 'Loading…'}
    </Button>
  )
}
