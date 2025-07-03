import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentTextIcon,
  GlobeAltIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

// Enhanced animation variants for the grid of buttons
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6
    }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      ease: [0.25, 0.46, 0.45, 0.94],
      duration: 0.6
    }
  }
}

const pulseVariants = {
  idle: { scale: 1 },
  processing: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const ActionButtons = ({
  onOCR,
  onTranslate,
  onCleanup,
  onSummarize,
  onBulletPoints,
  onCompare,
  loading,
  hasFiles,
  results = {},
  currentOperation = ''
}) => {
  
  // Check if OCR text exists for hasText
  const hasText = !!results.ocrText

  // Check if two files are processed for comparison
  const canCompare = results.comparison !== null || (Array.isArray(results.allProcessedFiles) && results.allProcessedFiles.length >= 2)

  const buttonVariants = {
    rest: { 
      scale: 1, 
      y: 0, 
      rotateX: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.03, 
      y: -3, 
      rotateX: 5,
      boxShadow: '0 15px 25px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.97, 
      y: 0, 
      rotateX: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
      transition: { duration: 0.1 }
    },
    disabled: {
      scale: 1,
      y: 0,
      rotateX: 0,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: { duration: 0.3 }
    }
  }

  const iconVariants = {
    rest: { rotate: 0, scale: 1 },
    hover: { rotate: 5, scale: 1.1 },
    processing: { 
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    completed: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.5 }
    }
  }

  const backgroundVariants = {
    rest: { opacity: 0.1 },
    hover: { opacity: 0.2 },
    processing: { 
      opacity: [0.1, 0.3, 0.1],
      transition: { duration: 2, repeat: Infinity }
    }
  }

  const ActionButton = ({ 
    onClick, 
    disabled, 
    icon: Icon, 
    title, 
    description, 
    gradient, 
    processing = false,
    completed = false,
    priority = 'normal' // 'high', 'normal', 'low'
  }) => {
    const isProcessing = processing && loading
    const currentVariant = disabled ? 'disabled' : 'rest'
    
    return (
      <motion.button
        variants={buttonVariants}
        initial="rest"
        animate={currentVariant}
        whileHover={!disabled ? "hover" : "disabled"}
        whileTap={!disabled ? "tap" : "disabled"}
        onClick={onClick}
        disabled={disabled || loading}
        className={`group relative w-full p-3 sm:p-4 lg:p-5 xl:p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden text-left min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] touch-manipulation ${ 
          disabled 
            ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed text-gray-400 dark:text-gray-600 shadow-sm' 
            : completed
            ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 shadow-md'
            : `border-transparent bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
        }`}
      >
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`}
            variants={backgroundVariants}
            animate={isProcessing ? 'processing' : 'rest'}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          
          {/* Animated decoration lines */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%'],
              opacity: isProcessing ? [0, 1, 0] : 0
            }}
            transition={{
              duration: 2,
              repeat: isProcessing ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative flex items-start space-x-2 sm:space-x-3 lg:space-x-4 z-10 h-full">
          {/* Enhanced Icon Container */}
          <motion.div 
            className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${ 
              disabled 
                ? 'bg-gray-100 dark:bg-gray-700' 
                : completed
                ? 'bg-green-100 dark:bg-green-800'
                : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
            }`}
            variants={pulseVariants}
            animate={isProcessing ? 'processing' : 'idle'}
          >
            <motion.div
              variants={iconVariants}
              animate={
                isProcessing ? "processing" : 
                completed ? "completed" : 
                "rest"
              }
            >
              <Icon 
                className={`${
                  isProcessing ? 'text-white' : 
                  disabled ? 'text-gray-400 dark:text-gray-500' : 
                  completed ? 'text-green-600 dark:text-green-400' : 
                  'text-white'
                } w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6`} 
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 ${
              disabled 
                ? 'text-gray-400 dark:text-gray-600' 
                : completed
                ? 'text-green-700 dark:text-green-300'
                : 'text-white'
            }`}>
              {title}
            </h3>
            <p className={`text-xs sm:text-sm lg:text-base leading-relaxed ${
              disabled 
                ? 'text-gray-400 dark:text-gray-600' 
                : completed
                ? 'text-green-600 dark:text-green-400'
                : 'text-white/90'
            }`}>
              {description}
            </p>
            
            {/* Processing indicator */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 sm:mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-xs sm:text-sm text-white/90">Processing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completion indicator */}
            <AnimatePresence>
              {completed && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-2 sm:mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Completed</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.button>
    )
  }

  const actions = [
    {
      id: 'ocr',
      onClick: onOCR,
      disabled: !hasFiles,
      icon: DocumentTextIcon,
      title: 'Extract Text',
      description: 'Extract text from your documents using advanced OCR technology',
      gradient: 'from-blue-500 to-indigo-600',
      completed: !!results.ocrText,
      processing: currentOperation === 'ocr',
    },
    {
      id: 'cleanup',
      onClick: onCleanup,
      disabled: !hasText,
      icon: SparklesIcon,
      title: 'Clean Text',
      description: 'Remove noise and improve text quality using AI',
      gradient: 'from-purple-500 to-pink-500',
      completed: !!results.cleanedText,
      processing: currentOperation === 'cleanup',
    },
    {
      id: 'translate',
      onClick: onTranslate,
      disabled: !hasText,
      icon: GlobeAltIcon,
      title: 'Translate',
      description: 'Translate extracted text to your target language',
      gradient: 'from-green-500 to-teal-500',
      completed: !!results.translatedText,
      processing: currentOperation === 'translate',
    },
    {
      id: 'summarize',
      onClick: onSummarize,
      disabled: !hasText,
      icon: ClipboardDocumentListIcon,
      title: 'Summarize',
      description: 'Generate an intelligent summary of your document',
      gradient: 'from-yellow-500 to-orange-600',
      completed: !!results.summary,
      processing: currentOperation === 'summarize',
    },
    {
      id: 'bullets',
      onClick: onBulletPoints,
      disabled: !hasText,
      icon: ListBulletIcon,
      title: 'Key Points',
      description: 'Extract important bullet points and highlights',
      gradient: 'from-red-500 to-rose-600',
      completed: !!results.bulletPoints,
      processing: currentOperation === 'bullets',
    },
    {
      id: 'compare',
      onClick: () => onCompare(results.allProcessedFiles?.[0], results.allProcessedFiles?.[1]),
      disabled: !canCompare && (!results.allProcessedFiles || results.allProcessedFiles.length < 2),
      icon: ScaleIcon,
      title: 'Compare Docs',
      description: 'Compare similarities and differences between documents',
      gradient: 'from-indigo-500 to-purple-600',
      completed: !!results.comparison,
      processing: currentOperation === 'compare',
    }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Progress indicator for mobile */}
      <div className="block sm:hidden mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{actions.filter(a => a.completed).length}/{actions.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(actions.filter(a => a.completed).length / actions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Action buttons grid with improved mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            variants={itemVariants}
            custom={index}
          >
            <ActionButton {...action} />
          </motion.div>
        ))}
      </div>

      {/* Status indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <div>
                <p className="text-sm sm:text-base font-medium text-blue-900 dark:text-blue-100">
                  {currentOperation || 'Processing'}
                </p>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  Please wait while we process your request...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick actions for mobile */}
      <div className="block sm:hidden mt-4 space-y-2">
        {!hasFiles && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Upload a document to get started
              </p>
            </div>
          </div>
        )}
        
        {hasFiles && !hasText && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Tap "Extract Text" to begin processing
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ActionButtons 