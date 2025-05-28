import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Wrapper component for SVG animations with transitions
export const AnimatedSVGWrapper = ({ step, isTransitioning, children }) => {
  const animations = {
    1: {
      // Document/Forms animation
      initial: { scale: 0.8, opacity: 0, rotate: -5 },
      animate: { 
        scale: 1, 
        opacity: 1, 
        rotate: 0,
        transition: {
          duration: 0.8,
          ease: "backOut"
        }
      },
      float: {
        y: [0, -10, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    2: {
      // Shield/Protection animation
      initial: { scale: 0.7, opacity: 0, y: 50 },
      animate: { 
        scale: 1, 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.8,
          ease: "backOut"
        }
      },
      pulse: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    3: {
      // Camera/Photo animation
      initial: { scale: 0.8, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: "backOut"
        }
      },
      shake: {
        rotate: [0, -2, 2, -2, 0],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut"
        }
      }
    }
  };

  const currentAnimation = animations[step] || animations[1];

  // Falling animation when transitioning from step 1 to 2
  const fallingAnimation = {
    y: [0, 300],
    rotate: [0, 15, -10, 20],
    scale: [1, 1.1, 0.9],
    transition: {
      duration: 0.8,
      ease: "easeIn"
    }
  };

  return (
    <motion.div
      className="relative w-full h-full"
      initial={currentAnimation.initial}
      animate={isTransitioning && step === 1 ? fallingAnimation : currentAnimation.animate}
    >
      <motion.div
        className="w-full h-full"
        animate={!isTransitioning && (currentAnimation.float || currentAnimation.pulse || currentAnimation.shake)}
      >
        {children}
      </motion.div>
      
      {/* Impact effect when transitioning to step 2 */}
      {isTransitioning && step === 1 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.5, 2]
          }}
          transition={{ 
            delay: 0.7,
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <div className="w-full h-full bg-red-500 rounded-full blur-3xl" />
        </motion.div>
      )}
    </motion.div>
  );
};

// Debris animation for transition effect
export const DebrisAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => {
        const randomX = Math.random() * 100 - 50;
        const randomRotate = Math.random() * 360;
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              width: `${20 + Math.random() * 20}px`,
              height: `${20 + Math.random() * 20}px`
            }}
            initial={{ 
              x: 0, 
              y: 0, 
              rotate: 0,
              opacity: 0
            }}
            animate={{ 
              x: randomX + (i % 2 === 0 ? -100 : 100),
              y: 150 + Math.random() * 100,
              rotate: randomRotate,
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1,
              delay: 0.5 + i * 0.05,
              ease: "easeOut"
            }}
          >
            <div className="w-full h-full bg-gray-400 rounded" 
              style={{
                clipPath: `polygon(${Math.random() * 30}% 0%, ${70 + Math.random() * 30}% ${Math.random() * 30}%, ${50 + Math.random() * 50}% 100%, ${Math.random() * 30}% ${70 + Math.random() * 30}%)`
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

// Animated background elements
export const AnimatedBackground = ({ step }) => {
  if (step === 1) {
    // Floating papers
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-16 bg-white rounded shadow-lg opacity-20"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 15}%`
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [-5, 5, -5],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (step === 2) {
    // Protection shield waves
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-green-400"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 1],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (step === 3) {
    // Camera flash effect
    return (
      <>
        <motion.div
          className="absolute inset-0 bg-white rounded-full blur-3xl pointer-events-none"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.5, 1.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeOut"
          }}
        />
        {/* Photo frames floating */}
        {[...Array(4)].map((_, i) => {
          const positions = [
            { top: '5%', left: '5%' },
            { top: '5%', right: '5%' },
            { bottom: '5%', left: '5%' },
            { bottom: '5%', right: '5%' }
          ];
          return (
            <motion.div
              key={i}
              className="absolute w-10 h-12 bg-white rounded shadow-lg opacity-30"
              style={positions[i]}
              animate={{
                y: [0, -10, 0],
                rotate: [-10, 10, -10]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </>
    );
  }

  return null;
};