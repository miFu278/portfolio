import React from 'react';
import { ChevronDown, Download } from 'lucide-react';
import avatarImg from '../assets/mp.jpg';
import resumePdf from '../assets/phucttm-cv.pdf';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative flex items-center justify-center min-h-screen pt-24 md:pt-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-10 items-center gap-8 md:gap-12 w-full max-w-6xl mx-auto md:-mt-40 -mt-20">
        {/* Avatar - Shows first on mobile, last on desktop */}
        <div className="order-1 md:order-2 md:col-span-4 flex justify-center md:justify-end animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-lg hover:scale-105 transition-transform duration-300">
            <img
              src={avatarImg}
              alt="Than Trinh Minh Phuc"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Content - Shows second on mobile, first on desktop */}
        <div className="order-2 md:order-1 md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 pb-2 animate-fade-in-up leading-tight">
            Than Trinh Minh Phuc
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mt-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Software Engineering Intern
          </p>
          <p className="mt-4 md:mt-6 max-w-2xl text-sm sm:text-base text-gray-400 animate-fade-in-up px-4 md:px-0" style={{ animationDelay: '400ms' }}>
            A passionate developer crafting elegant solutions and building immersive digital experiences.
          </p>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto px-4 md:px-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <a
              href="#projects"
              className="px-6 md:px-8 py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition duration-300 transform hover:scale-105 text-center text-sm md:text-base"
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="px-6 md:px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition duration-300 transform hover:scale-105 text-center text-sm md:text-base"
            >
              Contact Me
            </a>
            <a
              href={resumePdf}
              download="phucthan_resume.pdf"
              className="px-6 md:px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Download size={18} className="md:w-5 md:h-5" />
              Resume
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center">
        <a
          href="#about"
          aria-label="Scroll to about section"
          className="animate-bounce"
        >
          <div className="flex flex-col items-center text-gray-400 hover:text-white transition-colors">
            <span className="text-xs md:text-sm">Scroll to explore</span>
            <ChevronDown size={20} className="md:w-6 md:h-6" />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
