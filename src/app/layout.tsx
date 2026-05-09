import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL("https://resource-hub-diu.vercel.app"),
  title: "Varsity Resource Hub | Community Driven Academic Archive",
  description: "A centralized platform for university students to share, find, and organize past exam questions, assignments, and study materials.",
  openGraph: {
    title: "Varsity Resource Hub | Academic Archive",
    description: "Access a community-driven database of past exam questions, notes, and study materials to ace your university courses.",
    url: "https://resource-hub-diu.vercel.app",
    siteName: "Varsity Resource Hub",
    images: [
      {
        url: "https://resource-hub-diu.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Varsity Resource Hub Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsity Resource Hub | Academic Archive",
    description: "Share Exam Questions & Help Others Succeed. Join the community database of academic resources.",
    images: ["https://resource-hub-diu.vercel.app/og-image.jpg"], 
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* <Toaster position="top-center" /> */}
        {children}
      </body>
    </html>
  );
}
