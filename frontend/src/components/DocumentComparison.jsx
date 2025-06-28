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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

const DocumentComparison = ({ comparison }) => {
  const [viewMode, setViewMode] = useState('unified') // 'unified' or 'split'
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const [highlightMode, setHighlightMode] = useState('both') // 'both', 'additions', 'deletions'
  const [copiedStates, setCopiedStates] = useState({})

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
        return `${baseStyle} bg-gradient-to-r from-success-50 to-emerald-50 border-success-400 text-success-800`
      case 'deleted':
        return `${baseStyle} bg-gradient-to-r from-error-50 to-red-50 border-error-400 text-error-800`
      case 'equal':
        return `${baseStyle} bg-white border-secondary-200 text-secondary-700`
      case 'empty':
        return `${baseStyle} bg-secondary-50 border-secondary-200 text-secondary-400`
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

  if (!comparison) {
    return null
  }

  const similarity = comparison.similarity_percentage || 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-50 to-primary-50 border-b border-secondary-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-slate-500 rounded-2xl flex items-center justify-center shadow-soft">
              <ScaleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-secondary-900">
                Document Comparison
              </h3>
              <p className="text-sm text-secondary-600 mt-1">
                Side-by-side analysis with diff highlighting
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}
              className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-secondary-700 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-soft"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EyeIcon className="w-4 h-4" />
              <span>{viewMode === 'unified' ? 'Split View' : 'Unified View'}</span>
            </motion.button>

            <motion.button
              onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-soft ${
                showOnlyDifferences 
                  ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' 
                  : 'bg-white/60 hover:bg-white/80 text-secondary-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Differences Only</span>
            </motion.button>
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
            <DocumentTextIcon className="w-5 h-5 text-error-600" />
            <div>
              <p className="font-medium text-secondary-900 text-sm">{comparison.file1Name}</p>
              <p className="text-xs text-secondary-600">Original Document</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DocumentTextIcon className="w-5 h-5 text-success-600" />
            <div>
              <p className="font-medium text-secondary-900 text-sm">{comparison.file2Name}</p>
              <p className="text-xs text-secondary-600">Comparison Document</p>
            </div>
          </motion.div>
        </div>

        {/* Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-primary-600">{similarity.toFixed(1)}%</div>
            <div className="text-xs text-secondary-600 font-medium">Similarity</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-success-600">{stats.added}</div>
            <div className="text-xs text-secondary-600 font-medium">Added Lines</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-error-600">{stats.deleted}</div>
            <div className="text-xs text-secondary-600 font-medium">Removed Lines</div>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <div className="text-2xl font-bold text-secondary-600">{stats.unchanged}</div>
            <div className="text-xs text-secondary-600 font-medium">Unchanged</div>
          </div>
        </motion.div>

        {/* Similarity Bar */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
            <span>Document Similarity</span>
            <span>{similarity.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-3 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                similarity >= 80 ? 'bg-gradient-to-r from-success-500 to-emerald-500' :
                similarity >= 60 ? 'bg-gradient-to-r from-warning-500 to-orange-500' :
                'bg-gradient-to-r from-error-500 to-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${similarity}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {viewMode === 'unified' ? (
            <motion.div
              key="unified"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-secondary-900">Unified Diff View</h4>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => copyToClipboard(filteredDiff.unified.map(line => line.content).join('\n'), 'unified')}
                    className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg font-medium text-sm transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copiedStates.unified ? <CheckCircleIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                    <span>{copiedStates.unified ? 'Copied!' : 'Copy'}</span>
                  </motion.button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary-200 overflow-hidden">
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
                  {filteredDiff.unified.map((line, index) => 
                    shouldShowLine(line.type) && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.01 }}
                        className={getLineStyle(line.type)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xs text-secondary-400 font-medium w-8 flex-shrink-0 text-right">
                            {line.lineNumber}
                          </span>
                          <span className="flex-1 whitespace-pre-wrap break-words">
                            {line.content || '\u00A0'}
                          </span>
                          <span className="text-xs text-secondary-400 font-medium">
                            {line.type === 'added' ? '+' : line.type === 'deleted' ? '-' : ''}
                          </span>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="split"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Left Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-error-700">Original Document</h4>
                  <motion.button
                    onClick={() => copyToClipboard(comparison.text1, 'original')}
                    className="flex items-center space-x-1 px-2 py-1 bg-error-100 hover:bg-error-200 text-error-700 rounded-lg text-xs transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copiedStates.original ? <CheckCircleIcon className="w-3 h-3" /> : <ClipboardIcon className="w-3 h-3" />}
                  </motion.button>
                </div>
                <div className="bg-gradient-to-br from-error-50 to-white rounded-2xl border border-error-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-error-300 scrollbar-track-error-100">
                    {filteredDiff.split.left.map((line, index) => 
                      shouldShowLine(line.type) && (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.01 }}
                          className={getLineStyle(line.type)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xs text-secondary-400 font-medium w-8 flex-shrink-0 text-right">
                              {line.lineNumber}
                            </span>
                            <span className="flex-1 whitespace-pre-wrap break-words">
                              {line.content || '\u00A0'}
                            </span>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-success-700">Comparison Document</h4>
                  <motion.button
                    onClick={() => copyToClipboard(comparison.text2, 'comparison')}
                    className="flex items-center space-x-1 px-2 py-1 bg-success-100 hover:bg-success-200 text-success-700 rounded-lg text-xs transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {copiedStates.comparison ? <CheckCircleIcon className="w-3 h-3" /> : <ClipboardIcon className="w-3 h-3" />}
                  </motion.button>
                </div>
                <div className="bg-gradient-to-br from-success-50 to-white rounded-2xl border border-success-200 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-success-300 scrollbar-track-success-100">
                    {filteredDiff.split.right.map((line, index) => 
                      shouldShowLine(line.type) && (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.01 }}
                          className={getLineStyle(line.type)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-xs text-secondary-400 font-medium w-8 flex-shrink-0 text-right">
                              {line.lineNumber}
                            </span>
                            <span className="flex-1 whitespace-pre-wrap break-words">
                              {line.content || '\u00A0'}
                            </span>
                          </div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default DocumentComparison 