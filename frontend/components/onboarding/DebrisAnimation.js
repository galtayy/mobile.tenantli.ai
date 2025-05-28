import { motion } from 'framer-motion';

export const DebrisAnimation = ({ isActive }) => {
  if (!isActive) return null;

  const debris = [
    { id: 1, x: -50, y: 0, rotate: 45, delay: 0.1 },
    { id: 2, x: 30, y: -20, rotate: -30, delay: 0.15 },
    { id: 3, x: -20, y: 30, rotate: 60, delay: 0.2 },
    { id: 4, x: 60, y: 10, rotate: -45, delay: 0.25 },
    { id: 5, x: -40, y: -30, rotate: 90, delay: 0.3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {debris.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute top-1/2 left-1/2"
          initial={{ 
            x: piece.x, 
            y: piece.y, 
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            x: piece.x * 2, 
            y: piece.y + 200, 
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            rotate: piece.rotate
          }}
          transition={{ 
            duration: 0.8, 
            delay: piece.delay,
            ease: "easeOut"
          }}
        >
          <div className="w-4 h-4 bg-[#8B7355] rounded-sm" />
        </motion.div>
      ))}
    </div>
  );
};