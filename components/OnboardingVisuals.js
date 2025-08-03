'use client';

import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';

const OnboardingProgressRing = ({ progress, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(229, 231, 235, 0.5)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export const ChecklistItemIcon = ({ status, icon }) => {
  const iconVariants = {
    pending: { scale: 1, rotate: 0 },
    inProgress: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] },
    completed: { scale: [1, 1.2, 1], rotate: 0 }
  };

  if (status === 'completed') {
    return (
      <motion.div
        variants={iconVariants}
        animate="completed"
        transition={{ duration: 0.5 }}
        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
      >
        <Check className="w-5 h-5 text-white" />
      </motion.div>
    );
  }

  if (status === 'inProgress') {
    return (
      <motion.div
        variants={iconVariants}
        animate="inProgress"
        transition={{ duration: 2, repeat: Infinity }}
        className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
      >
        <Clock className="w-5 h-5 text-white animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={iconVariants}
      animate="pending"
      className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400"
    >
      <span className="text-gray-600">{icon}</span>
    </motion.div>
  );
};

export const CelebrationAnimation = ({ isVisible, onComplete }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      onAnimationComplete={onComplete}
    >
      {/* Confetti particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `hsl(${Math.random() * 360}, 70%, 60%)`,
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360,
            scale: [1, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
        />
      ))}
      
      {/* Success message */}
      <motion.div
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, y: -50 }}
        className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Congratulations!
        </h3>
        <p className="text-gray-600">
          You've completed your creator setup!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingProgressRing;
