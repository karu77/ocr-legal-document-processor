import React from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  GlobeAltIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

// Animation variants for the grid of buttons
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      ease: "easeOut",
      duration: 0.4
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
  results = {}
}) => {
  
  // Check if OCR text exists for hasText
  const hasText = !!results.ocrText

  // Check if two files are uploaded for comparison
  const canCompare = results.comparison !== null || (Array.isArray(results.files) && results.files.length >= 2)

  const buttonVariants = {
    rest: { scale: 1, y: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    hover: { 
      scale: 1.02, 
      y: -2, 
      boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98, y: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }
  }

  const iconVariants = {
    rest: { rotate: 0 },
    hover: { rotate: 5 },
    processing: { rotate: 360 }
  }

  const ActionButton = ({ 
    onClick, 
    disabled, 
    icon: Icon, 
    title, 
    description, 
    gradient, 
    processing = false,
    completed = false 
  }) => (
    <motion.button
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled ? "hover" : "rest"}
      whileTap={!disabled ? "tap" : "rest"}
      onClick={onClick}
      disabled={disabled || loading}
      className={`group relative w-full p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden text-left ${ 
        disabled 
          ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed text-gray-400 dark:text-gray-600 shadow-sm' 
          : completed
          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 dark:from-green-900 dark:to-emerald-900 dark:text-green-300 shadow-md'
          : `border-transparent bg-gradient-to-r ${gradient} text-white shadow-lg hover:shadow-xl`
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      </div>

      <div className="relative flex items-center space-x-4 z-10">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${ 
          disabled 
            ? 'bg-gray-100 dark:bg-gray-700' 
            : completed
            ? 'bg-green-100 dark:bg-green-800'
            : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
        }`}>
          <motion.div
            variants={iconVariants}
            animate={processing ? "processing" : "rest"}
            transition={{ duration: processing ? 2 : 0.3, repeat: processing ? Infinity : 0, ease: "linear" }}
          >
            {completed ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
            ) : processing ? (
              <ClockIcon className="w-6 h-6 text-white dark:text-gray-300" />
            ) : (
              <Icon className={`w-6 h-6 ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-white'}`} />
            )}
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className={`font-semibold text-lg transition-colors duration-300 ${
            disabled 
              ? 'text-gray-400 dark:text-gray-600' 
              : completed
              ? 'text-green-700 dark:text-green-300'
              : 'text-white'
          }`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 transition-colors duration-300 ${
            disabled 
              ? 'text-gray-400 dark:text-gray-600' 
              : completed
              ? 'text-green-600 dark:text-green-400'
              : 'text-white/80'
          }`}>
            {processing ? 'Processing...' : completed ? 'Completed!' : description}
          </p>
        </div>

        {/* Status Indicator (only for processing state, not completed) */}
        <div className="flex-shrink-0">
          {processing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
            />
          )}
        </div>
      </div>
    </motion.button>
  )

  const buttons = [
    {
      onClick: onOCR,
      disabled: !hasFiles,
      icon: DocumentTextIcon,
      title: 'Extract Text (OCR)',
      description: 'Extract text from uploaded documents',
      gradient: 'from-blue-500 to-indigo-600',
      processing: loading && results.ocrText === '' && currentOperation === 'OCR Processing',
      completed: results.ocrText !== '' && !loading
    },
    {
      onClick: onCleanup,
      disabled: !hasText,
      icon: SparklesIcon,
      title: 'Clean Text',
      description: 'Remove OCR artifacts and improve readability',
      gradient: 'from-green-500 to-teal-600',
      processing: loading && currentOperation === 'Text Cleanup',
      completed: results.cleanedText !== '' && !loading
    },
    {
      onClick: onTranslate,
      disabled: !hasText,
      icon: GlobeAltIcon,
      title: 'Translate',
      description: 'Translate to selected target language',
      gradient: 'from-purple-500 to-pink-600',
      processing: loading && (currentOperation || '').startsWith('Translation'),
      completed: results.translatedText !== '' && !loading
    },
    {
      onClick: onSummarize,
      disabled: !hasText,
      icon: ClipboardDocumentListIcon,
      title: 'Summarize',
      description: 'Generate AI-powered document summary',
      gradient: 'from-orange-500 to-red-600',
      processing: loading && currentOperation === 'Document Summarization',
      completed: results.summary !== '' && !loading
    },
    {
      onClick: onBulletPoints,
      disabled: !hasText,
      icon: ListBulletIcon,
      title: 'Key Points',
      description: 'Extract key points and bullet list',
      gradient: 'from-cyan-500 to-blue-600',
      processing: loading && currentOperation === 'Bullet Point Generation',
      completed: results.bulletPoints !== '' && !loading
    },
    {
      onClick: onCompare,
      disabled: !canCompare,
      icon: ScaleIcon,
      title: 'Compare Documents',
      description: 'Compare two uploaded documents for differences',
      gradient: 'from-gray-500 to-gray-700',
      processing: loading && currentOperation === 'Document Comparison',
      completed: results.comparison !== null && !loading
    },
  ]

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {buttons.map((button, index) => (
        <motion.div key={index} variants={itemVariants}>
          <ActionButton {...button} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ActionButtons 