import React, { useState } from 'react';
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  GlobeAltIcon, 
  ListBulletIcon, 
  DocumentMagnifyingGlassIcon,
  ClipboardIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ResultsDisplay = ({ results }) => {
  const [copiedTab, setCopiedTab] = useState('');
  const [activeTab, setActiveTab] = useState('extracted');

  const tabs = [
    { 
      id: 'extracted', 
      name: 'Extracted Text', 
      shortName: 'OCR',
      content: results.ocrText, 
      icon: DocumentTextIcon,
      description: 'Raw OCR extracted text from documents',
      lang: results.detectedLanguage
    },
    { 
      id: 'cleaned', 
      name: 'Cleaned Text',
      shortName: 'Clean',
      content: results.cleanedText, 
      icon: SparklesIcon,
      description: 'AI-enhanced and corrected text'
    },
    { 
      id: 'translated', 
      name: 'Translated Text',
      shortName: 'Translate',
      content: results.translatedText, 
      icon: GlobeAltIcon,
      description: 'Document translated to your target language'
    },
    { 
      id: 'summary', 
      name: 'Summary',
      shortName: 'Summary',
      content: results.summary, 
      icon: DocumentMagnifyingGlassIcon,
      description: 'Concise AI-generated summary'
    },
    { 
      id: 'bullets', 
      name: 'Key Points',
      shortName: 'Points',
      content: results.bulletPoints, 
      icon: ListBulletIcon,
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
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${tabName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${tabName} as a file`);
  };

  const availableTabs = tabs.filter(tab => tab.content);
  const hasContent = availableTabs.length > 0;
  const activeTabContent = availableTabs.find(tab => tab.id === activeTab);

  console.log('ResultsDisplay: availableTabs', availableTabs);
  console.log('ResultsDisplay: hasContent', hasContent);

  if (!hasContent) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No results yet</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Upload a document and start processing to see results here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <nav className="flex w-full overflow-x-auto" aria-label="Tabs">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative min-w-max px-4 py-4 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10 focus:outline-none
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="flex-shrink-0 h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.id === 'extracted' && tab.lang && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      {tab.lang}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTabContent && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {activeTabContent.content || 'No content available'}
              </pre>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => copyToClipboard(activeTabContent.content, activeTabContent.id)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {copiedTab === activeTabContent.id ? (
                  <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                ) : (
                  <ClipboardIcon className="w-4 h-4 mr-1.5" />
                )}
                Copy
              </button>
              <button
                onClick={() => downloadAsFile(activeTabContent.content, results.filename, activeTabContent.name)}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-1.5" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay; 