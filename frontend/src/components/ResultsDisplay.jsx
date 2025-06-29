import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  ListBulletIcon, 
  DocumentMagnifyingGlassIcon,
  ClipboardIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  LanguageIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ResultsDisplay = ({ results }) => {
  const [copiedTab, setCopiedTab] = useState('');

  const tabs = [
    { 
      id: 'extracted', 
      name: 'Extracted Text', 
      content: results.ocrText, 
      icon: DocumentTextIcon, 
      color: 'from-blue-500 to-indigo-500',
      description: 'Raw OCR extracted text from documents',
      lang: results.detectedLanguage
    },
    { 
      id: 'cleaned', 
      name: 'Cleaned Text', 
      content: results.cleanedText, 
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-500',
      description: 'AI-enhanced and corrected text'
    },
    { 
      id: 'translated', 
      name: 'Translated Text', 
      content: results.translatedText, 
      icon: GlobeAltIcon,
      color: 'from-green-500 to-teal-500',
      description: 'Document translated to your target language'
    },
    { 
      id: 'summary', 
      name: 'Summary', 
      content: results.summary, 
      icon: DocumentMagnifyingGlassIcon,
      color: 'from-yellow-500 to-orange-500',
      description: 'Concise AI-generated summary'
    },
    { 
      id: 'bullets', 
      name: 'Key Points', 
      content: results.bulletPoints, 
      icon: ListBulletIcon,
      color: 'from-red-500 to-rose-500',
      description: 'Bulleted list of key information'
    },
  ];

  const copyToClipboard = async (content, tabId) => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTab(tabId);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedTab(''), 2000);
    } catch (err) {
      toast.error('Failed to copy text.');
      console.error('Failed to copy: ', err);
    }
  };
  
  const downloadAsFile = (content, filename, tabName) => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${tabName}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Downloading ${tabName} as a file`)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="w-full">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 dark:bg-gray-700 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                disabled={!tab.content}
                className={({ selected }) =>
                  `w-full relative rounded-lg py-2.5 px-3 text-sm font-medium leading-5
                  focus:outline-none transition-all duration-200
                  ${
                    selected
                      ? 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.5] dark:hover:bg-gray-600/[0.5]'
                  }
                  ${!tab.content ? 'opacity-50 cursor-not-allowed' : ''}`
                }
              >
                <div className="flex items-center justify-center">
                  <tab.icon className="w-5 h-5 mr-2" />
                  <span>{tab.name}</span>
                  {tab.id === 'extracted' && tab.lang && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      <LanguageIcon className="w-4 h-4 mr-1" />
                      {tab.lang}
                    </span>
                  )}
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={results.filename} // Re-render when filename changes
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {results.ocrWarning && (
                <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 rounded-r-lg">
                  <div className="flex">
                    <div className="py-1">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    </div>
                    <div>
                      <p className="font-bold">OCR Warning</p>
                      <p className="text-sm">{results.ocrWarning}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Tab.Panels className="mt-2">
            {tabs.map((tab) => (
              <Tab.Panel
                key={tab.id}
                className="rounded-xl bg-white dark:bg-gray-800/50 p-6 min-h-[300px] border border-gray-200 dark:border-gray-700"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab.id + results.filename}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tab.name}</h3>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => copyToClipboard(tab.content, tab.id)}
                          disabled={!tab.content}
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {copiedTab === tab.id ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(tab.content, results.filename, tab.id)}
                          disabled={!tab.content}
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <DocumentArrowDownIcon className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                    {tab.content ? (
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg font-mono max-h-[500px] custom-scrollbar">
                        {tab.content}
                      </pre>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>No content available for this view.</p>
                        <p className="text-xs mt-1">{tab.description}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </motion.div>
  );
};

export default ResultsDisplay; 