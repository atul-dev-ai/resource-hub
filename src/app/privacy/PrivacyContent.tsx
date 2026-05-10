"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, ArrowLeft, Database, UserCheck } from "lucide-react";


export default function PrivacyContent() {
  const lastUpdated = "May 10, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Database className="w-6 h-6 text-green-600" />,
      content: (
        <>
          <p className="mb-3">When you register and use Varsity Resource Hub, we collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Personal Information:</strong> Your name, email address, profile picture (if provided via Google Auth), and academic details (Department, Semester, Batch).</li>
            <li><strong>User Content:</strong> Files, study materials, notes, and previous year questions you upload to the platform.</li>
            <li><strong>Usage Data:</strong> We maintain activity logs (e.g., upload history, profile updates) to prevent abuse and ensure platform integrity.</li>
          </ul>
        </>
      )
    },
    {
      title: "2. How We Use Your Information",
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      content: (
        <>
          <p className="mb-3">The information we collect is strictly used to provide and improve our services:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>To verify your identity and manage your secure account.</li>
            <li>To display your uploaded resources to the student community.</li>
            <li>To moderate content and assign proper roles (Admin, Moderator, Student).</li>
            <li>To notify you about important platform updates or changes.</li>
          </ul>
        </>
      )
    },
    {
      title: "3. Data Security & Storage",
      icon: <Lock className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600">
          We take data security very seriously. All user data and uploaded files are securely stored using <strong>Supabase</strong> (PostgreSQL & Cloud Storage). We implement strict <strong>Row Level Security (RLS)</strong> policies to ensure that your personal data is only accessible to authorized systems and administrative personnel. Your passwords are cryptographically hashed and never stored in plain text.
        </p>
      )
    },
    {
      title: "4. Information Sharing & Disclosure",
      icon: <Eye className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600">
          <strong>We do not sell, rent, or trade your personal information.</strong> Your uploaded academic resources are made public to the platform's users to foster collaborative learning. However, personal contact details (like your email) remain hidden from general users. We may only disclose information if required by law or to protect the safety and rights of our community.
        </p>
      )
    },
    {
      title: "5. Your Rights & Control",
      icon: <Shield className="w-6 h-6 text-green-600" />,
      content: (
        <p className="text-slate-600">
          You have full control over your personal data. You can access, update, or correct your profile information at any time through the <strong>Profile Settings</strong> dashboard. If you wish to permanently delete your account or specific uploaded files, you can contact our administrative team via the platform's reporting system.
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
              <FileText className="w-10 h-10 text-green-300" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-green-200 text-lg max-w-2xl mx-auto">
              We are committed to protecting your personal information and your right to privacy while you empower your academic journey.
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
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed">
              Welcome to <strong>Varsity Resource Hub</strong>. This Privacy Policy outlines how we collect, use, protect, and handle your personal information when you use our website and services. By using our platform, you consent to the data practices described in this policy.
            </p>
          </div>

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

          <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-100 mt-8 text-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Questions or Concerns?</h3>
            <p className="text-slate-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please reach out to our administration team.
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
              Contact Administration
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}