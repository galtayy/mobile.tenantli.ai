import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MorphingSVGPaths = ({ currentStep, isTransitioning }) => {
  const [svg1Paths, setSvg1Paths] = useState([]);
  const [svg2Paths, setSvg2Paths] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/onboarding/on1.svg').then(r => r.text()),
      fetch('/onboarding/on2.svg').then(r => r.text())
    ]).then(([svg1, svg2]) => {
      const parser = new DOMParser();
      
      // Parse both SVGs
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

  // Ensure both SVGs have same number of paths
  const maxPaths = Math.max(svg1Paths.length, svg2Paths.length);
  
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
        {Array.from({ length: maxPaths }).map((_, index) => {
          const path1 = svg1Paths[index] || svg2Paths[index];
          const path2 = svg2Paths[index] || svg1Paths[index];
          
          if (!path1 || !path2) return null;
          
          return (
            <motion.path
              key={index}
              d={currentStep === 1 ? path1.d : path2.d}
              fill={currentStep === 1 ? path1.fill : path2.fill}
              stroke={currentStep === 1 ? path1.stroke : path2.stroke}
              strokeWidth={currentStep === 1 ? path1.strokeWidth : path2.strokeWidth}
              fillOpacity={currentStep === 1 ? path1.fillOpacity : path2.fillOpacity}
              strokeOpacity={currentStep === 1 ? path1.strokeOpacity : path2.strokeOpacity}
              initial={false}
              animate={{
                d: currentStep === 1 ? path1.d : path2.d,
                fill: currentStep === 1 ? path1.fill : path2.fill,
                fillOpacity: currentStep === 1 ? (path1.fillOpacity || 1) : (path2.fillOpacity || 1)
              }}
              transition={{
                duration: isTransitioning ? 0.8 : 0,
                ease: "easeInOut",
                delay: isTransitioning ? index * 0.01 : 0
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};