import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import FileUpload from './components/FileUpload'
import LanguageSelector from './components/LanguageSelector'
import ActionButtons from './components/ActionButtons'
import ResultsDisplay from './components/ResultsDisplay'
import DocumentComparison from './components/DocumentComparison'
import LoadingSpinner from './components/LoadingSpinner'
import { 
  DocumentTextIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
}

const allLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', region: 'Global' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', region: 'Spain' },
  { code: 'fr', name: 'French', flag: '🇫🇷', region: 'France' },
  { code: 'de', name: 'German', flag: '🇩🇪', region: 'Germany' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', region: 'Italy' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', region: 'Portugal' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', region: 'Russia' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', region: 'China' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', region: 'Korea' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', region: 'Saudi Arabia' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', region: 'India' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', region: 'Thailand' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', region: 'Vietnam' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', region: 'Indonesia' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', region: 'Malaysia' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', region: 'Philippines' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', region: 'Netherlands' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', region: 'Sweden' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', region: 'Norway' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', region: 'Denmark' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', region: 'Finland' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', region: 'Poland' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', region: 'Czech Republic' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', region: 'Slovakia' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', region: 'Hungary' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', region: 'Romania' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', region: 'Bulgaria' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', region: 'Croatia' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸', region: 'Serbia' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮', region: 'Slovenia' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', region: 'Estonia' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', region: 'Latvia' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', region: 'Lithuania' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', region: 'Turkey' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', region: 'Israel' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', region: 'Iran' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', region: 'Pakistan' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', region: 'Bangladesh' },
  { code: 'ta', name: 'Tamil', flag: '🇱🇰', region: 'Sri Lanka' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', region: 'India' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', region: 'India' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', region: 'India' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', region: 'India' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', region: 'India' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', region: 'India' },
  { code: 'or', name: 'Odia', flag: '🇮🇳', region: 'India' },
  { code: 'as', name: 'Assamese', flag: '🇮🇳', region: 'India' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', region: 'Nepal' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰', region: 'Sri Lanka' },
  { code: 'my', name: 'Myanmar', flag: '🇲🇲', region: 'Myanmar' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', region: 'Cambodia' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', region: 'Laos' }
]

