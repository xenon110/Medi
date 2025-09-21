
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer bg-gradient-primary text-white py-12">
      <div className="footer-content container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="footer-links flex justify-center gap-8 mb-8 flex-wrap">
          <Link href="/#privacy" className="text-white/80 transition-colors duration-300 hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/#terms" className="text-white/80 transition-colors duration-300 hover:text-white">
            Terms of Service
          </Link>
          <Link href="/#about" className="text-white/80 transition-colors duration-300 hover:text-white">
            About Us
          </Link>
          <Link href="/help" className="text-white/80 transition-colors duration-300 hover:text-white">
            Contact
          </Link>
          <Link href="/help" className="text-white/80 transition-colors duration-300 hover:text-white">
            Support
          </Link>
        </div>
        <p className="opacity-80">
          &copy; {new Date().getFullYear()} MEDISKIN. All rights reserved. | Made with ❤️ for better
          healthcare
        </p>
      </div>
    </footer>
  );
};

export default Footer;
