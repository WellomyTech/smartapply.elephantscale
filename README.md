````markdown
```
smartapply.elephantscale
├─ app
│  ├─ api
│  │  ├─ behavioral
│  │  │  ├─ sessions
│  │  │  │  └─ route.ts
│  │  │  └─ subskills
│  │  │     └─ route.ts
│  │  ├─ latex
│  │  │  └─ latex_to_pdf.ts
│  │  ├─ linkedin-auth
│  │  │  └─ route.ts
│  │  ├─ me
│  │  │  └─ resume-status
│  │  │     └─ route.ts
│  │  ├─ social-auth
│  │  │  └─ callback
│  │  │     └─ route.ts
│  │  ├─ stripe
│  │  │  ├─ cancel-subscription
│  │  │  │  └─ route.ts
│  │  │  ├─ checkout
│  │  │  │  └─ route.ts
│  │  │  ├─ portal
│  │  │  │  └─ route.ts
│  │  │  └─ webhook
│  │  │     └─ route.ts
│  │  └─ user-dashboard
│  │     └─ checkout
│  │        └─ route.ts
│  ├─ apple-icon.png
│  ├─ application-options
│  │  └─ page.tsx
│  ├─ dashboard
│  │  ├─ behavioral
│  │  │  ├─ page.tsx
│  │  │  ├─ progress
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [topic]
│  │  │  │     └─ page.tsx
│  │  │  └─ session
│  │  │     └─ page.tsx
│  │  ├─ interview
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ resume
│  │     └─ page.tsx
│  ├─ globals.css
│  ├─ icon.png
│  ├─ icon1.png
│  ├─ interview
│  │  ├─ page.tsx
│  │  └─ page_backup.tsx
│  ├─ job-info
│  │  └─ [email]
│  │     └─ [report_id]
│  │        └─ page.tsx
│  ├─ job-kit
│  │  ├─ page.tsx
│  │  ├─ page_backup.tsx
│  │  └─ result
│  │     └─ page.tsx
│  ├─ job-suggestions
│  │  └─ page.tsx
│  ├─ layout.tsx
│  ├─ linkedin
│  │  └─ callback
│  │     └─ page.tsx
│  ├─ manifest.webmanifest
│  ├─ page.tsx
│  ├─ pricing
│  │  └─ page.tsx
│  ├─ profile
│  │  └─ page.tsx
│  ├─ QA
│  │  └─ page.tsx
│  ├─ social-auth-redirect
│  │  └─ page.tsx
│  ├─ testvapi
│  │  └─ page.tsx
│  └─ upload
│     └─ page.tsx
├─ components
│  ├─ AuthProvider.tsx
│  ├─ behavioral
│  │  ├─ SubskillRadar.tsx
│  │  └─ SubskillSeriesGrid.tsx
│  ├─ ClientVapiProvider.tsx
│  ├─ DashboardButton.tsx
│  ├─ GoogleButton.tsx
│  ├─ InterviewScanList.tsx
│  ├─ JobScanCard.tsx
│  ├─ JobScanList.tsx
│  ├─ LinkedInButton.tsx
│  ├─ PricingButtons.tsx
│  ├─ ResumeForm.tsx
│  ├─ ResumeProvider.tsx
│  ├─ RouteGuard.tsx
│  ├─ SafeImage.tsx
│  ├─ site-footer.tsx
│  ├─ site-header.tsx
│  ├─ SiteLogo.tsx
│  ├─ SocialAuthRedirectPage.jsx
│  ├─ SocialLoginButtons.tsx
│  ├─ theme-provider.tsx
│  ├─ ui
│  │  ├─ accordion.tsx
│  │  ├─ alert-dialog.tsx
│  │  ├─ alert.tsx
│  │  ├─ aspect-ratio.tsx
│  │  ├─ avatar.tsx
│  │  ├─ badge.tsx
│  │  ├─ breadcrumb.tsx
│  │  ├─ button.tsx
│  │  ├─ calendar.tsx
│  │  ├─ card.tsx
│  │  ├─ carousel.tsx
│  │  ├─ chart.tsx
│  │  ├─ checkbox.tsx
│  │  ├─ collapsible.tsx
│  │  ├─ command.tsx
│  │  ├─ context-menu.tsx
│  │  ├─ dialog.tsx
│  │  ├─ drawer.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ form.tsx
│  │  ├─ hover-card.tsx
│  │  ├─ input-otp.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ menubar.tsx
│  │  ├─ navigation-menu.tsx
│  │  ├─ pagination.tsx
│  │  ├─ popover.tsx
│  │  ├─ progress.tsx
│  │  ├─ radio-group.tsx
│  │  ├─ resizable.tsx
│  │  ├─ scroll-area.tsx
│  │  ├─ select.tsx
│  │  ├─ separator.tsx
│  │  ├─ sheet.tsx
│  │  ├─ sidebar.tsx
│  │  ├─ skeleton.tsx
│  │  ├─ slider.tsx
│  │  ├─ sonner.tsx
│  │  ├─ status-bar.tsx
│  │  ├─ switch.tsx
│  │  ├─ table.tsx
│  │  ├─ tabs.tsx
│  │  ├─ textarea.tsx
│  │  ├─ toast.tsx
│  │  ├─ toaster.tsx
│  │  ├─ toggle-group.tsx
│  │  ├─ toggle.tsx
│  │  ├─ tooltip.tsx
│  │  ├─ use-mobile.tsx
│  │  └─ use-toast.ts
│  └─ VapiButton.tsx
├─ components.json
├─ data
│  └─ jobKit.json
├─ hooks
│  ├─ use-mobile.tsx
│  ├─ use-toast.ts
│  └─ useEntitlement.ts
├─ lib
│  ├─ auth
│  │  └─ redirectAfterLogin.ts
│  ├─ dates.ts
│  ├─ endpoints.ts
│  ├─ hooks
│  │  ├─ useBehavioralSubskills.ts
│  │  └─ useBehavioralSummary.ts
│  ├─ site-nav.ts
│  ├─ stripe.ts
│  └─ utils.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ apple-icon.png
│  ├─ brand
│  │  ├─ avatar-placeholder.svg
│  │  ├─ favicon.svg
│  │  ├─ logo-es-dark.svg
│  │  └─ logo-es-light.svg
│  ├─ elephantscale-logo-face.png
│  ├─ elephantscale-logo-white.png
│  ├─ elephantscale-logo.png
│  ├─ placeholder-logo.png
│  ├─ placeholder-logo.svg
│  ├─ placeholder-user.jpg
│  ├─ placeholder.jpg
│  └─ placeholder.svg
├─ README.md
├─ server
│  └─ js
├─ server.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ types
   └─ vapi-sdk.d.ts

```

## Stripe credits flow (authoritative)

Env (.env.local):

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_BASE_URL
- NEXT_PUBLIC_PRICE_STARTER
- NEXT_PUBLIC_PRICE_MONTHLY
- NEXT_PUBLIC_PRICE_QUARTERLY
- NEXT_PUBLIC_PRICE_PACK_2
- NEXT_PUBLIC_PRICE_PACK_4
- NEXT_PUBLIC_PRICE_PACK_6

Server routes:
- POST /api/stripe/checkout → creates Checkout Session; mode inferred server-side from price.
- POST /api/stripe/webhook → deposits credits on checkout.session.completed and invoice.payment_succeeded.

Local testing with Stripe CLI:

- stripe listen --forward-to localhost:3000/api/stripe/webhook
- Test 1 (Starter): trigger a checkout for STARTER price → expect one checkout.session.completed and a single credit deposit.
- Test 2 (Monthly): complete first invoice → expect invoice.payment_succeeded → credit deposit with rollover cap.
- Replay any event → deposit is idempotent (no double credit).
````