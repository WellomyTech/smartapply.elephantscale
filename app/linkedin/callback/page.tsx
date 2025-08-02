// 'use client'
// export const dynamic = 'force-dynamic'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'

// export default function LinkedInCallback() {
//   const API_KEY  = process.env.NEXT_PUBLIC_API_BASE

//   const router = useRouter()
//   const { setUser } = useAuth()

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search)
//     const code = params.get('code')

//     if (!code) {
//       router.replace('/?error=login')
//       return
//     }

//     fetch('/api/linkedin-auth', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ code }),
//     })
//       .then(async (res) => res.json())
//       .then(async (data) => {
//           console.log("LinkedIn data:", data) // <-- add this

//         if (data.ok) {
//           setUser(data.user)
//           console.log("Posting to FastAPI:", data.user) // <-- and this

//           // --- Send to FastAPI backend ---
//           try {
//             await fetch(`${API_KEY}auth/user`, {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 email: data.user.email,
//                 name: data.user.name,
//               }),
//             })
//           } catch (e) {
//             console.error('Failed to save user in backend:', e)
//           }
//           // -------------------------------
//           router.replace('/dashboard')
//         } else {
//           router.replace('/?error=login')
//         }
//       })
//       .catch(() => {
//         router.replace('/?error=login')
//       })
//   }, [router, setUser])

//   return <p className="p-8 text-center">Finishing sign-in…</p>
// }











// // app/linkedin/callback/page.tsx
// 'use client'
// export const dynamic = 'force-dynamic'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'

// export default function LinkedInCallback() {
//   const router = useRouter()
//   const { setUser } = useAuth()

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search)
//     const code = params.get('code')

//     if (!code) {
//       router.replace('/?error=login')
//       return
//     }

//     fetch('/api/linkedin-auth', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ code }),
//     })
//       .then((res) => res.json())
// .then(async (data) => {
//   if (data.ok) {
//     setUser(data.user)
//     // Send user data to FastAPI backend
//     try {
//       await fetch('http://127.0.0.1:8000/auth/user', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: data.user.email,
//           name: data.user.name,
//         }),
//       })
//     } catch (e) {
//       // You can handle backend errors here if you want (optional)
//       console.error('Failed to save user in backend:', e)
//     }
//     router.replace('/dashboard')
//   } else {
//     router.replace('/?error=login')
//   }
// })

//       .catch(() => {
//         router.replace('/?error=login')
//       })
//   }, [router, setUser])

//   return <p className="p-8 text-center">Finishing sign-in…</p>
// }
