"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, FileCheck, AlertCircle, ArrowLeft, UserX, Gavel, ShieldAlert } from "lucide-react";

export default function TermsContent() {
  const lastUpdated = "May 10, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: <FileCheck className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600 mb-3">
          By accessing and registering on <strong>Varsity Resource Hub</strong>, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access or use our platform.
        </p>
      )
    },
    {
      title: "2. User Accounts & Responsibilities",
      icon: <UserX className="w-6 h-6 text-green-600" />,
      content: (
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li>You are responsible for safeguarding your account credentials.</li>
          <li>You must provide accurate and up-to-date academic information (e.g., Department, Batch) during registration.</li>
          <li>You are strictly prohibited from sharing your account or transferring it to another person.</li>
        </ul>
      )
    },
    {
      title: "3. User-Generated Content & Copyright",
      icon: <Scale className="w-6 h-6 text-green-600" />,
      content: (
        <>
          <p className="text-slate-600 mb-3">
            Our platform allows students to upload past exam questions, assignments, and study notes. By uploading content:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>You confirm that you have the right to share the material and it does not violate any university copyright policies.</li>
            <li>You grant Varsity Resource Hub a non-exclusive license to display and distribute the uploaded resources to other registered students.</li>
            <li>We do not claim ownership of your original notes, but we reserve the right to remove any content deemed inappropriate or copyrighted without prior notice.</li>
          </ul>
        </>
      )
    },
    {
      title: "4. Prohibited Conduct",
      icon: <ShieldAlert className="w-6 h-6 text-green-600" />,
      content: (
        <>
          <p className="text-slate-600 mb-3">To maintain a healthy academic environment, you agree <strong>NOT</strong> to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Upload malware, viruses, or any malicious code.</li>
            <li>Post spam, promotional content, or irrelevant materials.</li>
            <li>Engage in harassment, hate speech, or abuse towards other students or moderators.</li>
            <li>Attempt to bypass the platform's Row Level Security (RLS) or hack the administrative portals.</li>
          </ul>
        </>
      )
    },
    {
      title: "5. Moderation & Account Termination",
      icon: <Gavel className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600">
          Our Administration and Moderator teams hold the right to review all uploaded content. We may suspend or permanently terminate your account without prior notice if you violate these terms, upload explicit content, or attempt to harm the platform's integrity.
        </p>
      )
    },
    {
      title: "6. Limitation of Liability",
      icon: <AlertCircle className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600">
          Varsity Resource Hub is a community-driven initiative. We do not guarantee the 100% accuracy of the study materials uploaded by users. You use the provided resources at your own risk. The developers and administrators will not be held liable for any academic loss or damages arising from the use of this platform.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900 rounded-3xl p-8 sm:p-12 text-center shadow-xl mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/banner-2.jpg')] opacity-10 mix-blend-overlay object-cover"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-green-800/50 rounded-2xl mb-6 backdrop-blur-sm border border-green-700">
              <Scale className="w-10 h-10 text-green-300" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Terms & Conditions</h1>
            <p className="text-green-200 text-lg max-w-2xl mx-auto">
              Please read these terms carefully before using Varsity Resource Hub to ensure a safe and collaborative academic environment.
            </p>
            <div className="mt-6 inline-block bg-green-800/60 px-4 py-2 rounded-full text-green-100 text-sm font-medium border border-green-700/50">
              Last Updated: {lastUpdated}
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 space-y-10"
        >
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-green-50 rounded-xl border border-green-100">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <div className="text-slate-600 leading-relaxed pl-2 sm:pl-14">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Prompt */}
          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 mt-8 text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Have questions about our terms?</h3>
            <p className="text-slate-600 mb-4">
              If any part of these terms is unclear, feel free to reach out to us before using the platform.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
              Contact Us
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}