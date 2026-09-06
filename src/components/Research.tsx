import React from 'react';

const Research: React.FC = () => {
  return (
    <section id="research" className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Research</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Exploring reliable evaluation for intelligent systems.</p>
        </div>

        <article className="max-w-4xl mx-auto rounded-xl p-6 sm:p-8 md:p-10 border border-gray-700 hover:border-white/50 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">First Author · Submitted to FISAT EAI 2026</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Latent Surprise Is Protocol-Sensitive: JEPA-Based OOD Detection</h3>
            </div>
            <span className="shrink-0 text-sm font-medium text-gray-300 border border-gray-700 rounded-full px-3 py-1">Under Review</span>
          </div>

          <ul className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed list-disc pl-5">
            <li>Implemented and evaluated JEPA-based world models for out-of-distribution dynamics detection in reinforcement learning environments.</li>
            <li>Designed reproducible experiments across 10 paired seeds and showed that online EMA score normalization can reverse AUROC-based model rankings between latent and pixel prediction errors.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default Research;
