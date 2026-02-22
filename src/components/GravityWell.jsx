import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const GravityWell = ({ target, current, onDrop }) => {
    const controls = useAnimation();

    // Pulse animation when close to goal
    useEffect(() => {
        controls.start({
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity }
        });
    }, [controls]);

    const handleMouseUp = (e, info) => {
        // Simple collision detection
        // In a real sophisticated app we'd use a collision library or ref bounding rects
        // Here we rely on the parent or dragEnd event.
        // But `framer-motion`'s `drag` is on the orb in OrbSource...
        // We need a way to detect drop.

        // Actually, easiest way is to make the OrbSource emit an event with point info,
        // and check if it's inside this well's rect.
        // For now, let's assume the Logic happens in App.js with a ref to this.
    };

    return (
        <div className="relative flex flex-col items-center justify-center">
            <motion.div
                id="gravity-well"
                className="w-48 h-48 rounded-full border-4 border-dashed border-white/30 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                animate={controls}
            >
                <div className="text-6xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    {current} / {target}
                </div>

                {/* Visual particles orbit could go here */}
            </motion.div>
            <div className="mt-4 text-xl text-indigo-300 font-medium">Gravity Goal</div>
        </div>
    );
};

export default GravityWell;
