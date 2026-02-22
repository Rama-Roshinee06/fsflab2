import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const GameCanvas = ({ children }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handlePointerMove = (e) => {
        x.set(e.clientX);
        y.set(e.clientY);
    };

    return (
        <motion.div
            className="relative w-full h-screen overflow-hidden bg-slate-900 text-white font-sans touch-none select-none"
            onPointerMove={handlePointerMove}
        >
            {/* Liquid Background */}
            <div className="absolute inset-0 w-full h-full opacity-70">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            {/* Interactive Stardust Trail (Simplified) */}
            <motion.div
                className="pointer-events-none absolute w-64 h-64 rounded-full bg-white opacity-5 mix-blend-overlay blur-2xl"
                style={{ x, y, translateX: '-50%', translateY: '-50%' }}
            />

            {/* Main Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
                {children}
            </div>
        </motion.div>
    );
};

export default GameCanvas;
