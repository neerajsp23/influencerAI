'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, User, Bot, Sparkles, Upload, X, FileText, FileSpreadsheet } from 'lucide-react';
import { parseCSV, dataToString, GenericCSVData } from '@/lib/csv-parser';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

interface StoredData {
  messages: Message[];
  csvContext: string;
  uploadedFileName: string;
  isFileLoaded: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvContext, setCsvContext] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const stored = localStorage.getItem('chatData');
        if (stored) {
          const data: StoredData = JSON.parse(stored);
          setMessages(data.messages || []);
          setCsvContext(data.csvContext || '');
          setUploadedFileName(data.uploadedFileName || '');
          setIsFileLoaded(data.isFileLoaded || false);
        }
      } catch (err) {
        console.error('Error loading stored data:', err);
      }
    };

    loadStoredData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const saveData = () => {
      try {
        const data: StoredData = {
          messages,
          csvContext,
          uploadedFileName,
          isFileLoaded
        };
        localStorage.setItem('chatData', JSON.stringify(data));
      } catch (err) {
        console.error('Error saving data:', err);
      }
    };

    saveData();
  }, [messages, csvContext, uploadedFileName, isFileLoaded]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const data = parseCSV(csvText);
        const contextString = dataToString(data);
        setCsvContext(contextString);
        setUploadedFileName(file.name);
        setIsFileLoaded(true);
        setError('');
        setMessages([]); // Clear previous messages when new file is uploaded
      } catch (err) {
        setError('Failed to parse CSV file. Please check the file format.');
        console.error('Error parsing CSV:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setCsvContext('');
    setUploadedFileName('');
    setIsFileLoaded(false);
    setMessages([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear localStorage
    localStorage.removeItem('chatData');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isFileLoaded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim()
    };

    // Append the user message instead of replacing
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: csvContext,
          user_input: userMessage.content,
          conversation_history: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response
      };

      // Append the bot message to the conversation
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Don't remove the user message on error, just show the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              AskCSV
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-11">
            Upload a CSV file and ask questions about your data
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-6" ref={scrollAreaRef}>
            {!isFileLoaded && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  Upload Your CSV File
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-lg mb-8">
                  Upload a CSV file containing your data to start chatting with AI about it.
                </p>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose CSV File
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supported format: CSV files only
                  </p>
                </div>
              </div>
            )}

            {isFileLoaded && messages.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  File Loaded Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-lg mb-8">
                  Your CSV file "{uploadedFileName}" has been loaded. You can now ask questions about your data!
                </p>
                <div className="space-y-4">
                  <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Try asking:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[
                      "What columns are in this dataset?",
                      "Show me the first few rows",
                      "What's the total number of records?",
                      "Summarize the data"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(suggestion)}
                        className="px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] min-w-0 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 min-w-0 ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  } rounded-2xl px-4 py-3 shadow-sm`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="max-w-[85%] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto">
            {/* File Clear Button */}
            {isFileLoaded && (
              <div className="flex justify-end mb-3">
                <Button
                  onClick={handleClearFile}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 text-sm border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear 
                </Button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isFileLoaded ? "Ask a question about your data..." : "Upload a CSV file first..."}
                  disabled={isLoading || !isFileLoaded}
                  className="w-full pl-4 pr-12 py-4 text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 resize-none"
                  style={{ minHeight: '56px' }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim() || !isFileLoaded}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 