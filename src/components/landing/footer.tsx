import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer bg-gradient-primary text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center gap-8 mb-8 flex-wrap">
          <Link href="/#privacy" className="footer-link">
            Privacy Policy
          </Link>
          <Link href="/#terms" className="footer-link">
            Terms of Service
          </Link>
          <Link href="/#about" className="footer-link">
            About Us
          </Link>
          <Link href="/help" className="footer-link">
            Contact
          </Link>
          <Link href="/help" className="footer-link">
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
