import React from 'react';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

const BULLETS = [
  'Developed approximately 50 REST API endpoints in Go for an internal HR management system covering employee, attendance, leave, email, and notification workflows.',
  'Designed the backend architecture and PostgreSQL data model, including relationships, migrations, indexes, and JWT-based role-based access control.',
  'Established a Clean Architecture codebase, repository workflow, and Git conventions while coordinating backend delivery and API integration in a 7-member cross-functional team.',
];

const Experience: React.FC = () => {
  return (
    <section id="experience" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center">
            <TextReveal
              text="Experience"
              animation="flip-up"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white justify-center"
              delay={100}
            />
          </div>
          <ScrollReveal animation="slide-right" delay={200}>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              Building maintainable backend systems in a collaborative team.
            </p>
          </ScrollReveal>
        </div>

        <article className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-up" delay={200}>
            <div className="card-hover-glow p-6 sm:p-8 md:p-10 border border-gray-700/80 hover:border-white/50 rounded-xl bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 pb-6 border-b border-gray-800">
                <div>
                  <TextReveal
                    text="Backend Engineer Intern"
                    as="h3"
                    animation="slide-right"
                    className="text-2xl sm:text-3xl font-bold text-white mb-1"
                    delay={250}
                  />
                  <p className="text-gray-300">Tel4VN · Ho Chi Minh City, Vietnam</p>
                </div>
                <span className="text-xs sm:text-sm font-mono text-gray-400 sm:text-right bg-white/5 border border-white/10 px-3 py-1.5 rounded-full self-start">
                  Jan 2026 - May 2026
                </span>
              </div>

              <ul className="space-y-4 text-sm sm:text-base text-gray-300 leading-relaxed list-none pl-0">
                {BULLETS.map((bullet, idx) => (
                  <ScrollReveal
                    key={idx}
                    as="li"
                    animation="fade-right"
                    delay={300 + idx * 120}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </ScrollReveal>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </article>
      </div>
    </section>
  );
};

export default Experience;