function App() {
  // State management
  const [files, setFiles] = useState([])
  const [targetLanguage, setTargetLanguage] = useState(allLanguages[0])
  const [loading, setLoading] = useState(false)
  const [currentOperation, setCurrentOperation] = useState('')
  const [error, setError] = useState('')
  const [results, setResults] = useState({
    ocrText: '',
    translatedText: '',
    cleanedText: '',
    summary: '',
    bulletPoints: '',
    comparison: null,
    filename: ''
  })
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFiles) => {
    setFiles(uploadedFiles)
    setError('')
    setResults({
      ocrText: '',
      translatedText: '',
      cleanedText: '',
      summary: '',
      bulletPoints: '',
      comparison: null,
      filename: ''
    })
    toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully!`)
  }, [])

  // Handle language selection
  const handleLanguageChange = useCallback((languageObject) => {
    setTargetLanguage(languageObject)
    toast.success(`Target language set to ${languageObject.name}`)
  }, [])

  // Generic API call handler with better UX
  const makeApiCall = async (endpoint, data, successCallback, operationName) => {
    setLoading(true)
    setCurrentOperation(operationName)
    setError('')
    
    try {
      const response = await axios.post(endpoint, data)
      if (response.data.success) {
        successCallback(response.data)
        toast.success(`${operationName} completed successfully!`)
      } else {
        const errorMsg = response.data.error || `${operationName} failed`
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      console.error(`Error calling ${endpoint}:`, err)
      const errorMsg = err.response?.data?.error || err.message || 'Network error occurred'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  // API handlers
  const handleOCR = async () => {
    if (!files.length) {
      toast.error('Please upload a file first')
      return
    }

    const file = files[0]
    console.log('File selected:', file.name, file.type, file.size, 'bytes')

    // Read file content using FileReader
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    reader.onload = async () => {
      const arrayBuffer = reader.result
      const blob = new Blob([arrayBuffer], { type: file.type })
      console.log('FileReader loaded. ArrayBuffer size:', arrayBuffer.byteLength, 'bytes', 'Blob size:', blob.size, 'bytes')

      const formData = new FormData()
      formData.append('file', blob, file.name)
      console.log('FormData prepared. Appending file:', file.name, 'with Blob type:', blob.type)
      // You cannot directly inspect FormData content easily in console, but this confirms append was called.

      await makeApiCall('/ocr', formData, (data) => {
        setResults(prev => ({
          ...prev,
          ocrText: data.extracted_text,
          filename: data.filename
        }))
      }, 'OCR Processing')
    }

    reader.onerror = (error) => {
      toast.error('Failed to read file: ' + error.target.error)
      console.error('FileReader error:', error)
    }
  }

  const handleTranslate = async () => {
    const textToTranslate = results.cleanedText || results.ocrText
    if (!textToTranslate) {
      toast.error('Please extract text first using OCR')
      return
    }

    await makeApiCall('/translate', {
      text: textToTranslate,
      target_language: targetLanguage.name
    }, (data) => {
      setResults(prev => ({
        ...prev,
        translatedText: data.translated_text
      }))
    }, `Translation to ${targetLanguage.name}`)
  }

  const handleCleanup = async () => {
    if (!results.ocrText) {
      toast.error('Please extract text first using OCR')
      return
    }

    await makeApiCall('/cleanup', {
      text: results.ocrText
    }, (data) => {
      setResults(prev => ({
        ...prev,
        cleanedText: data.cleaned_text
      }))
    }, 'Text Cleanup')
  }

  const handleSummarize = async () => {
    const textToSummarize = results.translatedText || results.cleanedText || results.ocrText
    if (!textToSummarize) {
      toast.error('Please extract text first using OCR')
      return
    }

    await makeApiCall('/summarize', {
      text: textToSummarize
    }, (data) => {
      setResults(prev => ({
        ...prev,
        summary: data.summary_text
      }))
    }, 'Document Summarization')
  }

  const handleBulletPoints = async () => {
    const textToBulletPoint = results.translatedText || results.cleanedText || results.ocrText
    if (!textToBulletPoint) {
      toast.error('Please extract text first using OCR')
      return
    }

    await makeApiCall('/bullet_points', {
      text: textToBulletPoint
    }, (data) => {
      setResults(prev => ({
        ...prev,
        bulletPoints: data.bullet_points
      }))
    }, 'Bullet Point Generation')
  }

  const handleCompare = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least two files for comparison')
      return
    }

    const file1 = files[0]
    const file2 = files[1]

    const readPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file) // Assuming text comparison for now
      })
    })

    try {
      toast.loading('Reading files for comparison...', { id: 'file-read' })
      const [text1, text2] = await Promise.all(readPromises)
      toast.success('Files read!', { id: 'file-read' })

      await makeApiCall('/compare', {
        text1: text1,
        text2: text2
      }, (data) => {
        setResults(prev => ({
          ...prev,
          comparison: data
        }))
      }, 'Document Comparison')

    } catch (error) {
      toast.error('Failed to read files for comparison', { id: 'file-read' })
      console.error('Error reading files for comparison:', error)
    }
  }

  const processingSteps = [
    { icon: DocumentTextIcon, title: 'Files Uploaded', completed: files.length > 0 },
    { icon: CpuChipIcon, title: 'Text Extracted', completed: !!results.ocrText },
    { icon: SparklesIcon, title: 'AI Processing', completed: !!(results.translatedText || results.cleanedText || results.summary || results.bulletPoints) },
    { icon: CheckCircleIcon, title: 'Ready for Export', completed: !!(results.translatedText || results.summary) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 transition-colors duration-500 font-sans relative">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Theme Toggle Button */}
      <motion.button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 z-[100]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {theme === 'dark' ? (
          <SunIcon className="h-6 w-6 text-yellow-400" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-800" />
        )}
      </motion.button>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.header 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Legal Document AI Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Streamline your legal document processing with OCR, translation, and AI-powered insights.
          </p>
        </motion.header>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* File Upload Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-full flex flex-col justify-between"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-500" /> Document Input
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {files.length > 0 && (
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  <p>Selected file: <span className="font-semibold">{files[0].name}</span></p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Language Selection & AI Operations */}
          <motion.div variants={itemVariants} className="lg:col-span-2 relative z-20">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-full flex flex-col justify-between overflow-visible"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-purple-500" /> AI Operations
              </h2>
              
              <div className="mb-6 z-[99]"> {/* Ensure LanguageSelector has high z-index */}
                <motion.div variants={itemVariants}>
                  <LanguageSelector
                    selectedLanguage={targetLanguage}
                    onLanguageChange={handleLanguageChange}
                    allLanguages={allLanguages}
                  />
                </motion.div>
              </div>

              <ActionButtons
                onOCR={handleOCR}
                onTranslate={handleTranslate}
                onCleanup={handleCleanup}
                onSummarize={handleSummarize}
                onBulletPoints={handleBulletPoints}
                onCompare={handleCompare}
                results={results}
                hasFiles={files.length > 0}
                currentOperation={currentOperation}
              />

            </motion.div>
          </motion.div>
        </motion.div>

        {/* Loading Spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
            >
              <LoadingSpinner operation={currentOperation} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Display */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
            <CheckCircleIcon className="h-8 w-8 mr-3 text-green-500" /> Results
          </h2>
          <ResultsDisplay results={results} />
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl relative mt-8"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App