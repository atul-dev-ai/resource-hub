import { Metadata } from "next";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQ | Varsity Resource Hub",
  description: "Find answers to frequently asked questions about using the Varsity Resource Hub platform, uploading files, and account management.",
  openGraph: {
    title: "FAQ | Varsity Resource Hub",
    description: "Got questions? We have answers. Learn how to navigate and use our academic sharing platform.",
    url: "https://resource-hub-diu.vercel.app/faq",
  }
};

export default function FAQPage() {
  return <FAQContent />;
}