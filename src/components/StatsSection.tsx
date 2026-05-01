"use client";

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { Users, FileText, Building2, CheckCircle } from "lucide-react";

// Counter Component using Framer Motion
function Counter({ from, to, suffix = "" }: { from: number; to: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const count = useMotionValue(from);
  
  // Format number with commas and add suffix
  const rounded = useTransform(count, (latest) => {
    return Math.round(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, to, { duration: 2.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function StatsSection() {
  const stats = [
    {
      id: 1,
      name: "Total Users",
      value: 2500,
      suffix: "+",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/20",
    },
    {
      id: 2,
      name: "Total Uploads",
      value: 12400,
      suffix: "+",
      icon: FileText,
      color: "text-green-400",
      bg: "bg-green-400/20",
    },
    {
      id: 3,
      name: "Departments",
      value: 45,
      suffix: "",
      icon: Building2,
      color: "text-purple-400",
      bg: "bg-purple-400/20",
    },
    {
      id: 4,
      name: "Approved Materials",
      value: 11800,
      suffix: "+",
      icon: CheckCircle,
      color: "text-orange-400",
      bg: "bg-orange-400/20",
    },
  ];

  return (
    <section className="w-full py-12 bg-green-800 border-t border-green-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Trusted by Students Everywhere
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-green-50 max-w-2xl mx-auto"
          >
            Join a rapidly growing community. Together, we are building the largest academic database for university students.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-green-700/40 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-green-600 hover:bg-green-700/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${stat.bg} mb-4`}>
                  <Icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-1 font-mono">
                  <Counter from={0} to={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-sm font-semibold text-green-200 uppercase tracking-wide">{stat.name}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
