import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Petal } from '../types';

interface DaisyFlowerProps {
  petals: Petal[];
  onPluck: (id: number) => void;
  isGameOver: boolean;
  pulseCore: boolean;
}

export const DaisyFlower: React.FC<DaisyFlowerProps> = ({
  petals,
  onPluck,
  isGameOver,
  pulseCore,
}) => {
  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center select-none pointer-events-none">
      
      {/* Glow highlight behind the flower */}
      <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full scale-110 pointer-events-none" />

      {/* Petals layer */}
      <div className="absolute inset-0 pointer-events-auto">
        <AnimatePresence>
          {petals.map((petal, index) => {
            // Animating pluck state with rich compound transition
            const pluckAnimation = petal.isPlucked
              ? {
                  y: [0, -25, 200],                  // rises up, then gravity pulls it down
                  x: [0, (petal.angle > 180 ? -80 : 80), (petal.angle > 180 ? -150 : 150)], // drifts laterally based on angle side
                  rotate: [petal.angle, petal.angle + 70, petal.angle + 270],               // spins rapidly
                  scale: [1, 0.85, 0],               // shrinks out of sight
                  opacity: [1, 0.9, 0],              // fades away beautifully
                }
              : {
                  rotate: petal.angle,
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  x: 0,
                };

            return (
              <motion.div
                key={petal.id}
                className="absolute origin-bottom cursor-pointer group pointer-events-auto"
                style={{
                  width: '16%', // Wider to overlap beautifully and form a complete flower shape
                  height: '43%', // Slightly longer petals for a lush realistic design
                  bottom: '50%',
                  left: 'calc(50% - 8%)', // Position pivot point exactly at the horizontal center
                  transformOrigin: '50% 100%',
                }}
                initial={{ scale: 0, rotate: petal.angle, opacity: 0 }}
                animate={pluckAnimation}
                transition={
                  petal.isPlucked
                    ? {
                        duration: 1.4,
                        ease: [0.25, 1, 0.5, 1], // Custom overshoot deceleration to acceleration curve
                      }
                    : {
                        type: 'spring',
                        stiffness: 100,
                        damping: 15,
                        delay: index * 0.05, // Beautiful cascade cascade entrance
                      }
                }
                whileHover={
                  !petal.isPlucked
                    ? {
                        scale: 1.07,
                        filter: 'brightness(1.05)',
                        z: 10,
                      }
                    : undefined
                }
                whileTap={!petal.isPlucked ? { scale: 0.95 } : undefined}
                onClick={() => !petal.isPlucked && onPluck(petal.id)}
              >
                {/* Visual rendering of a realistic tapered daisy petal */}
                <div
                  className="w-full h-[95%] rounded-[55%_55%_40%_40%_/_75%_75%_25%_25%] relative overflow-hidden flex flex-col justify-end items-center"
                  style={{
                    background: 'linear-gradient(to top, rgba(253, 244, 245, 0.95) 0%, rgba(255, 255, 255, 0.98) 40%, rgba(255, 255, 255, 1) 100%)',
                    boxShadow: 'inset 0 -10px 14px rgba(244, 63, 94, 0.08), 0 5px 12px rgba(109, 40, 217, 0.15)',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                    transform: `scaleX(${petal.scaleX}) scaleY(${petal.scaleY})`,
                    transformOrigin: '50% 100%',
                  }}
                >
                  {/* Glowing core blend point near flower center */}
                  <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-pink-300/40 to-transparent blur-[1px]" />
                  
                  {/* Tiny delicate petal rib line */}
                  <div className="w-[1.5px] h-[58%] bg-gradient-to-t from-pink-200/50 via-pink-100/20 to-transparent rounded-full mb-[15%]" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Flower core (Central Disk) */}
      <motion.div
        className="absolute w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full z-20 flex items-center justify-center p-0.5 shadow-xl shadow-pink-900/10 cursor-default pointer-events-auto"
        initial={{ scale: 0 }}
        animate={{
          scale: pulseCore ? [1, 1.25, 0.95, 1] : 1,
          rotate: isGameOver ? [0, 10, -10, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.45, ease: 'easeOut' },
          rotate: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
        }}
        style={{
          background: 'radial-gradient(circle, #fde047 10%, #facc15 50%, #ca8a04 100%)',
          boxShadow: 'inset 0 4px 8px rgba(255, 255, 255, 0.6), 0 0 20px rgba(234, 179, 8, 0.5), 0 8px 16px rgba(0, 0, 0, 0.15)',
          border: '2px solid rgba(254, 240, 138, 0.8)',
        }}
      >
        {/* Soft detailed honeycomb texture pattern inside the core */}
        <div className="w-full h-full rounded-full bg-[radial-gradient(#ca8a04_1px,transparent_1px)] [background-size:4px_4px] opacity-40" />

        {/* Floating pulse light on top */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 rounded-full" />
      </motion.div>

    </div>
  );
};
