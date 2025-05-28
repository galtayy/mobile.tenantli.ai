import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const SlidingSVG = ({ currentStep, isTransitioning }) => {
  const [svg1Content, setSvg1Content] = useState('');
  const [svg2Content, setSvg2Content] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/onboarding/on1.svg').then(r => r.text()),
      fetch('/onboarding/on2.svg').then(r => r.text())
    ]).then(([svg1, svg2]) => {
      setSvg1Content(svg1);
      setSvg2Content(svg2);
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) return null;

  // Parse SVG and extract paths
  const parseSVGPaths = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    return paths.map((path, index) => ({
      d: path.getAttribute('d'),
      fill: path.getAttribute('fill'),
      stroke: path.getAttribute('stroke'),
      strokeWidth: path.getAttribute('stroke-width'),
      fillOpacity: path.getAttribute('fill-opacity'),
      strokeOpacity: path.getAttribute('stroke-opacity'),
      index
    }));
  };

  const svg1Paths = parseSVGPaths(svg1Content);
  const svg2Paths = parseSVGPaths(svg2Content);

  // removed duplicate function

  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {/* Step 1 - Show original SVG */}
        {currentStep === 1 && (
          <motion.div
            key="step1-svg"
            className="absolute inset-0"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <svg 
              width="385" 
              height="361" 
              viewBox="0 0 385 361" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {svg1Paths.map((path, index) => (
                <motion.path
                  key={`path1-${index}`}
                  d={path.d}
                  fill={path.fill || 'none'}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fillOpacity={path.fillOpacity}
                  strokeOpacity={path.strokeOpacity}
                />
              ))}
            </svg>
          </motion.div>
        )}

        {/* Step 2 - Show damaged SVG with sliding animation */}
        {currentStep === 2 && (
          <motion.div
            key="step2-svg"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <svg 
              width="385" 
              height="361" 
              viewBox="0 0 385 361" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {svg2Paths.map((path, index) => (
                <motion.path
                  key={`path2-${index}`}
                  d={path.d}
                  fill={path.fill || 'none'}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fillOpacity={path.fillOpacity}
                  strokeOpacity={path.strokeOpacity}
                  initial={{ 
                    opacity: isTransitioning ? 0 : 1,
                    scale: isTransitioning ? 0.8 : 1
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{
                    opacity: {
                      duration: isTransitioning ? 0.3 : 0,
                      delay: isTransitioning ? index * 0.02 : 0,
                      ease: "easeOut"
                    },
                    scale: {
                      duration: isTransitioning ? 0.5 : 0,
                      delay: isTransitioning ? index * 0.02 : 0,
                      ease: [0.34, 1.56, 0.64, 1]
                    }
                  }}
                />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};