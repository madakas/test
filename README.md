# Next.js + Supabase Auth SSR

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and configured with Supabase Auth SSR.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Supabase Auth with SSR
- ✅ Protected routes with middleware
- ✅ Login/Signup page
- ✅ Server-side authentication checks

## Getting Started

### 1. Set up your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the project settings

### 2. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Login/signup page
│   ├── page.tsx              # Home page with auth status
│   └── layout.tsx            # Root layout
├── components/
│   └── LogoutButton.tsx      # Logout component
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser client
│       └── server.ts         # Server client
└── middleware.ts             # Auth middleware
```

## Authentication Flow

1. **Middleware Protection**: The middleware checks for authenticated users on all routes except `/login` and `/auth`
2. **Server-Side Auth**: The home page uses server-side authentication to display user status
3. **Client-Side Auth**: Login page and logout button use client-side authentication
4. **Session Management**: Supabase handles session refresh automatically through the middleware

## Key Implementation Details

- Uses `@supabase/ssr` package (not the deprecated `auth-helpers-nextjs`)
- Implements correct cookie handling with `getAll()` and `setAll()` methods
- Server and browser clients are properly separated
- Middleware refreshes auth tokens automatically

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
