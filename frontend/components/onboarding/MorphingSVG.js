import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MorphingSVG = ({ currentStep, isTransitioning }) => {
  const [svg1Paths, setSvg1Paths] = useState([]);
  const [svg2Paths, setSvg2Paths] = useState([]);

  useEffect(() => {
    // Load both SVGs
    Promise.all([
      fetch('/onboarding/on1.svg').then(r => r.text()),
      fetch('/onboarding/on2.svg').then(r => r.text())
    ]).then(([svg1, svg2]) => {
      const parser = new DOMParser();
      
      // Parse SVG 1
      const doc1 = parser.parseFromString(svg1, 'image/svg+xml');
      const paths1 = Array.from(doc1.querySelectorAll('path')).map((path, index) => ({
        d: path.getAttribute('d'),
        fill: path.getAttribute('fill'),
        stroke: path.getAttribute('stroke'),
        strokeWidth: path.getAttribute('stroke-width'),
        fillOpacity: path.getAttribute('fill-opacity'),
        strokeOpacity: path.getAttribute('stroke-opacity'),
        index
      }));
      setSvg1Paths(paths1);
      
      // Parse SVG 2
      const doc2 = parser.parseFromString(svg2, 'image/svg+xml');
      const paths2 = Array.from(doc2.querySelectorAll('path')).map((path, index) => ({
        d: path.getAttribute('d'),
        fill: path.getAttribute('fill'),
        stroke: path.getAttribute('stroke'),
        strokeWidth: path.getAttribute('stroke-width'),
        fillOpacity: path.getAttribute('fill-opacity'),
        strokeOpacity: path.getAttribute('stroke-opacity'),
        index
      }));
      setSvg2Paths(paths2);
    });
  }, []);

  // Get animation for each path based on its position in the SVG
  const getPathAnimation = (index, totalPaths) => {
    // Calculate approximate position of the element based on index
    // Earlier elements (smaller index) are typically at the top
    const verticalPosition = (index / totalPaths) * 360; // Assuming 360px height
    
    return {
      initial: { 
        y: 0,
        rotate: 0,
        opacity: 1
      },
      animate: isTransitioning && currentStep === 2 ? {
        y: 20 + (index * 2), // Slight downward movement, staggered
        rotate: (Math.random() - 0.5) * 10, // Small random rotation
        opacity: 1,
        transition: {
          duration: 0.6,
          delay: index * 0.01,
          ease: [0.25, 0.1, 0.25, 1]
        }
      } : {
        y: 0,
        rotate: 0,
        opacity: 1
      }
    };
  };

  const paths = currentStep === 1 ? svg1Paths : svg2Paths;

  if (!paths.length) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.svg
        key={currentStep}
        width="385" 
        height="361" 
        viewBox="0 0 385 361" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {paths.map((path, index) => (
          <motion.path
            key={`${currentStep}-${index}`}
            d={path.d}
            fill={path.fill || 'none'}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth}
            fillOpacity={path.fillOpacity}
            strokeOpacity={path.strokeOpacity}
            {...getPathAnimation(index, paths.length)}
          />
        ))}
      </motion.svg>
    </AnimatePresence>
  );
};