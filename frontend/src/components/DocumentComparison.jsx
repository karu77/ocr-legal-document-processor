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
        return `${baseStyle} bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-800`
      case 'deleted':
        return `${baseStyle} bg-gradient-to-r from-red-50 to-rose-50 border-red-400 text-red-800`
      case 'equal':
        return `${baseStyle} bg-white border-gray-200 text-gray-700`
      case 'empty':
        return `${baseStyle} bg-gray-50 border-gray-200 text-gray-400`
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
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <LightBulbIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">How to Compare Documents</h3>
          <p className="text-sm text-gray-600">Upload two documents to see their differences side by side</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <DocumentDuplicateIcon className="w-5 h-5 mr-2 text-blue-600" />
            Step 1: Upload Two Files
          </h4>
          <div className="pl-7 space-y-2 text-sm text-gray-700">
            <p>• Upload any two documents you want to compare</p>
            <p>• Supports: PDF, DOCX, TXT, HTML, CSV, and images</p>
            <p>• Both files will be processed with OCR if needed</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2 text-green-600" />
            Step 2: View Comparison
          </h4>
          <div className="pl-7 space-y-2 text-sm text-gray-700">
            <p>• See similarity percentage at a glance</p>
            <p>• Toggle between unified and split view</p>
            <p>• Filter to see only differences</p>
            <p>• Copy results to clipboard</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/60 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Pro Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use <span className="font-mono bg-blue-100 px-1 rounded">Unified View</span> to see changes inline</li>
              <li>• Use <span className="font-mono bg-blue-100 px-1 rounded">Split View</span> to see documents side by side</li>
              <li>• Toggle <span className="font-mono bg-blue-100 px-1 rounded">Differences Only</span> to focus on changes</li>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ScaleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Document Comparison Results
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Side-by-side analysis with {similarity.toFixed(1)}% similarity
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium text-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span>Help</span>
            </motion.button>
            
            <motion.button
              onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-gray-700 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EyeIcon className="w-4 h-4" />
              <span>{viewMode === 'unified' ? 'Split View' : 'Unified View'}</span>
            </motion.button>

            <motion.button
              onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg ${
                showOnlyDifferences 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-white/60 hover:bg-white/80 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Differences Only</span>
            </motion.button>

            {onNewComparison && (
              <motion.button
                onClick={onNewComparison}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>New Comparison</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Similarity meter */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Similarity Score</span>
            <span className="text-sm font-bold text-gray-900">{similarity.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div 
              className={`h-3 rounded-full ${
                similarity >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                similarity >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${similarity}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Lines</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-lg font-bold text-green-600">{stats.added}</div>
            <div className="text-xs text-gray-600">Added</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-lg font-bold text-red-600">{stats.deleted}</div>
            <div className="text-xs text-gray-600">Removed</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-lg font-bold text-blue-600">{stats.unchanged}</div>
            <div className="text-xs text-gray-600">Unchanged</div>
          </div>
        </div>

        {/* File Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <motion.div 
            className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DocumentTextIcon className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-gray-900 text-sm">{comparison.file1Name || 'Document 1'}</p>
              <p className="text-xs text-gray-600">Original Document</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DocumentTextIcon className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900 text-sm">{comparison.file2Name || 'Document 2'}</p>
              <p className="text-xs text-gray-600">Comparison Document</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Instructions toggle */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-100 p-6 bg-blue-50/50"
          >
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">How to use this comparison:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="font-semibold text-green-700">Green highlights</span> show text that was added in the second document</li>
                  <li>• <span className="font-semibold text-red-700">Red highlights</span> show text that was removed from the first document</li>
                  <li>• Use the view toggles above to change how differences are displayed</li>
                  <li>• The similarity score shows how much the documents match overall</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Content */}
      <div className="p-6">
        {viewMode === 'unified' ? (
          <div className="space-y-1 max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
            {filteredDiff.unified.filter(shouldShowLine).map((line, index) => (
              <div key={index} className={getLineStyle(line.type)}>
                <div className="flex items-start space-x-3">
                  <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
                    {line.lineNumber}
                  </span>
                  <span className="flex-1">{line.content || '(empty line)'}</span>
                  {line.type !== 'equal' && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/60">
                      {line.type === 'added' ? '+' : '-'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2 text-red-600" />
                Original Document
              </h4>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {filteredDiff.split.left.filter(shouldShowLine).map((line, index) => (
                  <div key={index} className={getLineStyle(line.type)}>
                    <div className="flex items-start space-x-3">
                      <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
                        {line.lineNumber}
                      </span>
                      <span className="flex-1">{line.content || '(empty line)'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2 text-green-600" />
                Comparison Document
              </h4>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                {filteredDiff.split.right.filter(shouldShowLine).map((line, index) => (
                  <div key={index} className={getLineStyle(line.type)}>
                    <div className="flex items-start space-x-3">
                      <span className="text-xs text-gray-500 font-mono w-8 flex-shrink-0">
                        {line.lineNumber}
                      </span>
                      <span className="flex-1">{line.content || '(empty line)'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => copyToClipboard(comparison.text1, 'doc1')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy Doc 1</span>
              {copiedStates.doc1 && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
            </motion.button>
            
            <motion.button
              onClick={() => copyToClipboard(comparison.text2, 'doc2')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ClipboardIcon className="w-4 h-4" />
              <span>Copy Doc 2</span>
              {copiedStates.doc2 && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
            </motion.button>
          </div>

          <motion.button
            onClick={() => copyToClipboard(JSON.stringify(comparison, null, 2), 'comparison')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Copy Full Report</span>
            {copiedStates.comparison && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default DocumentComparison 