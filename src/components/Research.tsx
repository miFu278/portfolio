import React from 'react';
import ScrollReveal from './ScrollReveal';
import TextReveal from './TextReveal';

const RESEARCH_BULLETS = [
  'Implemented and evaluated JEPA-based world models for out-of-distribution dynamics detection in reinforcement learning environments.',
  'Designed reproducible experiments across 10 paired seeds and showed that online EMA score normalization can reverse AUROC-based model rankings between latent and pixel prediction errors.',
];

const Research: React.FC = () => {
  return (
    <section id="research" className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center">
            <TextReveal
              text="Research"
              animation="flip-up"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white justify-center"
              delay={100}
            />
          </div>
          <ScrollReveal animation="slide-right" delay={200}>
            <p className="text-sm sm:text-base text-gray-400 mt-2">
              Exploring reliable evaluation for intelligent systems.
            </p>
          </ScrollReveal>
        </div>

        <article className="max-w-4xl mx-auto">
          <ScrollReveal animation="fade-left" delay={200}>
            <div className="card-hover-glow p-6 sm:p-8 md:p-10 border border-gray-700/80 hover:border-white/50 rounded-xl bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 pb-6 border-b border-gray-800">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 mb-2 font-mono">
                    First Author · Submitted to FISAT EAI 2026
                  </p>
                  <TextReveal
                    text="Latent Surprise Is Protocol-Sensitive: JEPA-Based OOD Detection"
                    as="h3"
                    animation="slide-right"
                    className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                    delay={250}
                  />
                </div>
                <span className="shrink-0 text-xs sm:text-sm font-mono text-gray-300 border border-gray-700 bg-white/5 rounded-full px-3.5 py-1.5 self-start">
                  Under Review
                </span>
              </div>

              <ul className="space-y-4 text-sm sm:text-base text-gray-300 leading-relaxed list-none pl-0">
                {RESEARCH_BULLETS.map((bullet, idx) => (
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

export default Research;
