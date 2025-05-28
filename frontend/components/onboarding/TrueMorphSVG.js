import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const TrueMorphSVG = ({ currentStep, isTransitioning }) => {
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

  // Identify element types for custom animations
  const getElementType = (path) => {
    const fill = path.fill || '';
    const index = path.index;
    
    if (fill.includes('#4D935A') || fill.includes('#55A363') || fill.includes('#44824F')) {
      return 'flower';
    } else if (fill.includes('#F5F6F8') && index < 15) {
      return 'lamp';
    } else if (index >= 20 && index <= 35) {
      return 'books';
    } else if (fill.includes('#F5E7DA') || fill.includes('#FFF6ED')) {
      return 'furniture';
    }
    return 'default';
  };

  // Get transform animation based on element type
  const getTransformAnimation = (path) => {
    const elementType = getElementType(path);
    const isStep2 = currentStep === 2;
    
    if (!isStep2) {
      return {
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1
      };
    }

    switch (elementType) {
      case 'flower':
        return {
          y: 40,
          rotate: 35,
          scale: 0.9,
          transition: {
            duration: 1.2,
            ease: [0.43, 0.13, 0.23, 0.96]
          }
        };
      case 'lamp':
        return {
          rotate: 25,
          x: 12,
          transformOrigin: 'bottom center',
          transition: {
            duration: 1.2,
            ease: "easeInOut"
          }
        };
      case 'books':
        return {
          y: 30,
          rotate: -20 + Math.random() * 40,
          scale: 0.95,
          transition: {
            duration: 1.0,
            delay: path.index * 0.02,
            ease: "easeOut"
          }
        };
      case 'furniture':
        return {
          x: [0, -3, 3, -2, 2, -1, 1, 0],
          y: 3,
          transition: {
            x: {
              duration: 0.8,
              times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1]
            },
            y: {
              duration: 1.2
            }
          }
        };
      default:
        return {
          transition: {
            duration: 1.0
          }
        };
    }
  };

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
          const path1 = svg1Paths[index];
          const path2 = svg2Paths[index];
          
          if (!path1 && !path2) return null;
          
          // Use path1 as fallback if path2 doesn't exist, and vice versa
          const fromPath = path1 || path2;
          const toPath = path2 || path1;
          
          const isStep2 = currentStep === 2;
          const transformAnim = getTransformAnimation(fromPath);

          return (
            <motion.path
              key={index}
              // Morph the path shape
              d={isStep2 ? toPath.d : fromPath.d}
              // Morph the colors
              fill={isStep2 ? toPath.fill : fromPath.fill}
              stroke={isStep2 ? toPath.stroke : fromPath.stroke}
              strokeWidth={isStep2 ? toPath.strokeWidth : fromPath.strokeWidth}
              fillOpacity={isStep2 ? toPath.fillOpacity : fromPath.fillOpacity}
              strokeOpacity={isStep2 ? toPath.strokeOpacity : fromPath.strokeOpacity}
              // Apply transform animations
              animate={{
                ...transformAnim,
                // Shape morphing
                d: isStep2 ? toPath.d : fromPath.d,
                fill: isStep2 ? toPath.fill : fromPath.fill,
                fillOpacity: isStep2 ? (toPath.fillOpacity || 1) : (fromPath.fillOpacity || 1)
              }}
              transition={{
                // Path morphing transition
                d: {
                  duration: isTransitioning ? 1.2 : 0,
                  ease: "easeInOut",
                  delay: index * 0.01
                },
                fill: {
                  duration: isTransitioning ? 1.0 : 0,
                  ease: "easeInOut",
                  delay: index * 0.01
                },
                fillOpacity: {
                  duration: isTransitioning ? 1.0 : 0,
                  ease: "easeInOut"
                },
                // Transform animations
                ...transformAnim.transition
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};