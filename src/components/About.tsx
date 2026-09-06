import React from 'react';

const CurrentlyLearningItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="p-4 sm:p-6 border border-gray-700 rounded-xl hover:border-white/50 transition-colors duration-300">
    <h4 className="font-semibold text-white text-lg sm:text-xl mb-2">{title}</h4>
    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{description}</p>
  </div>
);

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 md:py-0 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">About Me</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-4 md:px-0">
            I am a Software Engineering student at FPT University and a backend engineer focused on reliable
            services, thoughtful data models, and clear system boundaries. I enjoy turning complex requirements
            into maintainable APIs and collaborating closely with teams to deliver practical software.
          </p>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white">What I Focus On</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <CurrentlyLearningItem
              title="Backend Engineering"
              description="Designing REST APIs, authentication flows, data models, and service boundaries with Go, .NET, and PostgreSQL."
            />
            <CurrentlyLearningItem
              title="Applied AI Research"
              description="Investigating JEPA-based world models and reproducible evaluation methods for out-of-distribution detection."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
