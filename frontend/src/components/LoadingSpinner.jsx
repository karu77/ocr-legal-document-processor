import React from 'react'
import { motion } from 'framer-motion'
import { 
  CpuChipIcon, 
  GlobeAltIcon, 
  SparklesIcon, 
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ScaleIcon 
} from '@heroicons/react/24/outline'

const LoadingSpinner = ({ message = "Processing...", operation = "" }) => {
  
  const getOperationIcon = (operation) => {
    const iconMap = {
      'OCR Processing': DocumentTextIcon,
      'Translation': GlobeAltIcon,
      'Text Cleanup': SparklesIcon,
      'Document Summarization': ClipboardDocumentListIcon,
      'Bullet Point Generation': ClipboardDocumentListIcon,
      'Document Comparison': ScaleIcon,
    }
    return iconMap[operation] || CpuChipIcon
  }

  const OperationIcon = getOperationIcon(operation)

  const getOperationColor = (operation) => {
    const colorMap = {
      'OCR Processing': 'from-blue-500 to-indigo-500',
      'Translation': 'from-purple-500 to-pink-500',
      'Text Cleanup': 'from-green-500 to-teal-500',
      'Document Summarization': 'from-orange-500 to-red-500',
      'Bullet Point Generation': 'from-cyan-500 to-blue-500',
      'Document Comparison': 'from-gray-500 to-gray-700',
    }
    return colorMap[operation] || 'from-blue-500 to-purple-500'
  }

  const gradientColor = getOperationColor(operation)

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center flex flex-col items-center justify-center"
    >
      <div className="relative mb-6">
        {/* Outer spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-transparent"
          style={{
            background: `conic-gradient(from 0deg, transparent, var(--tw-gradient-from) 20%, transparent)`
          }}
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center shadow-lg`}
        >
          <OperationIcon className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      {/* Message and Operation Details */}
      <div className="text-center space-y-2">
        <motion.h3 
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {message}
        </motion.h3>
        
        {operation && message !== operation && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-md text-gray-600 dark:text-gray-400 font-medium"
          >
            {operation}
          </motion.p>
        )}
        
        <motion.p 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="text-sm text-gray-500 dark:text-gray-500"
        >
          {operation?.includes('Translation') ? 'Translation in progress... Large texts are processed in chunks for better performance.' : 'This may take a few moments...'}
        </motion.p>
      </div>

      {/* Simple pulsating dots progress indicator */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.2
            }}
            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradientColor}`}
          />
        ))}
      </div>

      {/* AI Processing Tag (kept for clarity) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="flex items-center space-x-2 px-3 py-1.5 mt-6 bg-blue-50 dark:bg-blue-900 rounded-full border border-blue-200 dark:border-blue-700"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <CpuChipIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
        </motion.div>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
          AI Processing
        </span>
      </motion.div>

      {/* Background radial gradient animation (more subtle) */}
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 3, 0] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 -z-10 rounded-3xl opacity-30`}
        style={{
          background: `radial-gradient(circle at center, ${gradientColor.split(' ')[0].replace('from-', 'var(--tw-gradient-from)')}, transparent 70%)`
        }}
      />

    </motion.div>
  )
}

export default LoadingSpinner 