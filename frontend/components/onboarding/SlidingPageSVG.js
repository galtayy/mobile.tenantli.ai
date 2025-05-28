import { motion } from 'framer-motion';

export const SlidingPageSVG = ({ currentStep, isTransitioning }) => {
  const isStep2 = currentStep === 2;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Step 1 Page */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ x: 0 }}
        animate={{ 
          x: isStep2 ? '-100%' : '0%'
        }}
        transition={{ 
          duration: isTransitioning ? 1.0 : 0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <img 
          src="/onboarding/on1.svg" 
          alt="Step 1" 
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Step 2 Page */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={{ x: '100%' }}
        animate={{ 
          x: isStep2 ? '0%' : '100%'
        }}
        transition={{ 
          duration: isTransitioning ? 1.0 : 0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        <motion.img
          src="/onboarding/on2.svg" 
          alt="Step 2" 
          className="w-full h-full object-contain"
          initial={{ scale: 1 }}
          animate={{ 
            scale: isStep2 ? [0.95, 1.02, 1] : 1
          }}
          transition={{
            duration: isTransitioning ? 1.2 : 0,
            delay: isTransitioning ? 0.3 : 0,
            ease: "easeOut"
          }}
        />
      </motion.div>

      {/* Transition overlay effect */}
      {isTransitioning && isStep2 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 1.0 }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" 
               style={{ transform: 'translateX(-100%)' }} />
        </motion.div>
      )}
    </div>
  );
};