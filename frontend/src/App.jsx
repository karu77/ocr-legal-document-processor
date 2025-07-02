import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import FileUpload from './components/FileUpload'
import LanguageSelector from './components/LanguageSelector'
import ActionButtons from './components/ActionButtons'
import ResultsDisplay from './components/ResultsDisplay'
import DocumentComparison from './components/DocumentComparison'
import LoadingSpinner from './components/LoadingSpinner'
import AuthModal from './components/AuthModal'
import { 
  DocumentTextIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
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
  
  // Authentication state
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

  // Scroll animations
  const { scrollY } = useScroll()
  const yBg = useTransform(scrollY, [0, 1000], [0, -100])
  const opacityBg = useTransform(scrollY, [0, 300], [1, 0.8])

  // Initialize authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')
      
      if (accessToken && savedUser) {
        try {
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          // Verify token is still valid by fetching user profile
          const response = await axios.get('/auth/profile')
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            // Token might be expired, try to refresh
            await handleTokenRefresh()
          }
        } catch (error) {
          // Token is invalid, try to refresh
          await handleTokenRefresh()
        }
      }
    }
    
    checkAuth()
  }, [])

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

  // Authentication handlers
  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }
      
      const response = await axios.post('/auth/refresh', { refresh_token: refreshToken })
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.tokens.access_token)
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access_token}`
        
        // Get user profile
        const profileResponse = await axios.get('/auth/profile')
        if (profileResponse.data.success) {
          setUser(profileResponse.data.user)
        }
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      // Refresh failed, clear auth data
      handleLogout()
    }
  }

  const handleAuthSuccess = useCallback((userData) => {
    setUser(userData)
    // Set axios default header
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    }
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
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

    setLoading(true)
    setCurrentOperation('OCR Processing')
    setError('')

    try {
      // Get existing processed files to avoid reprocessing
      const existingProcessedFiles = results.allProcessedFiles || []
      const existingFilenames = existingProcessedFiles.map(f => f.filename)
      
      // Only process files that haven't been processed yet
      const filesToProcess = files.filter(file => !existingFilenames.includes(file.name))
      
      let newProcessedResults = []
      
      if (filesToProcess.length > 0) {
        // Process new files
        newProcessedResults = await Promise.all(
          filesToProcess.map(async (file) => {
            const formData = new FormData()
            formData.append('file', file)
            
            const response = await axios.post('/ocr', formData)
            if (!response.data.success) {
              throw new Error(response.data.error || 'OCR processing failed')
            }
            
            return {
              filename: file.name,
              text: response.data.extracted_text,
              detected_lang_name: response.data.detected_lang_name,
              warning: response.data.warning
            }
          })
        )
      }

      // Combine existing and new processed files
      const allProcessedFiles = [...existingProcessedFiles, ...newProcessedResults]

      // Update results with all processed files
      setResults(prev => ({
        ...prev,
        ocrText: allProcessedFiles[0]?.text || prev.ocrText, // Keep first result as main OCR text for other operations
        filename: allProcessedFiles[0]?.filename || prev.filename,
        allProcessedFiles: allProcessedFiles,
        detectedLanguage: allProcessedFiles[0]?.detected_lang_name || prev.detectedLanguage,
        ocrWarning: allProcessedFiles[0]?.warning || prev.ocrWarning,
        // Only clear subsequent results if we processed new files
        ...(newProcessedResults.length > 0 && {
          translatedText: "",
          cleanedText: "",
          summary: "",
          bulletPoints: "",
          comparison: null,
        })
      }))

      // If we have exactly two files, automatically trigger comparison
      if (allProcessedFiles.length === 2) {
        await handleCompare(allProcessedFiles[0], allProcessedFiles[1])
      }

      if (newProcessedResults.length > 0) {
        toast.success(`OCR Processing completed for ${newProcessedResults.length} new file(s)! Total: ${allProcessedFiles.length}`)
      } else {
        toast.info('All files already processed. Use "Compare Documents" to compare them.')
      }
    } catch (error) {
      console.error('OCR error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'OCR Processing failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  const handleCompare = async (file1, file2) => {
    // If no files provided, try to use the processed files
    if (!file1 || !file2) {
      if (!results.allProcessedFiles || results.allProcessedFiles.length < 2) {
        toast.error('Please process both files with OCR first')
        return
      }
      [file1, file2] = results.allProcessedFiles
    }

    setLoading(true)
    setCurrentOperation('Comparing Documents')
    setError('')

    try {
      const response = await axios.post('/compare', {
        text1: file1.text,
        text2: file2.text,
        file1Name: file1.filename,
        file2Name: file2.filename
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Document comparison failed')
      }

      setResults(prev => ({
        ...prev,
        comparison: {
          ...response.data,
          file1Name: file1.filename,
          file2Name: file2.filename,
          text1: file1.text,
          text2: file2.text
        }
      }))
      toast.success('Documents compared successfully')
    } catch (error) {
      console.error('Comparison error:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Document comparison failed'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  const handleTranslate = async () => {
    if (!results.ocrText) {
      toast.error('Please perform OCR on a document first')
      return
    }

    makeApiCall(
      '/api/translate',
      {
        text: results.ocrText,
        target_language: targetLanguage.name,
        // Also send the detected source language for better accuracy
        source_language_code: results.detectedLanguage?.code || 'auto'
      },
      (data) => {
        setResults(prev => ({
          ...prev,
          translatedText: data.translated_text
        }))
      },
      `Translating to ${targetLanguage.name}`
    )
  }

  const handleCleanup = async () => {
    if (!results.ocrText) {
      toast.error('Please extract text first')
      return
    }

    setLoading(true)
    setCurrentOperation('Cleaning Text')
    setError('')

    try {
      const response = await axios.post('/cleanup', {
        text: results.ocrText
      })

      if (response.data.success) {
        setResults(prev => ({
          ...prev,
          cleanedText: response.data.cleaned_text
        }))
        toast.success('Text cleaned successfully')
      } else {
        throw new Error(response.data.error || 'Text cleanup failed')
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      setError(`Text cleanup failed: ${error.message}`)
      toast.error('Failed to clean text')
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  const handleSummarize = async () => {
    if (!results.ocrText && !results.cleanedText) {
      toast.error('Please extract text first')
      return
    }

    setLoading(true)
    setCurrentOperation('Summarizing')
    setError('')

    try {
      const textToSummarize = results.cleanedText || results.ocrText
      const response = await axios.post('/summarize', {
        text: textToSummarize
      })

      if (response.data.success) {
        setResults(prev => ({
          ...prev,
          summary: response.data.summary
        }))
        toast.success('Text summarized successfully')
      } else {
        throw new Error(response.data.error || 'Summarization failed')
      }
    } catch (error) {
      console.error('Summarization error:', error)
      setError(`Summarization failed: ${error.message}`)
      toast.error('Failed to summarize text')
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  const handleBulletPoints = async () => {
    if (!results.ocrText && !results.cleanedText) {
      toast.error('Please extract text first')
      return
    }

    setLoading(true)
    setCurrentOperation('Generating Key Points')
    setError('')

    try {
      const textToProcess = results.cleanedText || results.ocrText
      const response = await axios.post('/bullet_points', {
        text: textToProcess
      })

      if (response.data.success) {
        setResults(prev => ({
          ...prev,
          bulletPoints: response.data.bullet_points
        }))
        toast.success('Key points generated successfully')
      } else {
        throw new Error(response.data.error || 'Key points generation failed')
      }
    } catch (error) {
      console.error('Key points error:', error)
      setError(`Key points generation failed: ${error.message}`)
      toast.error('Failed to generate key points')
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
  }

  const processingSteps = [
    { icon: DocumentTextIcon, title: 'Files Uploaded', completed: files.length > 0 },
    { icon: CpuChipIcon, title: 'Text Extracted', completed: !!results.ocrText },
    { icon: SparklesIcon, title: 'AI Processing', completed: !!(results.translatedText || results.cleanedText || results.summary || results.bulletPoints) },
    { icon: CheckCircleIcon, title: 'Ready for Export', completed: !!(results.translatedText || results.summary) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans relative overflow-hidden">
      {/* Enhanced Background Elements with Scroll Parallax */}
      <motion.div 
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ y: yBg, opacity: opacityBg }}
      >
        {/* Primary floating blobs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-500/30 dark:from-blue-600/40 dark:to-purple-700/40 rounded-full filter blur-2xl mix-blend-normal dark:mix-blend-screen"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-500/30 dark:from-purple-600/40 dark:to-pink-700/40 rounded-full filter blur-2xl mix-blend-normal dark:mix-blend-screen"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 dark:from-yellow-600/30 dark:to-orange-700/30 rounded-full filter blur-2xl mix-blend-normal dark:mix-blend-screen"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 4 }}
        />
        
        {/* Secondary decorative elements */}
        <motion.div 
          className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-emerald-400/25 to-teal-500/25 dark:from-emerald-600/35 dark:to-teal-700/35 rounded-full filter blur-xl mix-blend-normal dark:mix-blend-screen"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-br from-rose-400/30 to-pink-500/30 dark:from-rose-600/40 dark:to-pink-700/40 rounded-full filter blur-xl mix-blend-normal dark:mix-blend-screen"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Additional floating elements for more dynamic background */}
        <motion.div 
          className="absolute top-1/4 right-1/3 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-cyan-500/20 dark:from-indigo-600/30 dark:to-cyan-700/30 rounded-full filter blur-2xl mix-blend-normal dark:mix-blend-screen"
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -20, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-violet-400/25 to-fuchsia-500/25 dark:from-violet-600/35 dark:to-fuchsia-700/35 rounded-full filter blur-xl mix-blend-normal dark:mix-blend-screen"
          animate={{
            x: [0, -25, 25, 0],
            y: [0, 25, -25, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/6 w-20 h-20 bg-gradient-to-br from-amber-400/30 to-red-500/30 dark:from-amber-600/40 dark:to-red-700/40 rounded-full filter blur-lg mix-blend-normal dark:mix-blend-screen"
          animate={{
            scale: [0.8, 1.3, 0.8],
            rotate: [0, -180, -360],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 9,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </motion.div>

      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#374151' : '#f9fafb',
            color: theme === 'dark' ? '#f9fafb' : '#374151',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
          },
        }}
      />
      
      {/* Enhanced Top Navigation Bar */}
      <motion.nav 
        className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-[100] shadow-lg"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
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
                <DocumentTextIcon className="w-6 h-6 text-white" />
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
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Legal AI
                </h1>
            </div>
            </motion.div>

            {/* Enhanced Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Enhanced User Profile or Login */}
              {user ? (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center md:hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-white text-sm font-semibold">
                      {(user.full_name || user.username)?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </motion.div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <motion.button
                      onClick={() => {/* TODO: Add profile modal */}}
                      className="p-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-red-100/80 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 transition-colors backdrop-blur-sm"
                      whileHover={{ scale: 1.1, rotate: -10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-700 dark:text-red-300" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  onClick={openAuthModal}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Sign In</span>
                </motion.button>
              )}

              {/* Enhanced Theme Toggle */}
              <motion.button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        <motion.header 
          className="text-center mb-12 sm:mb-16 lg:mb-20 relative"
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
            className="relative text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tight"
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
              className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl mt-2 sm:mt-3"
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
            className="max-w-4xl mx-auto px-6 sm:px-8"
            variants={titleVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-700 dark:text-gray-200 leading-relaxed mb-4 font-medium">
              Empower your legal workflow with advanced OCR, translation, and AI insights.
            </p>
            
            {/* Feature highlights */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8"
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
                  className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.header>

        <motion.div
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* File Upload Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 h-full flex flex-col justify-between card-glow"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-500" /> Document Input
              </h2>
              <FileUpload 
                onFilesSelected={handleFileSelect}
              />
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 h-full flex flex-col justify-between overflow-visible card-glow"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 flex items-center">
                <SparklesIcon className="h-8 w-8 mr-3 text-purple-500" /> AI Operations
              </h2>
              
              <div className="mb-6 z-[99]"> {/* Ensure LanguageSelector has high z-index */}
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

        {/* Document Comparison */}
        <AnimatePresence>
          {results.comparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <DocumentComparison comparison={results.comparison} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App