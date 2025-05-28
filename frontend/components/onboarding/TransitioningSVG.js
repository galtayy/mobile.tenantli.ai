import { motion, AnimatePresence } from 'framer-motion';

export const TransitioningSVG = ({ currentStep, isTransitioning }) => {
  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {/* Step 1 SVG - fades out during transition */}
        {currentStep === 1 && (
          <motion.div
            key="svg1"
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.4, delay: 0.2 }
            }}
          >
            <img 
              src="/onboarding/on1.svg" 
              alt="Step 1" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        )}

        {/* Step 2 SVG - appears with falling effect */}
        {currentStep === 2 && (
          <motion.div
            key="svg2"
            className="absolute inset-0"
            initial={{ 
              y: isTransitioning ? -20 : 0,
              opacity: 0,
              filter: "blur(2px)"
            }}
            animate={{ 
              y: isTransitioning ? 30 : 0,
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                y: { 
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  duration: 1.2
                },
                opacity: { duration: 0.6, delay: 0.3 },
                filter: { duration: 0.8, delay: 0.2 }
              }
            }}
          >
            <motion.div
              animate={isTransitioning ? {
                rotate: [0, -2, 1, -1, 0],
                scale: [1, 0.98, 1.01, 0.99, 1],
              } : {}}
              transition={{
                duration: 1.2,
                times: [0, 0.2, 0.5, 0.8, 1],
                ease: "easeInOut"
              }}
            >
              <img 
                src="/onboarding/on2.svg" 
                alt="Step 2" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay effect during transition */}
      {isTransitioning && currentStep === 2 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-black/10 to-transparent" />
        </motion.div>
      )}
    </div>
  );
};