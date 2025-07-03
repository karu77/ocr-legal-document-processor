import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
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

// Enhanced Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: { 
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    scale: 1.02,
    y: -5,
    rotateX: 5,
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    transition: { 
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const floatingVariants = {
  initial: { y: 0, x: 0 },
  animate: {
    y: [-10, 10, -10],
    x: [-5, 5, -5],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
}

const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const headerVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.3
    }
  }
}

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
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
    filename: '',
    allProcessedFiles: [],
    detectedLanguage: null,
    ocrWarning: null,
  })
  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  // Scroll animations
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 1000], [0, -100])
  const opacityBg = useTransform(scrollY, [0, 300], [1, 0.8])

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

  // Mobile detection and online status monitoring
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Connection lost - Some features may be unavailable')
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Reset results when files change to avoid stale data
  useEffect(() => {
    // Don't reset if there are no files initially
    if (files.length === 0 && !results.filename) {
      return;
    }
    
    // When files change, reset the main results but keep the list of 
    // processed files for the comparison feature.
    setResults(prevResults => ({
      ...prevResults,
      ocrText: '',
      translatedText: '',
      cleanedText: '',
      summary: '',
      bulletPoints: '',
      comparison: null,
      filename: files.length > 0 ? files[0].name : '',
      detectedLanguage: null,
      ocrWarning: null,
    }));
    
    // Clear any active loading spinners or errors
    setLoading(false);
    setCurrentOperation('');
    setError('');

  }, [files]);

  // Mobile touch gesture handlers
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e) => {
    if (!touchStartX || !touchStartY) return
    
    const touchEndX = e.touches[0].clientX
    const touchEndY = e.touches[0].clientY
    
    const diffX = touchStartX - touchEndX
    const diffY = touchStartY - touchEndY
    
    // Prevent scrolling when swiping horizontally
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault()
    }
  }

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  // Handle file upload
  const handleFileSelect = useCallback((selectedFiles) => {
    // Limit to 2 files for comparison
    const filesToStore = selectedFiles.slice(0, 2)
    
    // Keep track of existing processed files
    const existingProcessedFiles = results.allProcessedFiles || []
    
    // If we're adding files to existing ones, preserve them
    let updatedFiles = [...files]
    let shouldResetResults = false
    
    // If this is a fresh start or replacing all files
    if (filesToStore.length === 1 && files.length === 0) {
      // First file upload
      updatedFiles = filesToStore
      shouldResetResults = true
    } else if (filesToStore.length === 2) {
      // Two files selected at once - replace everything
      updatedFiles = filesToStore
      shouldResetResults = true
    } else if (filesToStore.length === 1 && files.length === 1) {
      // Adding second file
      updatedFiles = [files[0], filesToStore[0]]
      shouldResetResults = false
    } else {
      // Default case - replace all
      updatedFiles = filesToStore
      shouldResetResults = true
    }
    
    setFiles(updatedFiles)
    
    if (shouldResetResults) {
      // Only reset results for fresh start
      setResults({
        ocrText: '',
        translatedText: '',
        cleanedText: '',
        summary: '',
        bulletPoints: '',
        comparison: null,
        filename: '',
        allProcessedFiles: [],
        detectedLanguage: null,
        ocrWarning: null,
      })
      setError('')
      
      // Show appropriate toast message
      if (updatedFiles.length === 2) {
        toast.success('Two files selected for comparison. Previous results cleared.')
      } else {
        toast.success('File selected. Ready for processing.')
      }
    } else {
      // Just adding a second file - preserve existing processed data
      toast.success(`Second file added. You now have ${updatedFiles.length} files ready for comparison.`)
    }
    
    // Automatically trigger OCR for both files if 2 files are selected and no previous processing
    if (updatedFiles.length === 2 && shouldResetResults) {
      setTimeout(() => handleOCR(), 100) // Small delay to ensure state is updated
    }
  }, [files, results.allProcessedFiles])

  // Handle language selection
  const handleLanguageChange = useCallback((languageObject) => {
    setTargetLanguage(languageObject)
    toast.success(`Target language set to ${languageObject.name}`)
  }, [])

  // Generic API call handler with better UX and mobile optimization
  const makeApiCall = async (endpoint, data, successCallback, operationName) => {
    // Check if online first
    if (!isOnline) {
      toast.error('You are offline. Please check your internet connection.')
      return
    }

    setLoading(true)
    setCurrentOperation(operationName)
    setError('')
    
    // Mobile-specific loading feedback
    if (isMobile) {
      toast.loading(`${operationName} in progress...`, {
        id: 'mobile-loading',
        duration: 0,
      })
    }
    
    try {
      const response = await axios.post(endpoint, data)
      if (response.data.success) {
        successCallback(response.data)
        
        // Dismiss mobile loading toast
        if (isMobile) {
          toast.dismiss('mobile-loading')
        }
        
        toast.success(`${operationName} completed successfully!`, {
          duration: isMobile ? 2000 : 4000,
        })
      } else {
        throw new Error(response.data.error || `${operationName} failed`)
      }
    } catch (error) {
      // Dismiss mobile loading toast
      if (isMobile) {
        toast.dismiss('mobile-loading')
      }
      
      const errorMessage = error.response?.data?.error || error.message || `${operationName} failed`
      setError(errorMessage)
      
      // Mobile-friendly error messages
      const mobileErrorMessage = isMobile && errorMessage.length > 50 
        ? `${errorMessage.substring(0, 50)}...` 
        : errorMessage
        
      toast.error(mobileErrorMessage, {
        duration: isMobile ? 4000 : 6000,
      })
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  // OCR Handler
  const handleOCR = async () => {
    if (files.length === 0) {
      toast.error('Please select a file first.')
      return
    }

    // Process all selected files
    const processFile = async (file) => {
      const data = new FormData()
      data.append('file', file)

      try {
        const response = await axios.post('/api/process', data)
        if (response.data.success) {
          return {
            name: file.name,
            text: response.data.extracted_text,
            detectedLanguage: response.data.detected_lang_code,
            warning: response.data.warning || null
          }
        }
      } catch (error) {
        toast.error(`Failed to process ${file.name}`)
        throw error
      }
    }

    try {
      setLoading(true)
      setCurrentOperation('OCR Processing')

      const results = await Promise.all(files.map(processFile))
      
      // Update results state
      setResults(prev => ({
        ...prev,
        ocrText: results[0].text, // Keep first file's text as main OCR text
        filename: results[0].name,
        detectedLanguage: results[0].detectedLanguage,
        ocrWarning: results[0].warning,
        allProcessedFiles: results.map(r => r.name)
      }))

      console.log('App.jsx: Updated results state', results);
      console.log('App.jsx: ocrText after update', results[0].text);
      console.log('App.jsx: detectedLanguage after update', results[0].detectedLanguage);

      // If we have two files, automatically trigger comparison
      if (results.length === 2) {
        await handleCompare(results[0], results[1])
      }

      toast.success('Text extraction completed!')
    } catch (error) {
      console.error('OCR processing failed:', error)
      toast.error('Failed to process one or more files')
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  // Compare Handler
  const handleCompare = async (file1, file2) => {
    if (!file1 || !file2) {
      toast.error('Two files are required for comparison')
        return
    }

    await makeApiCall(
      '/compare',
      { text1: file1.text, text2: file2.text },
      (data) => {
      setResults(prev => ({
        ...prev,
        comparison: {
            ...data,
            file1: { name: file1.name, detectedLanguage: file1.detectedLanguage },
            file2: { name: file2.name, detectedLanguage: file2.detectedLanguage }
          }
        }))
      },
      'Document Comparison'
    )
  }

  // Translation Handler
  const handleTranslate = async () => {
    if (!results.ocrText) {
      toast.error('Please perform OCR first')
      return
    }

    await makeApiCall(
      '/translate',
      { text: results.ocrText, target_language: targetLanguage.name },
      (data) => {
        setResults(prev => ({
          ...prev,
          translatedText: data.translated_text
        }))
      },
      'Translation'
    )
  }

  // Text Cleanup Handler
  const handleCleanup = async () => {
    if (!results.ocrText) {
      toast.error('Please perform OCR first')
      return
    }

    await makeApiCall(
      '/cleanup',
      { text: results.ocrText },
      (data) => {
        setResults(prev => ({
          ...prev,
          cleanedText: data.cleaned_text
        }))
      },
      'Text Cleanup'
    )
  }

  // Summarization Handler
  const handleSummarize = async () => {
    if (!results.ocrText) {
      toast.error('Please perform OCR first')
      return
    }

    await makeApiCall(
      '/summarize',
      { text: results.ocrText },
      (data) => {
        setResults(prev => ({
          ...prev,
          summary: data.summary
        }))
      },
      'Summarization'
    )
  }

  // Bullet Points Handler
  const handleBulletPoints = async () => {
    if (!results.ocrText) {
      toast.error('Please perform OCR first')
      return
    }

    await makeApiCall(
      '/bullet_points',
      { text: results.ocrText },
      (data) => {
        setResults(prev => ({
          ...prev,
          bulletPoints: data.bullet_points
        }))
      },
      'Bullet Points Generation'
    )
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-all duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Toast notifications with mobile optimization */}
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          className: 'text-sm',
          style: {
            maxWidth: isMobile ? '95vw' : '90vw',
            fontSize: isMobile ? '14px' : '16px',
          },
          duration: isMobile ? 3000 : 4000,
        }}
      />

      {/* Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
      <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-[110] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>You're offline - Some features may be limited</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced floating background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <motion.div 
          style={{ y: yBg, opacity: opacityBg }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div 
          style={{ y: yBg, opacity: opacityBg }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
        />
        <motion.div 
          style={{ y: yBg, opacity: opacityBg }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 4 }}
        />
      </div>

      {/* Enhanced Navigation */}
      <motion.nav 
        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-[100] shadow-lg"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: '0 15px 25px rgba(0,0,0,0.2)'
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                <DocumentTextIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </motion.div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  OCR Legal Processor
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Document Processing
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                  Legal AI
                </h1>
            </div>
            </motion.div>

            {/* Enhanced Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Enhanced Theme Toggle */}
              <motion.button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm touch-manipulation"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9, rotate: -15 }}
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                    <SunIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                ) : (
                    <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Main Content with Better Responsive Design */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-12 relative z-10">
        <motion.header 
          className="text-center mb-8 sm:mb-12 lg:mb-20 relative"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0 -top-4 -bottom-4 opacity-5 dark:opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-3xl transform rotate-1"></div>
          </div>
          
          {/* Enhanced title with sophisticated gradient and effects */}
          <motion.h1 
            className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-4 sm:mb-6 lg:mb-8 leading-[0.9] tracking-tight px-4"
            variants={titleVariants}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 6s ease-in-out infinite',
            }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Legal Document
            </motion.span>
            <motion.span
              className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mt-1 sm:mt-2"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f7dc6f, #bb6bd9)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-wave 4s ease-in-out infinite',
              }}
            >
              AI Assistant
            </motion.span>
          </motion.h1>
          
          {/* Enhanced subtitle with better spacing and typography */}
          <motion.div 
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
            variants={titleVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-700 dark:text-gray-200 leading-relaxed mb-4 font-medium">
              Empower your legal workflow with advanced OCR, translation, and AI insights.
            </p>
            
            {/* Feature highlights */}
            <motion.div 
              className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 lg:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { icon: '🔍', text: 'Smart OCR' },
                { icon: '🌐', text: 'Multi-Language' },
                { icon: '⚡', text: 'Lightning Fast' },
                { icon: '🤖', text: 'AI-Powered' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 touch-manipulation"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <span className="text-base sm:text-xl">{feature.icon}</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.header>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 lg:mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* File Upload Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between card-glow"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-blue-500" /> 
                <span className="hidden sm:inline">Document Input</span>
                <span className="sm:hidden">Upload</span>
              </h2>
              <FileUpload 
                onFilesSelected={handleFileSelect}
              />
              {files.length > 0 && (
                <div className="mt-3 sm:mt-4 text-gray-700 dark:text-gray-300">
                  <p className="text-sm sm:text-base">Selected file: <span className="font-semibold break-all">{files[0].name}</span></p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Language Selection & AI Operations */}
          <motion.div variants={itemVariants} className="lg:col-span-2 relative z-20">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between overflow-visible card-glow"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-purple-500" /> 
                <span className="hidden sm:inline">AI Operations</span>
                <span className="sm:hidden">AI Tools</span>
              </h2>
              
              <div className="mb-4 sm:mb-6 z-[99]"> {/* Ensure LanguageSelector has high z-index */}
                <motion.div variants={itemVariants}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <GlobeAltIcon className="inline w-4 h-4 mr-1" />
                      Translation Target Language
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select the language you want to translate your document to
                    </p>
                  </div>
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
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
            >
              <LoadingSpinner operation={currentOperation} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Display */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200 flex items-center">
            <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-green-500" /> Results
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
              className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-xl relative mt-6 sm:mt-8"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-0 sm:ml-2 mt-1 sm:mt-0 text-sm sm:text-base">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Comparison */}
        <AnimatePresence>
          {results.comparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 sm:mt-8"
            >
              <DocumentComparison comparison={results.comparison} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App