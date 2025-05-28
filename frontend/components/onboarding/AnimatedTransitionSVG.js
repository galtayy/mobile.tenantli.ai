import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const AnimatedTransitionSVG = ({ currentStep, isTransitioning }) => {
  const [showStep1, setShowStep1] = useState(true);
  const [showTransition, setShowTransition] = useState(false);
  const [showStep2, setShowStep2] = useState(false);

  useEffect(() => {
    if (currentStep === 1) {
      setShowStep1(true);
      setShowTransition(false);
      setShowStep2(false);
    } else if (currentStep === 2 && isTransitioning) {
      // Start transition sequence
      setShowTransition(true);
      
      // After transition animations, show step 2
      setTimeout(() => {
        setShowStep1(false);
        setShowTransition(false);
        setShowStep2(true);
      }, 800);
    } else if (currentStep === 2) {
      setShowStep1(false);
      setShowTransition(false);
      setShowStep2(true);
    }
  }, [currentStep, isTransitioning]);

  return (
    <div className="relative w-full h-full">
      {/* Step 1 SVG - Normal state */}
      {showStep1 && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: showTransition ? 0.5 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src="/onboarding/on1.svg" 
            alt="Step 1" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}

      {/* Transition animations overlay */}
      {showTransition && (
        <div className="absolute inset-0">
          {/* Flower falling animation */}
          <motion.div
            className="absolute"
            style={{ 
              top: '45%', 
              left: '20%',
              width: '60px',
              height: '60px'
            }}
            initial={{ y: 0, rotate: 0 }}
            animate={{ 
              y: 50,
              rotate: 45,
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeIn"
            }}
          >
            <div className="w-full h-full rounded-full bg-green-500/20" />
          </motion.div>

          {/* Lamp tilting animation */}
          <motion.div
            className="absolute"
            style={{ 
              top: '20%', 
              left: '50%',
              width: '40px',
              height: '80px',
              transformOrigin: 'bottom center'
            }}
            initial={{ rotate: 0 }}
            animate={{ 
              rotate: 30,
            }}
            transition={{ 
              duration: 0.6,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
          >
            <div className="w-full h-full bg-yellow-400/20 rounded-t-full" />
          </motion.div>

          {/* Books falling animation */}
          <motion.div
            className="absolute"
            style={{ 
              top: '35%', 
              right: '25%',
              width: '80px',
              height: '20px'
            }}
            initial={{ y: 0, rotate: 0 }}
            animate={{ 
              y: 40,
              rotate: -15,
            }}
            transition={{ 
              duration: 0.5,
              delay: 0.1,
              ease: "easeIn"
            }}
          >
            <div className="w-full h-full bg-blue-500/20" />
          </motion.div>

          {/* Table shaking animation */}
          <motion.div
            className="absolute"
            style={{ 
              bottom: '30%', 
              left: '30%',
              width: '40%',
              height: '10px'
            }}
            initial={{ x: 0 }}
            animate={{ 
              x: [-2, 2, -2, 2, 0],
            }}
            transition={{ 
              duration: 0.5,
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          >
            <div className="w-full h-full bg-brown-600/20" />
          </motion.div>

          {/* Vibration lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ 
                top: `${30 + i * 15}%`, 
                left: '10%',
                right: '10%',
                height: '2px'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: [0, 1, 0],
                opacity: [0, 0.3, 0],
              }}
              transition={{ 
                duration: 0.6,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            >
              <div className="w-full h-full bg-gray-500/20" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Step 2 SVG - Damaged state */}
      {showStep2 && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img 
            src="/onboarding/on2.svg" 
            alt="Step 2" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};