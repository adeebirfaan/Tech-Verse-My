"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Main">
      <div className="container nav__bar">
        <Link href="/" className="wordmark" aria-label="Techverse MY, home">
          <Logo />
        </Link>

        <div className="nav__links">
          <Link href="/#home" className="nav__link">Home</Link>
          <Link href="/#explore" className="nav__link">Explore</Link>
          <Link href="/#about" className="nav__link">About</Link>
          <Link href="/submit" className="nav__link">Submit</Link>
        </div>

        <div className="nav__actions">
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn nav__menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="nav__sheet" data-open={mobileMenuOpen} hidden={!mobileMenuOpen}>
        <div className="container nav__sheet-inner">
          <Link href="/#home" onClick={() => setMobileMenuOpen(false)} className="nav__sheet-link">Home</Link>
          <Link href="/#explore" onClick={() => setMobileMenuOpen(false)} className="nav__sheet-link">Explore</Link>
          <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="nav__sheet-link">About</Link>
          <Link href="/submit" onClick={() => setMobileMenuOpen(false)} className="nav__sheet-link">Submit</Link>
        </div>
      </div>
    </nav>
  );
}
