import React, { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';

const PageLoader: React.FC = () => {
  const { setIsLoaded } = useLoading();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Simulate loading progress with responsive increments
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExiting(true);
          // Trigger page entrance animation right as loader dissolves
          setTimeout(() => setIsLoaded(true), 120);
          // Unmount after fade out completes
          setTimeout(() => setIsVisible(false), 550);
          return 100;
        }
        return prev + Math.random() * 16 + 6;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [setIsLoaded]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-8 px-4">
        {/* Logo/Name with smooth entrance */}
        <div className="space-y-2 animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
            miFu
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm tracking-widest font-mono uppercase">
            Backend Software Engineer
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-56 sm:w-64 mx-auto">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2 font-mono">
            {Math.round(Math.min(100, progress))}%
          </p>
        </div>

        {/* Subtle loading dots */}
        <div className="flex justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
