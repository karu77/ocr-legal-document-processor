import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentIcon, PhotoIcon, DocumentDuplicateIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
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
    maxSize: 16 * 1024 * 1024 // 16MB
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
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ease-in-out min-h-[200px] sm:min-h-[240px] backdrop-blur-sm overflow-hidden ${
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
          className="relative z-10 space-y-4 sm:space-y-6"
        >
          {/* Enhanced Icons */}
          <motion.div 
            className="flex justify-center space-x-3 sm:space-x-4"
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
              <DocumentIcon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 dark:text-blue-400" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: selectedFiles.length > 0 ? 1.1 : 1
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <PhotoIcon className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, 3, -3, 0],
                scale: selectedFiles.length > 0 ? 1.1 : 1
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <DocumentDuplicateIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 dark:text-green-400" />
            </motion.div>
          </motion.div>

          {/* Upload Cloud Icon */}
          <motion.div
            animate={{
              y: isDragActive ? -10 : [0, -5, 0],
              scale: isDragActive ? 1.2 : 1,
            }}
            transition={{
              y: { duration: isDragActive ? 0.2 : 2, repeat: isDragActive ? 0 : Infinity, ease: "easeInOut" },
              scale: { duration: 0.2 }
            }}
            className="flex justify-center"
          >
            <CloudArrowUpIcon className={`h-16 w-16 sm:h-20 sm:w-20 transition-colors duration-300 ${
              isDragActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : selectedFiles.length > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-600'
            }`} />
          </motion.div>
          
          {/* Dynamic Text */}
          <motion.div
            key={selectedFiles.length + (isDragActive ? 'drag' : 'idle')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-blue-600 dark:text-blue-400"
                >
                  Drop your documents here...
                </motion.span>
            ) : (
              selectedFiles.length === 0 
                ? "Upload your documents (max 2 files)"
                : selectedFiles.length === 1
                  ? "Add one more document for comparison"
                  : "Documents ready for comparison"
            )}
          </div>
          </motion.div>
          
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400"
            animate={{ opacity: isDragActive ? 0.5 : 1 }}
          >
            Drag & drop files here or click to select
          </motion.p>
          
          <motion.p 
            className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed px-2"
            animate={{ opacity: isDragActive ? 0.3 : 1 }}
          >
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, ODS, ODP, TXT, RTF, CSV, HTML, XML, PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP (Max 16MB each)
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-b-2xl origin-left"
          />
        )}
      </motion.div>

      {/* Enhanced File List */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div 
            className="mt-4 sm:mt-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected files ({selectedFiles.length}/2):
                </p>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const FileIcon = getFileIcon(file.name)
                  return (
                    <motion.div
                      key={index}
                      variants={fileVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-700/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50 group hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FileIcon className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
              
              {selectedFiles.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Add another file to enable document comparison features
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload 