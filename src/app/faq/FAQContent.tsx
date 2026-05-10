"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HelpCircle, MessageCircle, ChevronDown } from "lucide-react";

export default function FAQContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // প্রথমটি ডিফল্টভাবে খোলা থাকবে

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Varsity Resource Hub?",
      answer: "Varsity Resource Hub is a community-driven academic platform designed for university students. It allows you to securely share, organize, and access study materials, class notes, and previous year questions in one central place."
    },
    {
      question: "Who can upload resources?",
      answer: "Any registered student can upload resources. However, to maintain the quality of the platform, newly uploaded files may undergo a quick review by our Moderators or Admins before they are publicly visible to everyone."
    },
    {
      question: "Is the platform completely free?",
      answer: "Yes! The platform is 100% free for all students. Our goal is to make academic knowledge accessible to everyone without any financial barriers."
    },
    {
      question: "Are my personal details visible to other students?",
      answer: "No. While your uploaded resources will display your name so you get credit for your contribution, sensitive details like your email address or password are strictly hidden and secured using enterprise-grade database security."
    },
    {
      question: "I uploaded a wrong file by mistake. How can I delete it?",
      answer: "You can manage your uploads by going to your Dashboard -> 'My Uploads' section. From there, you can view the status of your files or delete them if needed. If you face any issues, you can always contact the administration."
    },
    {
      question: "How can I become a Moderator for my department?",
      answer: "We are always looking for active contributors! If you consistently upload high-quality materials and help the community, you can reach out to us via the Contact Page to apply for a Moderator role."
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
          className="bg-green-900 rounded-3xl p-8 sm:p-12 text-center shadow-xl mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/banner-2.jpg')] opacity-10 mix-blend-overlay object-cover"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-green-800/50 rounded-2xl mb-6 backdrop-blur-sm border border-green-700">
              <HelpCircle className="w-10 h-10 text-green-300" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">Frequently Asked Questions</h1>
            <p className="text-green-200 text-lg max-w-2xl mx-auto">
              Got questions? We've got answers. If you have some other questions, feel free to reach out to our team.
            </p>
          </div>
        </motion.div>

        {/* FAQ Accordion Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index ? "border-green-400 shadow-md ring-1 ring-green-100" : "border-slate-200 shadow-sm hover:border-green-300"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none cursor-pointer"
              >
                <h3 className={`text-lg font-bold pr-8 transition-colors ${openIndex === index ? "text-green-700" : "text-slate-800"}`}>
                  {faq.question}
                </h3>
                <div className={`p-1 rounded-full transition-transform duration-300 ${openIndex === index ? "bg-green-100 text-green-700 rotate-180" : "bg-slate-100 text-slate-500"}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                      <p className="text-slate-600 leading-relaxed text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>

        {/* Still Have Questions Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-green-50 rounded-3xl p-8 border border-green-100 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full mb-4 shadow-sm text-green-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Can't find the answer you're looking for? Please chat to our friendly team, we're always here to help.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md hover:shadow-lg gap-2">
            Contact Support
          </Link>
        </motion.div>

      </div>
    </div>
  );
}