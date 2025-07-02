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
  LightBulbIcon
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
    const baseStyle = 'px-4 py-2 text-sm font-mono leading-relaxed border-l-4 transition-all duration-200'
    
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
      className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <LightBulbIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How to Compare Documents</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload two documents to see their differences side by side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-blue-600" />
            Step 1: Upload Two Files
          </h4>
          <div className="pl-7 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>• Upload any two documents you want to compare</p>
            <p>• Supports: PDF, DOCX, TXT, HTML, CSV, and images</p>
            <p>• Both files will be processed with OCR if needed</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2 text-green-600" />
            Step 2: View Comparison
          </h4>
          <div className="pl-7 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>• See similarity percentage at a glance</p>
            <p>• Toggle between unified and split view</p>
            <p>• Filter to see only differences</p>
            <p>• Copy results to clipboard</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
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
        <div className="mt-6 flex justify-center">
          <motion.button
            onClick={() => {
              onNewComparison()
              setShowInstructions(false)
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
            <span>Start New Comparison</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  )

  if (!comparison && showInstructions) {
    return <InstructionsPanel />
  }

  if (!comparison) {
    return null
  }

  const similarity = comparison.similarity_percentage || 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-8 h-full flex flex-col relative card-glow"
    >
      <AnimatePresence mode="wait">
        {showInstructions && (
          <InstructionsPanel />
        )}

        {!showInstructions && comparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <ScaleIcon className="h-8 w-8 mr-3 text-indigo-500" /> Document Comparison
              </h2>
              <motion.button
                onClick={() => setShowInstructions(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <InformationCircleIcon className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Comparison Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600 shadow-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-gray-500 dark:text-gray-300">Total Lines</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </motion.div>
              <motion.div 
                className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-700 shadow-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-sm text-green-700 dark:text-green-300">Added</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.added}</p>
              </motion.div>
              <motion.div 
                className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-700 shadow-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-sm text-red-700 dark:text-red-300">Deleted</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{stats.deleted}</p>
              </motion.div>
              <motion.div 
                className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-700 shadow-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-sm text-blue-700 dark:text-blue-300">Unchanged</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.unchanged}</p>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  <motion.button
                    onClick={() => setViewMode('unified')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      viewMode === 'unified' 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Unified
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('split')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      viewMode === 'split' 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Split
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  <motion.button
                    onClick={() => setShowOnlyDifferences(false)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      !showOnlyDifferences 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    All Lines
                  </motion.button>
                  <motion.button
                    onClick={() => setShowOnlyDifferences(true)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      showOnlyDifferences 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Differences
                  </motion.button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Highlight:</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  <motion.button
                    onClick={() => setHighlightMode('both')}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      highlightMode === 'both' 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Both
                  </motion.button>
                  <motion.button
                    onClick={() => setHighlightMode('additions')}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      highlightMode === 'additions' 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Additions
                  </motion.button>
                  <motion.button
                    onClick={() => setHighlightMode('deletions')}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      highlightMode === 'deletions' 
                        ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    Deletions
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Comparison Display */}
            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner flex mb-6">
              {viewMode === 'unified' ? (
                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-xl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 relative">
                  <pre className="p-4 text-xs leading-relaxed">
                    {filteredDiff.unified.map((line, index) => shouldShowLine(line.type) && (
                      <div key={index} className={getLineStyle(line.type)}>
                        <span className="inline-block w-8 text-right pr-2 text-gray-400 dark:text-gray-600 select-none">
                          {line.lineNumber}
                        </span>
                        <span>{line.content}</span>
                      </div>
                    ))}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-tl-xl rounded-bl-xl border-r border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 relative">
                    <pre className="p-4 text-xs leading-relaxed">
                      {filteredDiff.split.left.map((line, index) => shouldShowLine(line.type) && (
                        <div key={index} className={getLineStyle(line.type)}>
                          <span className="inline-block w-8 text-right pr-2 text-gray-400 dark:text-gray-600 select-none">
                            {line.lineNumber}
                          </span>
                          <span>{line.content}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                  <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-tr-xl rounded-br-xl scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 relative">
                    <pre className="p-4 text-xs leading-relaxed">
                      {filteredDiff.split.right.map((line, index) => shouldShowLine(line.type) && (
                        <div key={index} className={getLineStyle(line.type)}>
                          <span className="inline-block w-8 text-right pr-2 text-gray-400 dark:text-gray-600 select-none">
                            {line.lineNumber}
                          </span>
                          <span>{line.content}</span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Export and New Comparison Buttons */}
            <div className="flex justify-end space-x-4">
              <motion.button
                onClick={() => copyToClipboard(comparison.text1, 'text1')}
                className={`flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors ${copiedStates.text1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={copiedStates.text1}
              >
                <ClipboardIcon className="w-5 h-5" />
                <span>{copiedStates.text1 ? 'Copied!' : 'Copy Document 1'}</span>
              </motion.button>
              <motion.button
                onClick={() => copyToClipboard(comparison.text2, 'text2')}
                className={`flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors ${copiedStates.text2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={copiedStates.text2}
              >
                <ClipboardIcon className="w-5 h-5" />
                <span>{copiedStates.text2 ? 'Copied!' : 'Copy Document 2'}</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  onNewComparison()
                  setShowInstructions(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                <span>New Comparison</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default DocumentComparison 