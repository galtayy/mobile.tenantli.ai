import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const VectorTransitionSVG = ({ currentStep, isTransitioning }) => {
  const [svg1Paths, setSvg1Paths] = useState([]);
  const [svg2Paths, setSvg2Paths] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('step1'); // 'step1', 'transitioning', 'step2'

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

  useEffect(() => {
    if (currentStep === 1) {
      setAnimationPhase('step1');
    } else if (currentStep === 2 && isTransitioning) {
      setAnimationPhase('transitioning');
      // Don't automatically switch to step2, let the animation complete
    } else if (currentStep === 2 && !isTransitioning) {
      setAnimationPhase('step2');
    }
  }, [currentStep, isTransitioning]);

  if (!isLoaded) return null;

  // Identify element types based on color and position
  const getElementType = (path) => {
    const fill = path.fill || '';
    const index = path.index;
    
    if (fill.includes('#4D935A') || fill.includes('#55A363') || fill.includes('#44824F')) {
      return 'flower';
    } else if (fill.includes('#F5F6F8') && index < 15) {
      return 'lamp';
    } else if (index >= 22 && index <= 30) {
      return 'books';
    } else if (fill.includes('#F5E7DA') || fill.includes('#FFF6ED')) {
      return 'furniture';
    }
    return 'default';
  };

  // Get animation based on element type and phase
  const getAnimation = (path, phase) => {
    const elementType = getElementType(path);
    
    if (phase === 'step1') {
      return {
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        opacity: 1
      };
    } else if (phase === 'transitioning') {
      switch (elementType) {
        case 'flower':
          return {
            y: [0, 20, 45],
            rotate: [0, 15, 35],
            scale: [1, 0.95, 0.9],
            opacity: [1, 0.9, 0.3],
            transition: {
              duration: 1.2,
              times: [0, 0.6, 1],
              ease: [0.43, 0.13, 0.23, 0.96]
            }
          };
        case 'lamp':
          return {
            rotate: [0, 10, 25],
            x: [0, 5, 12],
            transformOrigin: 'bottom center',
            opacity: [1, 0.9, 0.3],
            transition: {
              duration: 1.2,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }
          };
        case 'books':
          return {
            y: [0, 15, 35],
            rotate: [0, -10 + Math.random() * 20, -20 + Math.random() * 40],
            scale: [1, 0.98, 0.95],
            opacity: [1, 0.8, 0.2],
            transition: {
              duration: 1.0,
              delay: path.index * 0.02,
              times: [0, 0.6, 1],
              ease: "easeOut"
            }
          };
        case 'furniture':
          return {
            x: [0, -3, 3, -2, 2, -1, 1, 0],
            y: [0, 1, 3],
            opacity: [1, 0.95, 0.4],
            transition: {
              x: {
                duration: 0.8,
                times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1],
                ease: "easeOut"
              },
              y: {
                duration: 1.2,
                times: [0, 0.5, 1]
              },
              opacity: {
                duration: 1.2,
                times: [0, 0.6, 1]
              }
            }
          };
        default:
          return {
            opacity: [1, 0.9, 0.3],
            transition: {
              duration: 1.0,
              times: [0, 0.6, 1]
            }
          };
      }
    } else {
      return {
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
        opacity: 1
      };
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Single SVG container - no page refresh feeling */}
      <svg
        width="385" 
        height="361" 
        viewBox="0 0 385 361" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Step 1 paths with transitions to step 2 - hide when step2 is complete */}
        {animationPhase !== 'step2' && svg1Paths.map((path, index) => {
          const isStep2 = currentStep === 2;
          
          return (
            <motion.path
              key={path.index}
              d={path.d}
              fill={path.fill || 'none'}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              fillOpacity={path.fillOpacity}
              strokeOpacity={path.strokeOpacity}
              animate={isStep2 ? getAnimation(path, 'transitioning') : getAnimation(path, 'step1')}
              onAnimationComplete={() => {
                // When transition animation completes, smoothly show step 2 content
                if (isStep2 && animationPhase === 'transitioning' && index === 0) {
                  setTimeout(() => setAnimationPhase('step2'), 100);
                }
              }}
            />
          );
        })}

        {/* Step 2 paths fade in after transition */}
        {animationPhase === 'step2' && svg2Paths.map((path) => (
          <motion.path
            key={`step2-${path.index}`}
            d={path.d}
            fill={path.fill || 'none'}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth}
            fillOpacity={path.fillOpacity}
            strokeOpacity={path.strokeOpacity}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5,
              delay: path.index * 0.01
            }}
          />
        ))}
      </svg>
    </div>
  );
};