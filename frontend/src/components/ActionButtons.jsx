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
        className={`group relative w-full p-4 sm:p-5 lg:p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden text-left min-h-[120px] sm:min-h-[140px] ${ 
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

        <div className="relative flex items-start space-x-3 sm:space-x-4 z-10 h-full">
          {/* Enhanced Icon Container */}
          <motion.div 
            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${ 
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
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.div
                    key="completed"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-300" />
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white dark:text-gray-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-white'}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Enhanced Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <motion.h3 
                  className={`font-semibold text-base sm:text-lg transition-colors duration-300 ${
                    disabled 
                      ? 'text-gray-400 dark:text-gray-600' 
                      : completed
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-white'
                  }`}
                  animate={{ 
                    opacity: isProcessing ? [1, 0.7, 1] : 1 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: isProcessing ? Infinity : 0 
                  }}
                >
                  {title}
                </motion.h3>
                <AnimatePresence mode="wait">
                  {disabled && !isProcessing ? (
                    <motion.div
                      key="disabled-message"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 flex items-center space-x-1 justify-center sm:justify-start"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {!hasFiles ? 'Upload files first' : !hasText ? 'Extract text first' : 'Requirements not met'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="status-description"
                      className={`text-xs sm:text-sm mt-1 transition-colors duration-300 leading-relaxed ${
                        disabled // This disabled condition for text color will now only apply to the regular description.
                          ? 'text-gray-400 dark:text-gray-600'
                          : completed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-white/80'
                      }`}
                      animate={{
                        opacity: isProcessing ? 0.8 : 1
                      }}
                    >
                      {isProcessing ? 'Processing...' : completed ? 'Completed!' : description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Priority Indicator */}
              {priority === 'high' && !disabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0 ml-2"
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                </motion.div>
              )}
            </div>

            {/* Progress Bar for Processing */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden"
                  style={{ originX: 0 }}
                >
                  <motion.div
                    className="h-full bg-white/60 rounded-full"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Indicator */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                {completed && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done</span>
                  </motion.div>
                )}
                {isProcessing && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center space-x-1"
                  >
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
                    <span className="text-xs text-white/80 font-medium">Working...</span>
                  </motion.div>
                )}
              </div>

              {/* Spinning indicator for processing state */}
              {isProcessing && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border border-white/30 border-t-white/80 rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </motion.button>
    )
  }

  const buttons = [
    {
      onClick: onOCR,
      disabled: !hasFiles,
      icon: DocumentTextIcon,
      title: 'Extract Text (OCR)',
      description: 'Extract text from uploaded documents using advanced OCR',
      gradient: 'from-blue-500 to-indigo-600',
      processing: loading && results.ocrText === '' && currentOperation === 'OCR Processing',
      completed: results.ocrText !== '' && !loading,
      priority: 'high'
    },
    {
      onClick: onCleanup,
      disabled: !hasText,
      icon: SparklesIcon,
      title: 'Clean Text',
      description: 'Remove OCR artifacts and improve text readability',
      gradient: 'from-green-500 to-teal-600',
      processing: loading && currentOperation === 'Text Cleanup',
      completed: results.cleanedText !== '' && !loading,
      priority: 'normal'
    },
    {
      onClick: onTranslate,
      disabled: !hasText,
      icon: GlobeAltIcon,
      title: 'Translate',
      description: 'Translate text to your selected target language',
      gradient: 'from-purple-500 to-pink-600',
      processing: loading && (currentOperation || '').includes('Translating'),
      completed: results.translatedText !== '' && !loading,
      priority: 'normal'
    },
    {
      onClick: onSummarize,
      disabled: !hasText,
      icon: ClipboardDocumentListIcon,
      title: 'Summarize',
      description: 'Generate AI-powered summary of document content',
      gradient: 'from-orange-500 to-red-600',
      processing: loading && currentOperation === 'Summarizing',
      completed: results.summary !== '' && !loading,
      priority: 'normal'
    },
    {
      onClick: onBulletPoints,
      disabled: !hasText,
      icon: ListBulletIcon,
      title: 'Key Points',
      description: 'Extract key points and important information',
      gradient: 'from-cyan-500 to-blue-600',
      processing: loading && currentOperation === 'Generating Key Points',
      completed: results.bulletPoints !== '' && !loading,
      priority: 'normal'
    },
    {
      onClick: () => onCompare && onCompare(null, null),
      disabled: !canCompare,
      icon: ScaleIcon,
      title: 'Compare Documents',
      description: 'Compare multiple documents side by side',
      gradient: 'from-indigo-500 to-purple-600',
      processing: loading && currentOperation === 'Comparing Documents',
      completed: !!results.comparison && !loading,
      priority: 'low'
    }
  ]

  return (
    <div className="w-full">
      {/* Header with helpful tips */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
      >
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">Quick Start Guide</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Start by uploading your documents, then extract text with OCR. Once you have text, you can clean, translate, summarize, or extract key points.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Action Buttons Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {buttons.map((button, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            custom={index}
          >
            <ActionButton {...button} />
          </motion.div>
        ))}
      </motion.div>

      {/* Processing Status Indicator */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentOperation || 'Processing...'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please wait while we process your request
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ActionButtons 