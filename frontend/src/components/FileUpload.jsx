import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { DocumentIcon, PhotoIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const FileUpload = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState([])

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

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center space-x-4">
            <DocumentIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
          </div>
          
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? (
              "Drop your documents here..."
            ) : (
              selectedFiles.length === 0 
                ? "Upload your documents (max 2 files)"
                : selectedFiles.length === 1
                  ? "Add one more document for comparison"
                  : "Documents ready for comparison"
            )}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag & drop files here or click to select
          </p>
          
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, ODS, ODP, TXT, RTF, CSV, HTML, XML, PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP (Max 16MB each)
          </p>
          
          {selectedFiles.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected files:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <DocumentIcon className="h-4 w-4" />
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default FileUpload 