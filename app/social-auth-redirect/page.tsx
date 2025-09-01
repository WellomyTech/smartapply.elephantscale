<<<<<<< HEAD
 'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SocialAuthRedirectPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_BASE
=======
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SocialAuthRedirectPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_BASE // <--- fix here!
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const userParam = params.get('user')
      if (userParam) {
        try {
          const userJson = Buffer.from(decodeURIComponent(userParam), "base64").toString()
          const user = JSON.parse(userJson)
          localStorage.setItem('socialUser', JSON.stringify(user))
          localStorage.setItem('user_email', user.email)

<<<<<<< HEAD
=======
          // Send user to your backend API
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
          fetch(`${API_URL}auth/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          })

          router.replace('/dashboard')
        } catch {
          router.replace('/?error=invalid_user_data')
        }
      } else {
        router.replace('/?error=no_user')
      }
    }
<<<<<<< HEAD
  }, [router, API_URL])

  return (
    <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Signing you in…</span>
      </div>
    </div>
  )
=======
  }, [router, API_URL]) // Make sure to include API_URL here!

  return <div className="text-center mt-10">Signing you in...</div>
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
}
