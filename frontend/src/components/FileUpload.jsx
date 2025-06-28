import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentTextIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const FileUpload = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please upload PDF, PNG, JPG, JPEG, GIF, BMP, or TIFF files only.')
      return
    }
    
    if (acceptedFiles.length > 2) {
      toast.error('Please upload maximum 2 files at a time.')
      return
    }
    
    onFileUpload(acceptedFiles)
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 2,
    maxSize: 16 * 1024 * 1024 // 16MB
  })

  return (
    <motion.div
      {...getRootProps()}
      className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive || dragActive
          ? 'border-blue-400 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-900/50 shadow-lg' 
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      whileHover={{ scale: 1.005, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.995 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input {...getInputProps()} />
      
      {/* Background Pattern (simplified for minimalistic look) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Icon */}
        <motion.div 
          className="mx-auto flex items-center justify-center"
          animate={isDragActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${ 
            isDragActive 
              ? 'bg-blue-600 shadow-lg dark:bg-blue-700' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <motion.div
              animate={isDragActive ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
            >
              {isDragActive ? (
                <CloudArrowUpIcon className="w-8 h-8 text-white" />
              ) : (
                <DocumentTextIcon className="w-8 h-8 text-blue-500 dark:text-blue-300" />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="space-y-3">
          <motion.h3 
            className={`text-xl font-semibold transition-colors duration-300 ${
              isDragActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
            }`}
            animate={isDragActive ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {isDragActive ? 'Drop the files here!' : 'Upload your documents'}
          </motion.h3>
          
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Drag & drop or click to select files
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
              Max 2 files
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
              16MB each
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600">
              PDF, JPG, PNG
            </span>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { name: 'PDF', icon: '📄', color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' },
            { name: 'Images', icon: '🖼️', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
            { name: 'Scans', icon: '📸', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' }
          ].map((format, index) => (
            <motion.div
              key={format.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className={`flex flex-col items-center p-3 rounded-xl ${format.color} border border-gray-200 dark:border-gray-600`}
            >
              <span className="text-lg mb-1">{format.icon}</span>
              <span className="text-xs font-medium">{format.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Upload Progress Indicator */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-blue-500/5 backdrop-blur-sm rounded-2xl border border-blue-300 dark:border-blue-600"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-12 h-12 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center shadow-lg dark:bg-blue-600"
                >
                  <CloudArrowUpIcon className="w-6 h-6 text-white" />
                </motion.div>
                <p className="text-blue-700 font-semibold text-lg dark:text-blue-300">Release to upload</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default FileUpload 