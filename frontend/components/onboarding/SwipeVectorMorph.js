import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const SwipeVectorMorph = ({ currentStep, isTransitioning }) => {
  const [svg1Paths, setSvg1Paths] = useState([]);
  const [svg2Paths, setSvg2Paths] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/onboarding/on1.svg').then(r => r.text()),
      fetch('/onboarding/on2.svg').then(r => r.text())
    ]).then(([svg1, svg2]) => {
      const parser = new DOMParser();
      
      const doc1 = parser.parseFromString(svg1, 'image/svg+xml');
      const doc2 = parser.parseFromString(svg2, 'image/svg+xml');
      
      const paths1 = Array.from(doc1.querySelectorAll('path')).map((path, index) => ({
        d: path.getAttribute('d'),
        fill: path.getAttribute('fill'),
        stroke: path.getAttribute('stroke'),
        strokeWidth: path.getAttribute('stroke-width'),
        fillOpacity: path.getAttribute('fill-opacity'),
        strokeOpacity: path.getAttribute('stroke-opacity'),
        index
      }));
      
      const paths2 = Array.from(doc2.querySelectorAll('path')).map((path, index) => ({
        d: path.getAttribute('d'),
        fill: path.getAttribute('fill'),
        stroke: path.getAttribute('stroke'),
        strokeWidth: path.getAttribute('stroke-width'),
        fillOpacity: path.getAttribute('fill-opacity'),
        strokeOpacity: path.getAttribute('stroke-opacity'),
        index
      }));
      
      setSvg1Paths(paths1);
      setSvg2Paths(paths2);
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) return null;

  const isStep2 = currentStep === 2;
  const maxPaths = Math.max(svg1Paths.length, svg2Paths.length);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Single SVG container that morphs */}
      <div className="absolute inset-0 w-full h-full">
        <svg
          width="385" 
          height="361" 
          viewBox="0 0 385 361" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {Array.from({ length: maxPaths }).map((_, index) => {
            const path1 = svg1Paths[index];
            const path2 = svg2Paths[index];
            
            if (!path1 && !path2) return null;
            
            // Use path1 as fallback if path2 doesn't exist, and vice versa
            const fromPath = path1 || path2;
            const toPath = path2 || path1;

            return (
              <motion.path
                key={index}
                // Morph attributes
                d={fromPath.d}
                fill={fromPath.fill}
                stroke={fromPath.stroke}
                strokeWidth={fromPath.strokeWidth}
                fillOpacity={fromPath.fillOpacity}
                strokeOpacity={fromPath.strokeOpacity}
                // Transform during swipe
                initial={{ 
                  x: 0,
                  opacity: 1
                }}
                animate={isStep2 ? {
                  // Vector morphing animation - only shape, keep color
                  d: toPath.d,
                  // Position animation with swipe feel
                  x: [0, 30, 0], // Swipe right then settle
                } : {
                  d: fromPath.d,
                  x: 0
                }}
                transition={{
                  // Path morphing - instant
                  d: {
                    duration: isTransitioning ? 0.8 : 0,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: index * 0.01
                  },
                  // Swipe animation
                  x: {
                    duration: isTransitioning ? 0.8 : 0,
                    times: [0, 0.4, 1],
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: index * 0.005
                  }
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Swipe overlay effect */}
      {isTransitioning && isStep2 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: '100%' }}
          animate={{ x: '-100%' }}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      )}
    </div>
  );
};