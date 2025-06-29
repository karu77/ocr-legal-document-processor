import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [loading, setLoading] = useState(false)

  const handleLogin = async (loginData) => {
    setLoading(true)
    try {
      const response = await axios.post('/auth/login', loginData)
      
      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.tokens.access_token)
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        toast.success('Welcome back!')
        
        // Call success callback with user data
        onAuthSuccess(response.data.user)
        onClose()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (signupData) => {
    setLoading(true)
    try {
      const response = await axios.post('/auth/register', signupData)
      
      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.tokens.access_token)
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        toast.success('Welcome! Your account has been created.')
        
        // Call success callback with user data
        onAuthSuccess(response.data.user)
        onClose()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OCR</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={loading}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <LoginForm
                  key="login"
                  onLogin={handleLogin}
                  onSwitchToSignup={handleSwitchMode}
                  loading={loading}
                />
              ) : (
                <SignupForm
                  key="signup"
                  onSignup={handleSignup}
                  onSwitchToLogin={handleSwitchMode}
                  loading={loading}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal 