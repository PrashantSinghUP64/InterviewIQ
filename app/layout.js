import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner";
import AIChatWidget from "./_components/AIChatWidget";
import { ThemeProvider } from "./_components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "InterviewIQ",
  description: "InterviewIQ is a tool to help you prepare for your next interview.",
};

export default function RootLayout({ children }) {
  return (
     <ClerkProvider signInForceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
        <html lang="en" suppressHydrationWarning>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet" />
          </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster/>
          {children}
          <AIChatWidget />
        </ThemeProvider>
      </body>
    </html>
     </ClerkProvider>

  );
}
