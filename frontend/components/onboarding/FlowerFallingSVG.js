import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const FlowerFallingSVG = ({ currentStep, isTransitioning }) => {
  const [svg1Paths, setSvg1Paths] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/onboarding/on1.svg')
      .then(r => r.text())
      .then(svgContent => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        
        const paths = Array.from(doc.querySelectorAll('path')).map((path, index) => ({
          d: path.getAttribute('d'),
          fill: path.getAttribute('fill'),
          stroke: path.getAttribute('stroke'),
          strokeWidth: path.getAttribute('stroke-width'),
          fillOpacity: path.getAttribute('fill-opacity'),
          strokeOpacity: path.getAttribute('stroke-opacity'),
          index
        }));
        
        setSvg1Paths(paths);
        setIsLoaded(true);
      });
  }, []);

  if (!isLoaded) return null;

  // Simple flower detection - test specific index range
  const isFlower = (path) => {
    const index = path.index;
    
    // Test specific indices where flower might be
    const potentialFlowerIndices = [46, 47, 48, 49]; // Test these indices
    
    return potentialFlowerIndices.includes(index);
  };

  const isStep2 = currentStep === 2;

  return (
    <div className="relative w-full h-full">
      <svg
        width="385" 
        height="361" 
        viewBox="0 0 385 361" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {svg1Paths.map((path) => {
          const flower = isFlower(path);
          
          return (
            <motion.path
              key={path.index}
              d={path.d}
              fill={path.fill || 'none'}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              fillOpacity={path.fillOpacity}
              strokeOpacity={path.strokeOpacity}
              animate={isStep2 && flower ? {
                // Flower falls to step2 position (estimated)
                y: 60, // More realistic fall distance
                rotate: 25, // More rotation for damaged look
                scale: 0.9 // Slightly smaller as if damaged
              } : {
                // Everything else stays in place
                y: 0,
                rotate: 0,
                scale: 1
              }}
              transition={{
                duration: isTransitioning ? 0.8 : 0,
                ease: [0.43, 0.13, 0.23, 0.96],
                delay: flower ? 0.1 : 0
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};