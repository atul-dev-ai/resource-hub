import { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | Varsity Resource Hub",
  description: "Get in touch with the Varsity Resource Hub administration team for support, feedback, or inquiries.",
  openGraph: {
    title: "Contact Us | Varsity Resource Hub",
    description: "Reach out to us for any queries or support.",
    url: "https://resource-hub-diu.vercel.app/contact",
  }
};

export default function ContactPage() {
  return <ContactContent />;
}