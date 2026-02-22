import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const SuccessCelebration = ({ onReset }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative"
                initial={{ scale: 0.1 }}
                animate={{ scale: 1.5, rotate: 360 }}
                transition={{ duration: 0.8, type: "spring" }}
            >
                <Star size={200} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,0.8)]" />

                <motion.h1
                    className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-4xl font-bold text-white whitespace-nowrap"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Supernova!
                </motion.h1>

                <motion.button
                    className="absolute -bottom-40 left-1/2 -translate-x-1/2 bg-white text-purple-900 px-8 py-3 rounded-full font-bold text-xl hover:bg-purple-100 transition-colors shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onReset}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    Play Again
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default SuccessCelebration;
