// 'use client'

// import { useEffect } from 'react'
// import { useRouter } from 'next/navigation'

// export default function SocialAuthRedirectPage() {
//   const router = useRouter()

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const params = new URLSearchParams(window.location.search)
//       const userParam = params.get('user')
//       if (userParam) {
//         try {
//           const userJson = Buffer.from(decodeURIComponent(userParam), "base64").toString()
//           const user = JSON.parse(userJson)
//           localStorage.setItem('socialUser', JSON.stringify(user))
//           localStorage.setItem('user_email', user.email)


//         // **Send user to your backend API**
//         fetch(`${API_KEY}auth/user`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(user),
//         });

//      router.replace('/dashboard')
//         } catch {
//           router.replace('/?error=invalid_user_data')
//         }
//       } else {
//         router.replace('/?error=no_user')
//       }
//     }
//   }, [router])

//   return <div>Signing you in...</div>
// }