import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SocialAuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE


  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const userJson = atob(decodeURIComponent(userParam));
        const user = JSON.parse(userJson);

        // Save to localStorage
        localStorage.setItem("socialUser", JSON.stringify(user));
        localStorage.setItem("user_email", JSON.stringify(user.email));


        // **Send user to your backend API**
        fetch(`${API_KEY}auth/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        // Now redirect to your dashboard or desired page
        router.replace("/dashboard");
      } catch (e) {
        router.replace("/?error=invalid_user_data");
      }
    } else {
      router.replace("/?error=no_user");
    }
  }, [router, searchParams]);

  return <div className="text-center mt-10">Signing you in...</div>;
}
