import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomAnimatedSVG = ({ currentStep, isTransitioning }) => {
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

  // Parse SVG and extract paths with custom grouping
  const parseSVGWithGroups = (svgContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path'));
    
    return paths.map((path, index) => {
      const d = path.getAttribute('d');
      const fill = path.getAttribute('fill');
      
      // Try to identify elements by their characteristics
      let elementType = 'default';
      
      // Flower/Plant detection - green colors and specific path indices
      if (fill && (fill.includes('#4D935A') || fill.includes('#55A363') || fill.includes('#44824F') || fill.includes('#6C7A7F'))) {
        elementType = 'flower';
      }
      // Lamp detection - yellow/light colors in upper portion
      else if (fill && (fill.includes('#F5F6F8') || fill.includes('#DADBD8')) && index < 15) {
        elementType = 'lamp';
      }
      // Books/items on shelf
      else if (index >= 22 && index <= 30) {
        elementType = 'books';
      }
      // Table/furniture detection
      else if (fill && (fill.includes('#F5E7DA') || fill.includes('#FFF6ED')) && index > 30) {
        elementType = 'furniture';
      }
      
      return {
        d,
        fill: fill,
        stroke: path.getAttribute('stroke'),
        strokeWidth: path.getAttribute('stroke-width'),
        fillOpacity: path.getAttribute('fill-opacity'),
        strokeOpacity: path.getAttribute('stroke-opacity'),
        index,
        elementType
      };
    });
  };

  const svg1Paths = parseSVGWithGroups(svg1Content);
  const svg2Paths = parseSVGWithGroups(svg2Content);

  // Custom animations based on element type
  const getCustomAnimation = (path, isStep2) => {
    if (!isStep2 || !isTransitioning) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }

    // Step 2 animations - just appearance animations since they're already in damaged state
    switch (path.elementType) {
      case 'flower':
        // Flower appears with slight wobble
        return {
          initial: { 
            scale: 0,
            opacity: 0
          },
          animate: {
            scale: [0, 1.1, 0.95, 1],
            opacity: 1
          },
          transition: {
            scale: {
              duration: 0.6,
              times: [0, 0.6, 0.8, 1],
              ease: "easeOut"
            },
            opacity: {
              duration: 0.3
            }
          }
        };
        
      case 'lamp':
        // Lamp appears with swing motion (already tilted)
        return {
          initial: {
            rotate: -5,
            opacity: 0,
            transformOrigin: "top center"
          },
          animate: {
            rotate: [5, -3, 2, -1, 0],
            opacity: 1
          },
          transition: {
            rotate: {
              duration: 1,
              times: [0, 0.3, 0.5, 0.7, 1],
              ease: "easeOut"
            },
            opacity: {
              duration: 0.3
            }
          }
        };
        
      case 'books':
        // Books appear scattered with bounce
        return {
          initial: {
            scale: 0,
            opacity: 0
          },
          animate: {
            scale: 1,
            opacity: 1
          },
          transition: {
            scale: {
              duration: 0.5,
              delay: path.index * 0.02,
              ease: [0.34, 1.56, 0.64, 1]
            },
            opacity: {
              duration: 0.3,
              delay: path.index * 0.02
            }
          }
        };
        
      case 'furniture':
        // Furniture appears with subtle shake (damage vibration)
        return {
          initial: {
            x: 0,
            opacity: 0
          },
          animate: {
            x: [0, -1, 1, -0.5, 0.5, 0],
            opacity: 1
          },
          transition: {
            x: {
              duration: 0.4,
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              ease: "easeOut"
            },
            opacity: {
              duration: 0.2
            }
          }
        };
        
      default:
        // Default fade in
        return {
          initial: {
            opacity: 0
          },
          animate: {
            opacity: 1
          },
          transition: {
            opacity: {
              duration: 0.4,
              delay: path.index * 0.01
            }
          }
        };
    }
  };

  const paths = currentStep === 1 ? svg1Paths : svg2Paths;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            {paths.map((path, index) => {
              const animation = getCustomAnimation(path, currentStep === 2);
              
              return (
                <motion.path
                  key={`${currentStep}-${index}`}
                  d={path.d}
                  fill={path.fill || 'none'}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fillOpacity={path.fillOpacity}
                  strokeOpacity={path.strokeOpacity}
                  {...animation}
                />
              );
            })}
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};