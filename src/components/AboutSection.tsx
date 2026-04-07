"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section id="about" className="py-24 border-t border-border bg-secondary/20 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Tech Verse My is a dedicated directory aiming to support and showcase
            Malaysian creators, developers, and startups. We believe in making local 
            tech easier to discover and encouraging visibility for independent builders.
          </p>
          <div className="glass inline-block px-8 py-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2">Build something awesome?</h3>
            <p className="text-muted-foreground mb-4 text-sm">Join our growing ecosystem of local apps and websites.</p>
            <a 
              href="https://forms.gle/t72ELQ5x94RauXot5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 rounded-lg bg-foreground text-background font-medium hover:scale-105 transition-transform"
            >
              Submit Your Project
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
