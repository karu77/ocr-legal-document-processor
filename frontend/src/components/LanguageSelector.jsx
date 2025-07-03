import React, { useState, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import { 
  ChevronUpDownIcon, 
  CheckIcon, 
  MagnifyingGlassIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const LanguageSelector = ({ selectedLanguage, onLanguageChange, allLanguages }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const languages = allLanguages || [
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

  // Determine the currently selected language, defaulting to the first language if selectedLanguage is undefined
  const selectedLang = selectedLanguage || languages[0];

  const filteredLanguages = searchQuery
    ? languages.filter(lang => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : languages

  return (
    <Listbox value={selectedLanguage} onChange={onLanguageChange} by="name">
      <div className="relative">
        <Listbox.Button 
          className="group relative w-full flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl py-2 sm:py-3 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base cursor-pointer touch-manipulation"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <motion.span 
              className="text-lg sm:text-2xl flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {selectedLang.flag}
            </motion.span>
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate text-sm sm:text-base">
                {selectedLang.name}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 block truncate">
                {selectedLang.region}
              </span>
            </div>
          </div>
          <span className="flex items-center pl-1 sm:pl-2">
            <ChevronUpDownIcon
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-[99] mt-1 sm:mt-2 w-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-2xl max-h-72 sm:max-h-80 rounded-xl border border-gray-200 dark:border-gray-700 py-1 text-base ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none text-sm sm:text-base card-glow">
            {/* Search Input */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Language Options */}
            <div className="max-h-48 sm:max-h-64 overflow-auto">
              {filteredLanguages.length === 0 ? (
                <div className="px-3 sm:px-4 py-4 sm:py-6 text-center text-gray-500 dark:text-gray-400">
                  <GlobeAltIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs sm:text-sm">No languages found</p>
                </div>
              ) : (
                filteredLanguages.map((language, languageIdx) => (
                  <Listbox.Option
                    key={language.code}
                    value={language}
                    className={({ active }) =>
                      clsx(
                        'relative cursor-default select-none mx-1 sm:mx-2 my-0.5 sm:my-1 rounded-lg transition-all duration-200 touch-manipulation',
                        active 
                          ? 'bg-blue-100/70 dark:bg-blue-800/40 text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )
                    }
                  >
                    {({ selected, active }) => (
                      <div
                        className={clsx(
                          'flex items-center space-x-2 sm:space-x-3 py-2 sm:py-2.5 px-2 sm:px-3',
                          selected ? 'font-semibold' : 'font-normal'
                        )}
                      >
                        <motion.span 
                          className="text-base sm:text-xl flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {language.flag}
                        </motion.span>
                        <div className="flex-1 min-w-0">
                          <span className={clsx(
                            'block truncate text-sm sm:text-base',
                            selected ? 'font-bold' : 'font-medium'
                          )}>
                            {language.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                            {language.region}
                          </span>
                        </div>
                        {selected && (
                          <motion.span 
                            className="flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckIcon 
                              className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-300" 
                              aria-hidden="true" 
                            />
                          </motion.span>
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
              {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} available
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default LanguageSelector