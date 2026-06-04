import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I upload a resource?",
      answer: "To upload a resource, you must first log in. Then go to your Student Dashboard and click on 'Upload New'. Fill in the required details, select your file, and submit it for admin review."
    },
    {
      question: "Why is my uploaded file still pending?",
      answer: "All uploads are reviewed by our admins to ensure quality and relevance. Once an admin approves your file, it will be visible to everyone."
    },
    {
      question: "How do I view my class routine?",
      answer: "In your Student Dashboard, make sure your department, semester, and section are updated in your Profile. Once set, the 'Class Routine' tab will show your schedule automatically."
    },
    {
      question: "Can I edit or delete an uploaded file?",
      answer: "Yes, you can manage your files from the 'My Uploads' section in your dashboard. You can edit the details or delete the file entirely."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-950 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using ResourceHub.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-8 bg-green-50 rounded-2xl border border-green-100">
          <h3 className="text-2xl font-bold text-green-900 mb-3">Still have questions?</h3>
          <p className="text-green-700 mb-6">If you couldn't find what you were looking for, feel free to contact us.</p>
          <Link href="/contact">
            <button className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-500 transition-colors shadow-sm">
              Contact Support
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}