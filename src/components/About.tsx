import React from 'react';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

interface FocusCardProps {
  title: string;
  description: string;
  delay?: number;
  animation?: 'fade-right' | 'fade-left';
}

const CurrentlyLearningItem: React.FC<FocusCardProps> = ({
  title,
  description,
  delay = 0,
  animation = 'fade-right',
}) => (
  <ScrollReveal animation={animation} delay={delay} className="h-full">
    <div className="card-hover-glow p-5 sm:p-7 border border-gray-700/80 hover:border-white/50 rounded-xl bg-white/[0.02] h-full text-left flex flex-col justify-between">
      <div>
        <h4 className="font-semibold text-white text-lg sm:text-xl mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          {title}
        </h4>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{description}</p>
      </div>
    </div>
  </ScrollReveal>
);

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-20 md:py-28 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto space-y-10 md:space-y-14 w-full">
        <div>
          <div className="flex justify-center">
            <TextReveal
              text="About Me"
              animation="slide-right"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white justify-center"
              delay={100}
            />
          </div>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-4 md:px-0">
              I am a Software Engineering student at FPT University and a backend engineer focused on reliable
              services, thoughtful data models, and clear system boundaries. I enjoy turning complex requirements
              into maintainable APIs and collaborating closely with teams to deliver practical software.
            </p>
          </ScrollReveal>
        </div>

        <div>
          <div className="flex justify-center">
            <TextReveal
              text="What I Focus On"
              as="h3"
              animation="slide-left"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white justify-center"
              delay={100}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <CurrentlyLearningItem
              title="Backend Engineering"
              description="Designing REST APIs, authentication flows, data models, and service boundaries with Go, .NET, and PostgreSQL."
              delay={150}
              animation="fade-right"
            />
            <CurrentlyLearningItem
              title="Applied AI Research"
              description="Investigating JEPA-based world models and reproducible evaluation methods for out-of-distribution detection."
              delay={250}
              animation="fade-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
