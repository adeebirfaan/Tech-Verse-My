"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Tech Verse My
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#home" className="text-sm font-medium hover:text-blue-500 transition-colors">Home</Link>
            <Link href="#explore" className="text-sm font-medium hover:text-blue-500 transition-colors">Explore</Link>
            <Link href="#about" className="text-sm font-medium hover:text-blue-500 transition-colors">About</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button 
              className="md:hidden p-2 text-foreground focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
              <Link href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary">Home</Link>
              <Link href="#explore" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary">Explore</Link>
              <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-secondary">About</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
