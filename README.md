This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Ai_Interview_Mocker

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables Setup

Create a `.env.local` file in the root of your project and add the following keys. Refer to `.env.example` for the format.

**Har key kahan se milegi (Where to get each key):**

**1. Gemini API Key** — Free
- aistudio.google.com pe jaao
- "Get API Key" click karo
- "Create API Key" 
- Copy karo and assign it to `NEXT_PUBLIC_GEMINI_API_KEY`

**2. Clerk Keys** — Free
- clerk.com pe jaao
- New Application banao
- "InterviewIQ" naam do
- Google login enable karo
- Dashboard → API Keys
- Publishable Key + Secret Key copy karo

**3. Neon DB URL** — Free
- neon.tech pe jaao
- New Project → "interviewiq-db"
- Dashboard → Connection String
- Copy karo (postgresql://... wala) and assign it to `NEXT_PUBLIC_DRIZZLE_DB_URL`
