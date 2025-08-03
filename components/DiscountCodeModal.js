'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const DiscountCodeModal = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const handleApplyCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/discount-codes/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          code: data.code,
          description: data.description,
          discountType: data.discountType,
          discountValue: data.discountValue
        });
        
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess && onSuccess(data);
          onClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.message,
          error: data.error,
          incompleteSteps: data.incompleteSteps,
          checklist: data.checklist
        });

        if (data.showChecklist) {
          setShowChecklist(true);
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to apply discount code. Please try again.',
        error: 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setResult(null);
    setShowChecklist(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Gift className="w-6 h-6" />
                <h2 className="text-xl font-bold">Apply Discount Code</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {!result ? (
              // Input Form
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Discount Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g., FIRST50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleApplyCode}
                  disabled={!code.trim() || loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <span>Apply Code</span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Enter your discount code to unlock exclusive rewards
                </p>
              </>
            ) : result.success ? (
              // Success State
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Code Applied Successfully! 🎉
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="font-bold text-green-800 text-lg">{result.code}</p>
                  <p className="text-green-600 text-sm">{result.description}</p>
                  <p className="text-green-700 font-medium mt-2">
                    {result.discountType === 'percentage' ? `${result.discountValue}% OFF` : `$${result.discountValue} OFF`}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Your discount code has been saved to your account
                </p>
              </motion.div>
            ) : (
              // Error State
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    {result.error}
                  </h3>
                  <p className="text-red-600 text-sm mb-4">
                    {result.message}
                  </p>
                </div>

                {/* Show incomplete steps if available */}
                {result.incompleteSteps && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">Complete these steps first:</h4>
                    <ul className="space-y-1">
                      {result.incompleteSteps.map((step, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                  {showChecklist && (
                    <button
                      onClick={() => {
                        onClose();
                        // Show the floating checklist
                        window.dispatchEvent(new CustomEvent('showCreatorChecklist'));
                      }}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      View Checklist
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscountCodeModal;
