# File Map

Fast lookup reference. Paths relative to `frontend/`.

## Marketing pages

| Path | Purpose |
|---|---|
| `app/page.tsx` | Home page |
| `app/templates/page.tsx` | Templates gallery page |
| `app/pricing/page.tsx` | Pricing page |
| `app/about/page.tsx` | About page |
| `app/contact/page.tsx` | Contact page |
| `app/partners/page.tsx` | Partner program page |
| `app/privacy/page.tsx` | Privacy policy page |
| `app/terms/page.tsx` | Terms of service page |
| `app/reviews/page.tsx` | Reviews page |

## Shared marketing components

| Path | Purpose |
|---|---|
| `components/marketing/SiteHeader.tsx` | Marketing site nav header |
| `components/marketing/SiteFooter.tsx` | Marketing site footer |
| `components/marketing/TemplateCarousel.tsx` | CV template preview carousel used on marketing pages |
| `components/marketing/TikTokIcon.tsx` | TikTok social icon (footer) |
| `components/marketing/WhatsAppIcon.tsx` | WhatsApp social icon (footer) |

## Auth pages

| Path | Purpose |
|---|---|
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/signup/page.tsx` | Registration/signup page |

## Layout / responsive / styling

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Root HTML layout, fonts, `dark` class, global providers |
| `app/globals.css` | Global CSS, CSS variables, Tailwind base layers |
| `tailwind.config.ts` | Tailwind config — color tokens, dark mode strategy, plugins (no custom breakpoints; uses Tailwind defaults) |
