"use client";

import { motion } from "framer-motion";
import { UserPlus, UploadCloud, ShieldCheck, Globe } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Signup",
      description: "Create an account and select your Department & Semester.",
      icon: UserPlus,
    },
    {
      id: 2,
      title: "Upload",
      description: "Share your past questions, assignments, or study notes.",
      icon: UploadCloud,
    },
    {
      id: 3,
      title: "Admin Review",
      description: "Our admins quickly review the material for quality and accuracy.",
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: "Publish",
      description: "The material becomes available for everyone to learn and succeed.",
      icon: Globe,
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-24 bg-green-800 text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-900 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold sm:text-4xl lg:text-5xl"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-green-100 max-w-2xl mx-auto"
          >
            Four simple steps to share knowledge and help your peers succeed.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
          {/* Connecting Line for desktop */}
          <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-1 bg-green-600/50 z-0"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Icon Container with Badge */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-green-700 rounded-full flex items-center justify-center shadow-xl border-4 border-green-600 group-hover:bg-green-600 group-hover:scale-110 group-hover:border-green-400 transition-all duration-300">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 bg-green-400 text-green-900 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-green-800">
                    {step.id}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-green-100/90 leading-relaxed px-2 text-lg">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
