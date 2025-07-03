import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentIcon, PhotoIcon, DocumentDuplicateIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const FileUpload = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please upload supported document, spreadsheet, presentation, or image files only.')
      return
    }

    // Limit to 2 files maximum
    if (acceptedFiles.length > 2) {
      toast.error('Please select a maximum of 2 files for comparison')
      return
    }

    // Update selected files
    setSelectedFiles(acceptedFiles)
    onFilesSelected(acceptedFiles)
    
    // Show appropriate success message
    if (acceptedFiles.length === 2) {
      toast.success('2 files selected for comparison!')
    } else {
      toast.success(`${acceptedFiles.length} file selected!`)
    }
  }, [onFilesSelected])

  const removeFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove)
    setSelectedFiles(updatedFiles)
    onFilesSelected(updatedFiles)
    toast.success('File removed')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    accept: {
      // Image formats
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.webp'],
      // Document formats
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      // Spreadsheet formats
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      // Presentation formats
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      // OpenDocument formats
      'application/vnd.oasis.opendocument.text': ['.odt'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
      'application/vnd.oasis.opendocument.presentation': ['.odp'],
      // Web formats
      'text/html': ['.html', '.htm'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml']
    },
    multiple: true,
    maxFiles: 2,
    maxSize: 16 * 1024 * 1024, // 16MB
    noClick: false,
    noKeyboard: false,
    disabled: false,
    preventDropOnDocument: true,
    // Mobile-specific optimizations
    onFileDialogOpen: () => {
      // Mobile-specific feedback
      if (window.innerWidth <= 768) {
        toast.loading('Opening file picker...', { duration: 1000 })
      }
    },
    onFileDialogCancel: () => {
      if (window.innerWidth <= 768) {
        toast.dismiss()
      }
    }
  })

  const containerVariants = {
    idle: {
      scale: 1,
      transition: { duration: 0.3 }
    },
    dragOver: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    filled: {
      scale: 1,
      transition: { duration: 0.3 }
    }
  }

  const iconVariants = {
    idle: { y: 0, rotate: 0, scale: 1 },
    hover: { y: -5, rotate: 5, scale: 1.1 },
    drag: { y: -10, rotate: 10, scale: 1.2 }
  }

  const fileVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'].includes(ext)) {
      return PhotoIcon
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
      return DocumentIcon
    } else {
      return DocumentDuplicateIcon
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const currentVariant = isDragActive || isDragOver ? 'dragOver' : selectedFiles.length > 0 ? 'filled' : 'idle'

  return (
    <div className="w-full">
      <motion.div
        {...getRootProps()}
        variants={containerVariants}
        animate={currentVariant}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-all duration-300 ease-in-out min-h-[160px] sm:min-h-[200px] lg:min-h-[240px] backdrop-blur-sm overflow-hidden touch-manipulation ${
          isDragActive || isDragOver 
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-900/20' 
            : selectedFiles.length > 0 
              ? 'border-green-400 dark:border-green-500 bg-green-50/80 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50/90 dark:hover:bg-gray-700/90'
        }`}
      >
        <input {...getInputProps()} />
        
        {/* Background decorative elements */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isDragActive || isDragOver
            ? 'bg-gradient-to-br from-blue-100/40 to-indigo-100/40 dark:from-blue-800/20 dark:to-indigo-800/20'
            : selectedFiles.length > 0
              ? 'bg-gradient-to-br from-green-100/40 to-emerald-100/40 dark:from-green-800/20 dark:to-emerald-800/20'
              : 'bg-gradient-to-br from-gray-50/40 to-slate-50/40 dark:from-gray-700/20 dark:to-slate-700/20'
        }`} />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-gray-600/10 rounded-2xl" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="relative z-10 space-y-3 sm:space-y-4 lg:space-y-6"
        >
          {/* Enhanced Icons */}
          <motion.div 
            className="flex justify-center space-x-2 sm:space-x-3 lg:space-x-4"
            variants={iconVariants}
            animate={isDragActive ? 'drag' : 'idle'}
            whileHover="hover"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: selectedFiles.length > 0 ? 1.1 : 1
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <DocumentIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-500 dark:text-blue-400" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: selectedFiles.length > 0 ? 1.1 : 1
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <PhotoIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, 3, -3, 0],
                scale: selectedFiles.length > 0 ? 1.1 : 1
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <DocumentDuplicateIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-500 dark:text-green-400" />
            </motion.div>
          </motion.div>

          {/* Upload Cloud Icon */}
          <motion.div
            animate={{
              y: isDragActive ? -10 : [0, -5, 0],
              scale: isDragActive ? 1.1 : 1
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.2 }
            }}
            className="flex justify-center"
          >
            <CloudArrowUpIcon className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 transition-colors duration-300 ${
              isDragActive ? 'text-blue-600 dark:text-blue-400' : 
              selectedFiles.length > 0 ? 'text-green-600 dark:text-green-400' : 
              'text-gray-400 dark:text-gray-500'
            }`} />
          </motion.div>

          {/* Enhanced Text */}
          <div className="space-y-2 sm:space-y-3">
            <motion.h3 
              className={`text-base sm:text-lg lg:text-xl font-semibold transition-colors duration-300 ${
                isDragActive ? 'text-blue-700 dark:text-blue-300' : 
                selectedFiles.length > 0 ? 'text-green-700 dark:text-green-300' : 
                'text-gray-700 dark:text-gray-300'
              }`}
              animate={{
                scale: isDragActive ? 1.05 : 1
              }}
            >
              {isDragActive 
                ? 'Drop files here!' 
                : selectedFiles.length > 0 
                  ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                  : 'Upload Documents'
              }
            </motion.h3>
            
            <motion.p 
              className={`text-xs sm:text-sm lg:text-base transition-colors duration-300 ${
                isDragActive ? 'text-blue-600 dark:text-blue-400' : 
                selectedFiles.length > 0 ? 'text-green-600 dark:text-green-400' : 
                'text-gray-500 dark:text-gray-400'
              }`}
              animate={{
                opacity: isDragActive ? 0.8 : 1
              }}
            >
              {selectedFiles.length > 0 
                ? 'Click to change files or add another for comparison'
                : 'Drag & drop files here, or click to browse'
              }
            </motion.p>

            {/* File format indicators for mobile */}
            <div className="block sm:hidden">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PDF, Word, Images, Excel & more
              </p>
            </div>

            {/* File format indicators for desktop */}
            <div className="hidden sm:block">
              <motion.div 
                className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2 sm:mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: selectedFiles.length > 0 ? 0.7 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {['PDF', 'DOC', 'XLS', 'JPG', 'PNG', 'TXT'].map((format, index) => (
                  <motion.span
                    key={format}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors duration-300 ${
                      isDragActive ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 text-blue-700 dark:text-blue-300' :
                      selectedFiles.length > 0 ? 'bg-green-100 dark:bg-green-900/30 border-green-300 text-green-700 dark:text-green-300' :
                      'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {format}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Size limit indicator */}
          <motion.p 
            className="text-xs text-gray-400 dark:text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Max file size: 16MB each • Max 2 files
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Selected Files Display */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2 sm:space-y-3"
          >
            <h4 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
              Selected Files:
            </h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => {
                const IconComponent = getFileIcon(file.name)
                return (
                  <motion.div
                    key={`${file.name}-${index}`}
                    variants={fileVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex-shrink-0"
                      >
                        <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 dark:text-blue-400" />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Success indicator */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                      </motion.div>
                      
                      {/* Remove button */}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="p-1 sm:p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors touch-manipulation"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Mobile help text */}
            <div className="block sm:hidden">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Tap the upload area above to add more files (max 2)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile optimized helper text */}
      <motion.div 
        className="block sm:hidden mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supports PDF, Word, Excel, PowerPoint, Images & more
        </p>
      </motion.div>
    </div>
  )
}

export default FileUpload 