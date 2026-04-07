"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-secondary text-sm font-medium border text-muted-foreground mb-6">
            Supporting Malaysian Creators 🇲🇾
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="block">Tech Verse My</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Discover Local Innovation
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            A curated showcase of Malaysian-made apps and websites. 
            Explore the digital products built by our local independent builders and startups.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#explore"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-foreground text-background font-medium hover:scale-105 transition-transform"
            >
              Explore Local Products
            </a>
            <a 
              href="https://forms.gle/t72ELQ5x94RauXot5"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-secondary border text-foreground font-medium hover:bg-secondary/80 transition-colors"
            >
              Submit Your Product
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
