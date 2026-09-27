import React, { useState, useEffect } from 'react';
import { Menu, X, Mail } from 'lucide-react';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#research', label: 'Research' },
  { href: '#contact', label: 'Contact' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -65% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-4 py-2.5 md:py-3 px-4 sm:px-6 rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-sm">
          <nav className="flex justify-between items-center font-mono gap-3">
            {/* Left Side — Logo */}
            <a
              href="#home"
              className="text-lg sm:text-xl font-bold text-white hover:text-gray-300 transition-colors shrink-0"
            >
              miFu
            </a>

            {/* Middle (Desktop / Tablet Nav) */}
            <div className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8 shrink-0">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-xs lg:text-sm whitespace-nowrap transition-colors duration-200 ${activeSection === link.href.substring(1)
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Side — Email / Mail Icon */}
            <div className="hidden md:flex items-center shrink-0">
              {/* Full email on extra-large screens */}
              <a
                href="mailto:phucttm.dev@gmail.com"
                className="hidden xl:inline text-xs lg:text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                phucttm.dev@gmail.com
              </a>
              {/* Compact mail icon button on tablet/iPad screens */}
              <a
                href="mailto:phucttm.dev@gmail.com"
                aria-label="Send email to phucttm.dev@gmail.com"
                title="phucttm.dev@gmail.com"
                className="xl:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
              >
                <Mail size={18} />
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="text-white p-1 hover:text-gray-300 transition-colors"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 mx-4 sm:mx-6 p-6 rounded-2xl bg-black/90 border border-white/10 shadow-lg backdrop-blur-lg animate-fade-in-up">
          <div className="flex flex-col items-center gap-5 font-mono">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-base transition-colors ${activeSection === link.href.substring(1)
                  ? 'text-white font-semibold'
                  : 'text-gray-300 hover:text-white'
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:phucttm.dev@gmail.com"
              className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors pt-2 border-t border-white/10 w-full text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              phucttm.dev@gmail.com
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
