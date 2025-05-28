import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedSVG = ({ svgPath, isTransitioning, step }) => {
  const [svgContent, setSvgContent] = useState('');
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    // Load SVG content
    fetch(svgPath)
      .then(response => response.text())
      .then(data => {
        setSvgContent(data);
        // Parse SVG and extract paths
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        const pathElements = doc.querySelectorAll('path');
        
        const pathData = Array.from(pathElements).map((path, index) => ({
          d: path.getAttribute('d'),
          fill: path.getAttribute('fill'),
          stroke: path.getAttribute('stroke'),
          strokeWidth: path.getAttribute('stroke-width'),
          fillOpacity: path.getAttribute('fill-opacity'),
          strokeOpacity: path.getAttribute('stroke-opacity'),
          index
        }));
        
        setPaths(pathData);
      });
  }, [svgPath]);

  // Different falling animations for each path
  const getFallingAnimation = (index) => {
    const delay = index * 0.03; // Stagger the animations
    const randomRotate = Math.random() * 20 - 10; // Random rotation between -10 and 10
    const randomX = Math.random() * 30 - 15; // Subtle random X movement
    
    // For step 2, animate paths falling from above
    if (step === 2) {
      return {
        initial: { 
          y: -400 - Math.random() * 100, 
          x: randomX,
          rotate: randomRotate,
          opacity: 0 
        },
        animate: {
          y: 0,
          x: 0,
          rotate: 0,
          opacity: 1,
          transition: {
            duration: 0.8 + Math.random() * 0.2,
            delay: delay + 0.2, // Add base delay
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth landing
            opacity: { duration: 0.4, delay: delay + 0.1 }
          }
        }
      };
    }
    
    // For step 1, no animation
    return {
      initial: { y: 0, x: 0, rotate: 0, opacity: 1 },
      animate: { y: 0, x: 0, rotate: 0, opacity: 1 }
    };
  };

  if (!paths.length) return null;

  return (
    <svg 
      width="385" 
      height="361" 
      viewBox="0 0 385 361" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {paths.map((path, index) => (
        <motion.path
          key={index}
          d={path.d}
          fill={path.fill || 'none'}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          fillOpacity={path.fillOpacity}
          strokeOpacity={path.strokeOpacity}
          {...getFallingAnimation(index)}
        />
      ))}
    </svg>
  );
};