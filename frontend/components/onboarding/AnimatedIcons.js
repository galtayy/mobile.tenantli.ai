import { motion } from 'framer-motion';

// Camera Icon
export const CameraIcon = ({ className = "" }) => (
  <motion.svg 
    width="64" 
    height="64" 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <motion.path 
      d="M48 20H42L38 16H26L22 20H16C13.7909 20 12 21.7909 12 24V44C12 46.2091 13.7909 48 16 48H48C50.2091 48 52 46.2091 52 44V24C52 21.7909 50.2091 20 48 20Z" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <motion.circle 
      cx="32" 
      cy="34" 
      r="8" 
      stroke="currentColor" 
      strokeWidth="3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "backOut" }}
    />
  </motion.svg>
);

// Shield Icon
export const ShieldIcon = ({ className = "" }) => (
  <motion.svg 
    width="64" 
    height="64" 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <motion.path 
      d="M32 8L12 18V30C12 42.4 20.32 53.76 32 56C43.68 53.76 52 42.4 52 30V18L32 8Z" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    <motion.path 
      d="M24 30L28 34L40 22" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
    />
  </motion.svg>
);

// Document Icon
export const DocumentIcon = ({ className = "" }) => (
  <motion.svg 
    width="64" 
    height="64" 
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <motion.path 
      d="M36 8H16C13.7909 8 12 9.79086 12 12V52C12 54.2091 13.7909 56 16 56H48C50.2091 56 52 54.2091 52 52V24L36 8Z" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path 
      d="M36 8V24H52" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
    />
    <motion.line 
      x1="20" 
      y1="32" 
      x2="44" 
      y2="32" 
      stroke="currentColor" 
      strokeWidth="2"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
    />
    <motion.line 
      x1="20" 
      y1="40" 
      x2="44" 
      y2="40" 
      stroke="currentColor" 
      strokeWidth="2"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 1.2, duration: 0.3 }}
    />
    <motion.line 
      x1="20" 
      y1="48" 
      x2="36" 
      y2="48" 
      stroke="currentColor" 
      strokeWidth="2"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 1.4, duration: 0.3 }}
    />
  </motion.svg>
);

// Floating particles component
export const FloatingParticles = () => {
  const particles = Array.from({ length: 5 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400 rounded-full opacity-40"
          initial={{
            x: Math.random() * 300,
            y: 400,
            scale: 0
          }}
          animate={{
            y: -50,
            scale: [0, 1, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};