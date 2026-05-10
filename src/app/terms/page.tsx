import { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms and Conditions | Varsity Resource Hub",
  description: "Read the rules, guidelines, and terms of service for using the Varsity Resource Hub platform.",
  openGraph: {
    title: "Terms & Conditions | Varsity Resource Hub",
    description: "Understand our platform rules and guidelines for a safe academic environment.",
    url: "https://resource-hub-diu.vercel.app/terms",
  }
};

export default function TermsPage() {
  return <TermsContent />;
}