This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Connecting the Frontend to the Backend

This frontend expects a Laravel backend exposing a JSON API. Configure the API base URL with an env var in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Notes:
- The project includes `frontend/components/api.ts` which reads `NEXT_PUBLIC_API_BASE_URL` and will attach an Authorization header when a `passport_token` exists in `localStorage`.
- Recommended auth flow: `POST /auth/login` → receive `{ access_token, user }`, store token in memory and `localStorage` (or use httpOnly cookies + refresh token). Implement token refresh on 401 responses.
- Ensure CORS and cookie settings are configured on the Laravel backend for local development.

Design & Interaction recommendations:
- Use `shadcn/ui` + Tailwind for a modern baseline. Add `framer-motion` for smooth transitions and micro-interactions.
- Use accessible primitives (Headless UI or Radix) for dialogs, dropdowns and lists.
- Lazy-load heavy components (charts, document preview) with dynamic imports and Suspense.

For a full frontend build guide that maps features to routes, components, API hooks and design tokens, see `frontend/FRONTEND_BUILD_GUIDE.md`.
