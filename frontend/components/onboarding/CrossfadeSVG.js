import { motion } from 'framer-motion';

export const CrossfadeSVG = ({ currentStep, isTransitioning }) => {
  return (
    <div className="relative w-full h-full">
      {/* Step 1 SVG */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: currentStep === 1 ? 1 : 0,
        }}
        transition={{ 
          duration: isTransitioning ? 0.6 : 0,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/onboarding/on1.svg" 
          alt="Step 1" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Step 2 SVG */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: currentStep === 2 ? 1 : 0,
        }}
        transition={{ 
          duration: isTransitioning ? 0.6 : 0,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/onboarding/on2.svg" 
          alt="Step 2" 
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
};