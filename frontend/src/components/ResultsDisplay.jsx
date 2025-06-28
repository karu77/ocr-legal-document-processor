import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DocumentTextIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
  EyeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const ResultsDisplay = ({ results }) => {
  const [activeTab, setActiveTab] = useState('ocr')
  const [copiedStates, setCopiedStates] = useState({})

  const tabs = [
    {
      id: 'ocr',
      name: 'Extracted Text',
      icon: DocumentTextIcon,
      content: results.ocrText,
      color: 'from-blue-500 to-indigo-500',
      description: 'Raw OCR extracted text from documents'
    },
    {
      id: 'cleaned',
      name: 'Cleaned Text',
      icon: SparklesIcon,
      content: results.cleanedText,
      color: 'from-green-500 to-teal-500',
      description: 'Text cleaned of OCR artifacts and formatting issues'
    },
    {
      id: 'translated',
      name: 'Translation',
      icon: GlobeAltIcon,
      content: results.translatedText,
      color: 'from-purple-500 to-pink-500',
      description: 'AI-powered translation to target language'
    },
    {
      id: 'summary',
      name: 'Summary',
      icon: ClipboardDocumentListIcon,
      content: results.summary,
      color: 'from-orange-500 to-red-500',
      description: 'AI-generated document summary'
    },
    {
      id: 'bullets',
      name: 'Key Points',
      icon: ListBulletIcon,
      content: results.bulletPoints,
      color: 'from-cyan-500 to-blue-500',
      description: 'Key points extracted as bullet list'
    }
  ]

  const availableTabs = tabs.filter(tab => tab.content)

  const copyToClipboard = async (content, tabId) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedStates(prev => ({ ...prev, [tabId]: true }))
      toast.success('Copied to clipboard!')
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [tabId]: false }))
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadAsFile = (content, filename, tabName) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename || 'document'}_${tabName.toLowerCase().replace(' ', '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${tabName}!`)
  }

  if (availableTabs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700"
      >
        <EyeIcon className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No Results Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload documents and start processing to see results here.
        </p>
      </motion.div>
    )
  }

  // Set active tab to the first available tab if current active tab has no content
  const currentActiveTab = availableTabs.find(tab => tab.id === activeTab) || availableTabs[0]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {availableTabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = currentActiveTab.id === tab.id
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-3 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-300 ${ 
                  isActive
                    ? 'text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 shadow-t-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.color} rounded-t-lg`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActiveTab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${currentActiveTab.color} flex items-center justify-center shadow-lg`}>
                  <currentActiveTab.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {currentActiveTab.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentActiveTab.description}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="flex items-center space-x-2"
              >
                <motion.button
                  onClick={() => copyToClipboard(currentActiveTab.content, currentActiveTab.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copiedStates[currentActiveTab.id] ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5" />
                  )}
                  <span>{copiedStates[currentActiveTab.id] ? 'Copied!' : 'Copy'}</span>
                </motion.button>

                <motion.button
                  onClick={() => downloadAsFile(currentActiveTab.content, results.filename, currentActiveTab.name)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-200 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-md"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>Download</span>
                </motion.button>
              </motion.div>
            </motion.div>
            
            {/* Textarea for Content */}
            <motion.textarea
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2, duration: 0.4 }}
              value={currentActiveTab.content}
              readOnly
              rows={15} // Adjust rows as needed, or use a dynamic height solution
              className="w-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[150px] text-gray-800 dark:text-gray-200 transition-colors duration-300"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ResultsDisplay 