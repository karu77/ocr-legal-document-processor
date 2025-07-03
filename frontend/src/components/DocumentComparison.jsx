import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ScaleIcon, 
  DocumentTextIcon, 
  EyeIcon,
  ChartBarIcon,
  ClipboardIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  LightBulbIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const DocumentComparison = ({ comparison, onNewComparison }) => {
  const [viewMode, setViewMode] = useState('unified') // 'unified' or 'split'
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [highlightMode, setHighlightMode] = useState('both') // 'both', 'additions', 'deletions'
  const [copiedStates, setCopiedStates] = useState({})
  const [showInstructions, setShowInstructions] = useState(!comparison)

  // Simple diff algorithm for visualization
  const createDiff = useMemo(() => {
    if (!comparison?.text1 || !comparison?.text2) return { unified: [], split: { left: [], right: [] } }
    
    const text1Lines = comparison.text1.split('\n')
    const text2Lines = comparison.text2.split('\n')
    
    // Simple line-by-line comparison
    const maxLines = Math.max(text1Lines.length, text2Lines.length)
    const unified = []
    const split = { left: [], right: [] }
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = text1Lines[i] || ''
      const line2 = text2Lines[i] || ''
      
      if (line1 === line2) {
        unified.push({ type: 'equal', content: line1, lineNumber: i + 1 })
        split.left.push({ type: 'equal', content: line1, lineNumber: i + 1 })
        split.right.push({ type: 'equal', content: line2, lineNumber: i + 1 })
      } else {
        if (line1 && !line2) {
          unified.push({ type: 'deleted', content: line1, lineNumber: i + 1 })
          split.left.push({ type: 'deleted', content: line1, lineNumber: i + 1 })
          split.right.push({ type: 'empty', content: '', lineNumber: i + 1 })
        } else if (!line1 && line2) {
          unified.push({ type: 'added', content: line2, lineNumber: i + 1 })
          split.left.push({ type: 'empty', content: '', lineNumber: i + 1 })
          split.right.push({ type: 'added', content: line2, lineNumber: i + 1 })
        } else {
          unified.push({ type: 'deleted', content: line1, lineNumber: i + 1 })
          unified.push({ type: 'added', content: line2, lineNumber: i + 1 })
          split.left.push({ type: 'deleted', content: line1, lineNumber: i + 1 })
          split.right.push({ type: 'added', content: line2, lineNumber: i + 1 })
        }
      }
    }
    
    return { unified, split }
  }, [comparison])

  const filteredDiff = useMemo(() => {
    if (!showOnlyDifferences) return createDiff
    
    return {
      unified: createDiff.unified.filter(line => line.type !== 'equal'),
      split: {
        left: createDiff.split.left.filter(line => line.type !== 'equal'),
        right: createDiff.split.right.filter(line => line.type !== 'equal')
      }
    }
  }, [createDiff, showOnlyDifferences])

  const stats = useMemo(() => {
    if (!createDiff) return { total: 0, added: 0, deleted: 0, unchanged: 0 }
    
    const added = createDiff.unified.filter(line => line.type === 'added').length
    const deleted = createDiff.unified.filter(line => line.type === 'deleted').length
    const unchanged = createDiff.unified.filter(line => line.type === 'equal').length
    
    return { total: added + deleted + unchanged, added, deleted, unchanged }
  }, [createDiff])

  const copyToClipboard = async (content, type) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedStates(prev => ({ ...prev, [type]: true }))
      toast.success('Copied to clipboard!')
      
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getLineStyle = (type) => {
    const baseStyle = 'px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-mono leading-relaxed border-l-4 transition-all duration-200'
    
    switch (type) {
      case 'added':
        return `${baseStyle} bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400 text-green-800 dark:text-green-200`
      case 'deleted':
        return `${baseStyle} bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-red-400 text-red-800 dark:text-red-200`
      case 'equal':
        return `${baseStyle} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300`
      case 'empty':
        return `${baseStyle} bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500`
      default:
        return baseStyle
    }
  }

  const shouldShowLine = (type) => {
    if (highlightMode === 'both') return true
    if (highlightMode === 'additions') return type === 'added' || type === 'equal'
    if (highlightMode === 'deletions') return type === 'deleted' || type === 'equal'
    return true
  }

  // Instructions component
  const InstructionsPanel = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-200 dark:border-blue-700"
    >
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
          <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">How to Compare Documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload two documents to see their differences side by side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm sm:text-base">
            <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Step 1: Upload Two Files
          </h4>
          <div className="pl-6 sm:pl-7 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <p>• Upload any two documents you want to compare</p>
            <p>• Supports: PDF, DOCX, TXT, HTML, CSV, and images</p>
            <p>• Both files will be processed with OCR if needed</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center text-sm sm:text-base">
            <ArrowsRightLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
            Step 2: View Comparison
          </h4>
          <div className="pl-6 sm:pl-7 space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <p>• See similarity percentage at a glance</p>
            <p>• Toggle between unified and split view</p>
            <p>• Filter to see only differences</p>
            <p>• Copy results to clipboard</p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            <p className="font-medium mb-1">Pro Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">Unified View</span> to see changes inline</li>
              <li>• Use <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">Split View</span> to see documents side by side</li>
              <li>• Toggle <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">Differences Only</span> to focus on changes</li>
              <li>• Green highlights show additions, red shows deletions</li>
            </ul>
          </div>
        </div>
      </div>

      {onNewComparison && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <motion.button
            onClick={() => {
              onNewComparison()
              setShowInstructions(false)
            }}
            className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Start New Comparison</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  )

  if (showInstructions || !comparison) {
    return <InstructionsPanel />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
    >
      {/* Header with enhanced responsiveness */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <ScaleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Document Comparison
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Analyzing differences between documents
            </p>
          </div>
        </div>

        {/* Copy button */}
        <motion.button
          onClick={() => copyToClipboard(comparison?.summary || '', 'summary')}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors touch-manipulation text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copiedStates.summary ? 
            <CheckCircleIcon className="w-4 h-4 text-green-500" /> : 
            <ClipboardIcon className="w-4 h-4" />
          }
          <span className="hidden sm:inline">Copy Summary</span>
          <span className="sm:hidden">Copy</span>
        </motion.button>
      </div>

      {/* File info cards with mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <motion.div 
          className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base truncate">
                {comparison?.file1?.name || 'Document 1'}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {comparison?.file1?.detectedLanguage && `Language: ${comparison.file1.detectedLanguage}`}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-green-900 dark:text-green-200 text-sm sm:text-base truncate">
                {comparison?.file2?.name || 'Document 2'}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {comparison?.file2?.detectedLanguage && `Language: ${comparison.file2.detectedLanguage}`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Statistics with mobile-friendly layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <motion.div 
          className="text-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {comparison?.similarity_percentage}%
          </div>
          <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">Similarity</div>
        </motion.div>

        <motion.div 
          className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.added}
          </div>
          <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">Added</div>
        </motion.div>

        <motion.div 
          className="text-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-700"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.deleted}
          </div>
          <div className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">Deleted</div>
        </motion.div>

        <motion.div 
          className="text-center p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/20 dark:to-slate-700/20 rounded-xl border border-gray-200 dark:border-gray-600"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
            {stats.unchanged}
          </div>
          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">Unchanged</div>
        </motion.div>
      </div>

      {/* Enhanced Controls for mobile */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        {/* View mode toggle - mobile friendly */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">View Options</h3>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* View mode buttons */}
            <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              <motion.button
                onClick={() => setViewMode('unified')}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  viewMode === 'unified'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <DevicePhoneMobileIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Unified</span>
              </motion.button>
              
              <motion.button
                onClick={() => setViewMode('split')}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <ComputerDesktopIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Split View</span>
                <span className="sm:hidden">Split</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <motion.button
            onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all touch-manipulation text-xs sm:text-sm ${
              showOnlyDifferences
                ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MagnifyingGlassIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Differences Only</span>
            <span className="sm:hidden">Diff Only</span>
          </motion.button>

          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            {[
              { id: 'both', label: 'Both', icon: EyeIcon },
              { id: 'additions', label: 'Added', icon: ChartBarIcon },
              { id: 'deletions', label: 'Deleted', icon: AdjustmentsHorizontalIcon }
            ].map((mode) => (
              <motion.button
                key={mode.id}
                onClick={() => setHighlightMode(mode.id)}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all touch-manipulation ${
                  highlightMode === mode.id
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <mode.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{mode.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {viewMode === 'unified' ? 'Unified Diff View' : 'Split View Comparison'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredDiff[viewMode === 'unified' ? 'unified' : 'split'].left?.length || filteredDiff.unified?.length || 0} lines
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-auto">
          {viewMode === 'unified' ? (
            <div className="space-y-0.5">
              {filteredDiff.unified.map((line, index) => 
                shouldShowLine(line.type) && (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={getLineStyle(line.type)}
                  >
                    <div className="flex">
                      <span className="w-8 sm:w-12 text-gray-400 dark:text-gray-500 text-xs mr-2 sm:mr-4 flex-shrink-0">
                        {line.lineNumber}
                      </span>
                      <span className="flex-1 break-all">{line.content || ' '}</span>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px">
              {/* Left side */}
              <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700">
                  <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 truncate">
                    {comparison?.file1?.name || 'Document 1'}
                  </h4>
                </div>
                <div className="space-y-0.5">
                  {filteredDiff.split.left.map((line, index) => 
                    shouldShowLine(line.type) && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={getLineStyle(line.type)}
                      >
                        <div className="flex">
                          <span className="w-6 sm:w-8 text-gray-400 dark:text-gray-500 text-xs mr-2 sm:mr-3 flex-shrink-0">
                            {line.lineNumber}
                          </span>
                          <span className="flex-1 break-all">{line.content || ' '}</span>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>

              {/* Right side */}
              <div>
                <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-700">
                  <h4 className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-200 truncate">
                    {comparison?.file2?.name || 'Document 2'}
                  </h4>
                </div>
                <div className="space-y-0.5">
                  {filteredDiff.split.right.map((line, index) => 
                    shouldShowLine(line.type) && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={getLineStyle(line.type)}
                      >
                        <div className="flex">
                          <span className="w-6 sm:w-8 text-gray-400 dark:text-gray-500 text-xs mr-2 sm:mr-3 flex-shrink-0">
                            {line.lineNumber}
                          </span>
                          <span className="flex-1 break-all">{line.content || ' '}</span>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {comparison?.summary && (
        <motion.div 
          className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-purple-900 dark:text-purple-200 mb-2 sm:mb-3">
            AI Summary
          </h3>
          <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
            {comparison.summary}
          </p>
        </motion.div>
      )}

      {/* Mobile-friendly action buttons */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <motion.button
          onClick={() => copyToClipboard(JSON.stringify(filteredDiff, null, 2), 'diff')}
          className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors touch-manipulation text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copiedStates.diff ? <CheckCircleIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
          <span>Copy Comparison Data</span>
        </motion.button>

        {onNewComparison && (
          <motion.button
            onClick={onNewComparison}
            className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>New Comparison</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default DocumentComparison 