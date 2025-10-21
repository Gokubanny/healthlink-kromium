// ============================================
// FILE: src/components/Chatbot.tsx (UPDATED)
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const KromiumChatbot = () => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastRequestTime = useRef<number>(0);

  // Load chat history from backend when user opens chat
  useEffect(() => {
    if (isOpen && isAuthenticated && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, isAuthenticated]);

  // Initialize greeting for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated && messages.length === 0) {
      initializeGreeting();
    }
  }, [isAuthenticated]);

  const loadChatHistory = async () => {
    try {
      console.log('📜 Loading chat history from backend...');
      const response = await api.get('/chat/history');
      
      if (response.data.success && response.data.messages.length > 0) {
        const loadedMessages = response.data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        console.log(`✅ Loaded ${loadedMessages.length} messages from backend`);
      } else {
        // No history, show greeting
        initializeGreeting();
      }
      setHistoryLoaded(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
      initializeGreeting();
      setHistoryLoaded(true);
    }
  };

  const initializeGreeting = () => {
    const greeting: Message = {
      id: Date.now().toString(),
      text: "👋 Hi, I'm Kromium Assistant! I can help you with your healthcare questions, booking a consultation, or learning about our services.\n\nI provide general health information and advice only. For medical emergencies, please contact emergency services immediately.",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([greeting]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || rateLimitCooldown) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Please sign in to use the chat assistant. This helps us provide you with personalized healthcare support.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Enforce minimum 1 second delay between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < 1000) {
      const waitTime = 1000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsLoading(true);
    lastRequestTime.current = Date.now();

    try {
      console.log('Sending to:', '/chat');
      
      const endpoint = isAuthenticated ? '/chat' : '/chat/guest';
      const response = await api.post(endpoint, { 
        message: userMessage.text 
      });

      console.log('Response status:', response.status);

      if (response.status === 429) {
        setRateLimitCooldown(true);
        setIsTyping(false);
        
        const cooldownMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm receiving many requests right now. Please wait 10 seconds before sending another message. ⏳",
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, cooldownMessage]);
        
        setTimeout(() => {
          setRateLimitCooldown(false);
        }, 10000);
        
        setIsLoading(false);
        return;
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Server error');
      }

      const data = response.data;
      console.log('Response data:', data);
      
      setIsTyping(false);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I apologize, but I couldn't generate a response.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      console.log('✅ Chat message saved to backend');
      
    } catch (error: any) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      let errorText = "Sorry, I'm having trouble connecting. Please try again later.";
      
      if (error.response?.status === 401) {
        errorText = "Your session has expired. Please sign in again to continue chatting.";
      } else if (error.response?.data?.message) {
        errorText = error.response.data.message;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = async () => {
    if (!isAuthenticated) {
      setMessages([]);
      initializeGreeting();
      return;
    }

    try {
      await api.delete('/chat/history');
      setMessages([]);
      initializeGreeting();
      console.log('✅ Chat history cleared from backend');
    } catch (error) {
      console.error('Error clearing chat history:', error);
      // Still clear locally even if backend fails
      setMessages([]);
      initializeGreeting();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
          {/* Header */}
          <div className="bg-[#E74856] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10c0-1.777.833-3.357 2.125-4.418a5 5 0 005.75 0A5.986 5.986 0 0015 10a5.986 5.986 0 00-.454-1.084A5 5 0 0010 11z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Kromium Assistant</h3>
                <p className="text-xs text-white/80">
                  {isAuthenticated ? `Hello, ${user?.firstName}!` : 'Healthcare Support'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChatHistory}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                title="Clear chat history"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-[#E74856] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                )}
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'bg-[#0F62FE] text-white' : 'bg-white text-gray-800 shadow-sm'} rounded-lg px-4 py-3 border border-gray-100`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-[#E74856] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-[#E74856] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#E74856] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#E74856] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t rounded-b-lg">
            {!isAuthenticated && (
              <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                ⚠️ Please sign in to use the chat assistant
              </div>
            )}
            {rateLimitCooldown && (
              <div className="mb-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                ⏳ Please wait 10 seconds before sending another message
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAuthenticated ? "Ask about healthcare..." : "Sign in to chat..."}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F62FE] focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || rateLimitCooldown || !isAuthenticated}
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || rateLimitCooldown || !isAuthenticated}
                className="bg-[#0F62FE] text-white px-4 py-2 rounded-lg hover:bg-[#0353E9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[60px] justify-center"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              {rateLimitCooldown ? 'Cooling down...' : 
               !isAuthenticated ? 'Sign in to start chatting' :
               'Ask me about healthcare, appointments, or Kromium Health services'}
            </div>
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#E74856] hover:bg-[#c53d49] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-4 border-white ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Open Kromium Assistant"
      >
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <path d="M7 9h10v2H7zm0 4h7v2H7z"/>
        </svg>
      </button>
    </div>
  );
};

export default KromiumChatbot;