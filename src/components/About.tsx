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
            I am a driven software engineering intern with a passion for turning complex problems into
            beautiful, intuitive applications. My journey into code began with a fascination for how things
            work, and it has evolved into a continuous quest for knowledge and improvement. I thrive in
            collaborative environments and enjoy leveraging technology to create impactful user experiences.
          </p>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white">Currently Learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <CurrentlyLearningItem
              title="Advanced Go"
              description="Deepening my understanding of concurrency patterns and systems programming."
            />
            <CurrentlyLearningItem
              title="WebAssembly"
              description="Exploring high-performance web applications by compiling native code to run in the browser."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
