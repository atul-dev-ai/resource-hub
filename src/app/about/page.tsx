import { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Us | Varsity Resource Hub",
  description: "Learn more about Varsity Resource Hub, our mission, and the developer behind the ultimate academic sharing platform.",
  openGraph: {
    title: "About Us | Varsity Resource Hub",
    description: "Discover our mission to empower students through shared academic knowledge.",
    url: "https://resource-hub-diu.vercel.app/about",
  }
};

export default function AboutPage() {
  return <AboutContent />;
}