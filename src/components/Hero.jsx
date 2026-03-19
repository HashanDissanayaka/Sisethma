import { motion } from 'framer-motion';
import { heroContent } from '../data';
import { ChevronRight } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
            <ParticleBackground />

            {/* Animated Background Elements */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                    x: [0, 100, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[128px] opacity-30"
            />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.img
                        src="/logo.png"
                        alt="Sisethma Logo"
                        className="h-32 md:h-40 mx-auto mb-8 drop-shadow-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    />
                    <h2 className="text-xl md:text-2xl font-light tracking-[0.2em] text-purple-200 mb-4 uppercase">
                        {heroContent.subtitle}
                    </h2>
                    {/* Title removed as Logo is present */}
                    <div className="overflow-hidden mb-10">
                        <motion.p
                            className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.03
                                    }
                                }
                            }}
                        >
                            {heroContent.description.split(" ").map((word, index) => (
                                <motion.span
                                    key={index}
                                    className="inline-block mr-1"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-purple-900 font-bold rounded-full overflow-hidden shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {heroContent.cta} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 1, duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400"
            >
                <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center p-2">
                    <div className="w-1 h-2 bg-slate-400 rounded-full" />
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;
