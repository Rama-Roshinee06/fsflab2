import React from 'react';
import { motion } from 'framer-motion';

const OrbSource = ({ onDragEnd }) => {
    return (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-8">
            <motion.div
                className="relative w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                whileHover={{ scale: 1.05 }}
            >
                <span className="text-white/60 font-bold text-sm absolute -top-8 uppercase tracking-widest">Orb Source</span>

                {/* Draggable Orbs */}
                {[1, 2, 3].map((id) => (
                    <DraggableOrb key={id} onDragEnd={onDragEnd} />
                ))}
            </motion.div>
        </div>
    );
};

const DraggableOrb = ({ onDragEnd }) => {
    return (
        <motion.div
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.2, zIndex: 50, cursor: 'grabbing' }}
            onDragEnd={onDragEnd}
            className="w-12 h-12 bg-cyan-400 rounded-full absolute shadow-[0_0_20px_rgba(34,211,238,0.6)] cursor-grab active:cursor-grabbing border-2 border-white/50"
            style={{
                // Random initial float offset could be nice but keeping it simple for now
                x: Math.random() * 20 - 10,
                y: Math.random() * 20 - 10,
            }}
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 3 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    )
}

export default OrbSource;
