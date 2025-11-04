import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
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
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="mt-4 py-3 px-6 rounded-full border border-white/10 shadow-sm">
          <nav className="flex justify-between items-center font-mono">
            {/* Left Side — Logo */}
            <a
              href="#home"
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              miFu
            </a>

            {/* Middle (Desktop Nav) */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-colors duration-200 ${activeSection === link.href.substring(1)
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Side — Email */}
            <div className="hidden md:block">
              <a
                href="mailto:phucttm.dev@gmail.com"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                phucttm.dev@gmail.com
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                className="text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 mx-6 p-6 rounded-2xl bg-black/80 border border-white/10 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col items-center gap-6 font-mono">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-lg transition-colors ${activeSection === link.href.substring(1)
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
              className="text-sm text-gray-400 hover:text-white transition-colors"
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
