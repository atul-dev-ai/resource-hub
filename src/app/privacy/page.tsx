import { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Varsity Resource Hub",
  description: "Learn how Varsity Resource Hub collects, uses, and protects your personal information and academic data.",
  openGraph: {
    title: "Privacy Policy | Varsity Resource Hub",
    description: "Read our privacy policy to understand how we protect your data.",
    url: "https://resource-hub-diu.vercel.app/privacy",
  }
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}