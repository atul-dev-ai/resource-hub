"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Target, BookOpen, GraduationCap, Code, ArrowLeft, HeartHandshake, ExternalLink, Palette } from "lucide-react";

export default function AboutContent() {
  const features = [
    {
      title: "Community Driven",
      description: "Built by students, for students. A collaborative space to share knowledge and help each other succeed.",
      icon: <Users className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Centralized Archive",
      description: "No more scrolling through endless chat groups. Find all previous year questions and notes in one organized place.",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Academic Growth",
      description: "Empowering students with the right resources at the right time to boost their academic performance.",
      icon: <GraduationCap className="w-6 h-6 text-green-600" />,
    },
  ];

  const teamMembers = [
    {
      name: "Atul Paul",
      role: "Founder & Lead Developer",
      department: "B.Sc. in CIS, DIU",
      image: "/atul2.jpg",
      github: "https://github.com/atul-dev-ai",
      bio: "Passionate about building scalable web applications and solving real-world problems through technology.",
      icon: <Code className="w-5 h-5 text-green-600" />
    },
    {
      name: "John Doe", 
      role: "Co-Developer", 
      department: "B.Sc. in CIS, DIU", 
      image: "/light-mode.png",
      github: "https://github.com/",
      bio: "Creative thinker focused on delivering seamless and intuitive user experiences for the student community.",
      icon: <Palette className="w-5 h-5 text-green-600" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900 rounded-3xl p-8 sm:p-16 text-center shadow-xl mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/banner-2.jpg')] opacity-10 mix-blend-overlay object-cover"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">Empowering Students Through Knowledge</h1>
            <p className="text-green-200 text-lg sm:text-xl leading-relaxed">
              Varsity Resource Hub is a centralized, community-driven platform designed to make academic materials accessible, organized, and secure for everyone.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Our Mission */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600 border border-green-100">
                  <Target className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                We observed that students often struggle to find past exam questions, quality class notes, and assignment references before exams. Valuable resources get lost in endless Messenger or WhatsApp threads. 
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Our mission is to bridge this gap. We want to create a structured ecosystem where students can seamlessly upload, organize, and retrieve academic materials, ensuring that no one is left behind during their exam preparations.
              </p>
            </div>

            {/* Core Values / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                  <div className="p-3 bg-green-50 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Team Profiles */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2 px-2">Meet the Team</h3>
            
            {/* Map through team members */}
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50 shadow-md mx-auto bg-slate-100 flex items-center justify-center">
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        width={96} 
                        height={96} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md border border-slate-100">
                      {member.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">{member.name}</h4>
                  <p className="text-green-600 font-medium text-sm mb-1">{member.role}</p>
                  <p className="text-slate-500 text-xs">{member.department}</p>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-5 text-center">
                  {member.bio}
                </p>

                <Link href={member.github} target="_blank" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm">
                  {/* FIX: Github icon replaced with ExternalLink */}
                  <ExternalLink className="w-4 h-4" /> GitHub Profile
                </Link>
              </div>
            ))}

            {/* Contact CTA */}
            <div className="mt-6">
              <Link href="/contact" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm shadow-sm">
                <HeartHandshake className="w-5 h-5" /> Collaborate With Us
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}