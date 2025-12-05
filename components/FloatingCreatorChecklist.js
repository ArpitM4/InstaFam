'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Gift, Check, Circle, Loader2 } from 'lucide-react';
import { useCreatorOnboarding } from '@/hooks/useCreatorOnboarding';

const FloatingCreatorChecklist = () => {
  const { data: session } = useSession();
  const { 
    onboarding, 
    loading, 
    updateProgress: refreshProgress, 
    shouldShowOnboarding, 
    getCompletionStats 
  } = useCreatorOnboarding();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Update progress
  const updateProgress = async () => {
    const result = await refreshProgress();
    if (result?.justCompleted) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  // Auto-update progress every 10 seconds when visible
  useEffect(() => {
    if (!shouldShowOnboarding() || !session?.user) return;
    
    const interval = setInterval(updateProgress, 10000);
    return () => clearInterval(interval);
  }, [shouldShowOnboarding(), session]);

  if (loading || !shouldShowOnboarding() || !onboarding) return null;

  const { completed: completedSteps, total: totalSteps, percentage: progressPercentage } = getCompletionStats();

  const checklistItems = [
    { 
      key: 'isVerified', 
      title: 'Get Account Verified', 
      description: 'Complete email and Instagram verification',
      icon: '✅' 
    },
    { 
      key: 'paymentDetailsAdded', 
      title: 'Add Payment Details', 
      description: 'Add UPI or phone number for payouts',
      icon: '💳' 
    },
    { 
      key: 'profilePageCreated', 
      title: 'Complete Profile Page', 
      description: 'Set username, bio, and profile picture',
      icon: '👤' 
    },
    { 
      key: 'firstEventStarted', 
      title: 'Start First Event', 
      description: 'Launch your first earning event',
      icon: '🎯' 
    },
    { 
      key: 'firstVaultItemAdded', 
      title: 'Add Vault Item', 
      description: 'Create your first exclusive content',
      icon: '🔒' 
    }
  ];

  return (
    <>
      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 100],
                  x: [0, Math.random() * 200 - 100],
                  rotate: [0, 360],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Checklist */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative">
          {/* Collapsed State */}
          {!isExpanded && (
            <motion.button
              onClick={() => setIsExpanded(true)}
              className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Progress Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - progressPercentage / 100) 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              
              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                {completedSteps === totalSteps ? (
                  <Gift className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-bold">{completedSteps}/{totalSteps}</span>
                )}
              </div>
              
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-ping opacity-20"></div>
            </motion.button>
          )}

          {/* Expanded State */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/20 w-80 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Creator Setup</h3>
                      <p className="text-pink-100 text-sm">
                        {completedSteps}/{totalSteps} steps completed
                      </p>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3 bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {checklistItems.map((item, index) => {
                    const isCompleted = onboarding.checklist?.[item.key] || false;
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white" />
                            </motion.div>
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                            {item.icon} {item.title}
                          </p>
                          <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                {completedSteps === totalSteps ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎉</div>
                      <p className="font-bold text-green-800 mb-1">Congratulations!</p>
                      <p className="text-sm text-green-600 mb-3">
                        You've completed all setup steps!
                      </p>
                      <button
                        onClick={() => {
                          // Navigate to settings to claim discount
                          window.location.href = '/creator/dashboard?tab=general';
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Claim Your Reward! 🎁
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      Complete all steps to unlock your exclusive discount code!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default FloatingCreatorChecklist;
