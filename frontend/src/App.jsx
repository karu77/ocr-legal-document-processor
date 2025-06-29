import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    filename: '',
    allProcessedFiles: []
  })
  
  // Authentication state
  const [user, setUser] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })

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
    setFiles(filesToStore)
    
    // Reset all results when new files are selected
    setResults({
      ocrText: '',
      translatedText: '',
      cleanedText: '',
      summary: '',
      bulletPoints: '',
      comparison: null,
      filename: '',
      allProcessedFiles: []
    })
    setError('')
    
    // Show appropriate toast message
    if (filesToStore.length === 2) {
      toast.success('Two files selected for comparison. Previous results cleared.')
    } else {
      toast.success('File selected. Previous results cleared.')
    }
    
    // Automatically trigger OCR for both files if 2 files are selected
    if (filesToStore.length === 2) {
      handleOCR()
    }
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

    setLoading(true)
    setCurrentOperation('OCR Processing')
    setError('')

    try {
      // Process all files
      const processedResults = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await axios.post('/ocr', formData)
          if (!response.data.success) {
            throw new Error(response.data.error || 'OCR processing failed')
          }
          
          return {
            filename: file.name,
            text: response.data.extracted_text
          }
        })
      )

      // Update results with all processed files
      setResults(prev => ({
        ...prev,
        ocrText: processedResults[0].text, // Keep first result as main OCR text for other operations
        filename: processedResults[0].filename,
        allProcessedFiles: processedResults
      }))

      // If we have exactly two files, automatically trigger comparison
      if (processedResults.length === 2) {
        await handleCompare(processedResults[0], processedResults[1])
      }

      toast.success(`OCR Processing completed for ${processedResults.length} file(s)!`)
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
    if (!results.ocrText && !results.cleanedText) {
      toast.error('Please extract text first')
      return
    }

    // Check if user selected a language other than English
    if (targetLanguage.name === 'English') {
      toast.error('Please select a target language other than English from the dropdown above')
      return
    }

    setLoading(true)
    setCurrentOperation(`Translating to ${targetLanguage.name}`)
    setError('')

    try {
      const textToTranslate = results.cleanedText || results.ocrText
      console.log(`Translating to: ${targetLanguage.name}`)
      
      const response = await axios.post('/translate', {
        text: textToTranslate,
        target_language: targetLanguage.name
      })

      if (response.data.success) {
        setResults(prev => ({
          ...prev,
          translatedText: response.data.translated_text
        }))
        toast.success(`Text translated to ${targetLanguage.name}`)
      } else {
        throw new Error(response.data.error || 'Translation failed')
      }
    } catch (error) {
      console.error('Translation error:', error)
      setError(`Translation failed: ${error.message}`)
      toast.error('Failed to translate text')
    } finally {
      setLoading(false)
      setCurrentOperation('')
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 transition-colors duration-500 font-sans relative">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Top Navigation Bar */}
      <motion.nav 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[100]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  OCR Legal Processor
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Document Processing
                </p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* User Profile or Login */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.full_name || user.username}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => {/* TODO: Add profile modal */}}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Cog6ToothIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-700 dark:text-red-300" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={openAuthModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </motion.button>
              )}

              {/* Theme Toggle */}
              <motion.button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 h-full flex flex-col justify-between overflow-visible"
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