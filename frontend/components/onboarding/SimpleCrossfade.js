import { motion } from 'framer-motion';

export const SimpleCrossfade = ({ currentStep, isTransitioning }) => {
  return (
    <div className="relative w-full h-full">
      {/* Step 1 Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: currentStep === 1 ? 1 : 0,
        }}
        transition={{ 
          duration: isTransitioning ? 0.5 : 0,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/onboarding/on1.svg" 
          alt="Step 1" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Step 2 Image - also used for step 3 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: (currentStep === 2 || currentStep === 3) ? 1 : 0,
          scale: currentStep === 3 ? 0.8 : 1, // Zoom out in step 3
        }}
        transition={{ 
          duration: isTransitioning ? 0.5 : 0,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/onboarding/on2.svg" 
          alt="Step 2" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Step 3 Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: currentStep === 3 ? 1 : 0,
        }}
        transition={{ 
          duration: isTransitioning ? 0.5 : 0,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/onboarding/on3.svg" 
          alt="Step 3" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};