import React, { useEffect, useState } from 'react';

const PageLoader: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    // Fade out after reaching 100%
                    setTimeout(() => setIsVisible(false), 500);
                    return 100;
                }
                // Random increment for more natural feel
                return prev + Math.random() * 15;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${progress >= 100 ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="text-center space-y-8">
                {/* Logo/Name */}
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-white animate-pulse">
                        miFu
                    </h1>
                    <p className="text-gray-400 text-sm tracking-wider">
                        Backend Developer
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-64 mx-auto">
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                        {Math.round(progress)}%
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
