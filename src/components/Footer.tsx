import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__row">
        <div className="footer__brand">
          <span className="wordmark" role="img" aria-label="Techverse MY">
            <Logo className="logo--footer" />
          </span>
          <p className="footer__line">Supporting local Malaysian tech, one app at a time.</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <Link href="/#home" className="nav__link">Home</Link>
          <Link href="/#explore" className="nav__link">Explore</Link>
          <Link href="/#about" className="nav__link">About</Link>
        </nav>

        <p className="footer__copy">&copy; {new Date().getFullYear()} Techverse MY.</p>
      </div>
    </footer>
  );
}
