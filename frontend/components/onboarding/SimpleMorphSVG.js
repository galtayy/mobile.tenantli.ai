import { motion } from 'framer-motion';

export const SimpleMorphSVG = ({ currentStep, isTransitioning }) => {
  const isStep2 = currentStep === 2;

  return (
    <div className="relative w-full h-full">
      {/* Step 1 SVG - transform to step 2 positions */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: isStep2 ? 0 : 1,
        }}
        transition={{ 
          duration: isTransitioning ? 1.5 : 0,
          delay: isTransitioning ? 1.0 : 0 // fade out after animation
        }}
        style={{ transformOrigin: "center center" }}
      >
        <motion.img
          src="/onboarding/on1.svg" 
          alt="Step 1" 
          className="w-full h-full object-contain"
          animate={isStep2 ? {
            // Simulate damage with transforms
            y: 10, // slight downward movement
            rotate: 2, // slight tilt
            scale: 0.98, // slight compression
          } : {
            y: 0,
            rotate: 0,
            scale: 1
          }}
          transition={{
            duration: isTransitioning ? 1.2 : 0,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
        />
      </motion.div>

      {/* Step 2 SVG - fade in after animation */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isStep2 ? 1 : 0,
        }}
        transition={{ 
          duration: isTransitioning ? 0.8 : 0,
          delay: isTransitioning ? 1.0 : 0
        }}
      >
        <motion.img
          src="/onboarding/on2.svg" 
          alt="Step 2" 
          className="w-full h-full object-contain"
          initial={{ scale: 0.98, y: 10, rotate: 2 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          transition={{
            duration: isTransitioning ? 0.8 : 0,
            delay: isTransitioning ? 1.0 : 0,
            ease: "easeOut"
          }}
        />
      </motion.div>
    </div>
  );
};