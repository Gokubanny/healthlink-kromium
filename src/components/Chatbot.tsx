import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Always use the deployed backend URL
const API_URL = 'https://healthlink-kromium-backend-k5ig.onrender.com/api';

const KromiumChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('kromium-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
        initializeGreeting();
      }
    } else {
      initializeGreeting();
    }
  }, []);

  const initializeGreeting = () => {
    const greeting: Message = {
      id: Date.now().toString(),
      text: "Hi I'm Lola, I'd like to ask some questions about your symptoms to understand how you're feeling and help you get the care you need.\n\nMy responses provides general health information and advice only. It does not give a medical diagnosis or replace an appointment with a medical professional.\n\nDo not use this service:\nIn an emergency (contact emergency services instead)\n\nMedical guidance changes quickly. We aim to give the latest information but this may not always be possible.\n\nThe information given is for Nigerian residents only. If you live outside Nigeria, please follow local or national health advice.\n\nType 'okay' to proceed",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([greeting]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('kromium-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

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

    try {
      console.log('Sending to:', `${API_URL}/api/chat`);
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setIsTyping(false);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I apologize, but I couldn't generate a response.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#E74856] text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold text-lg">Dr. Lola</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'bot' && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                )}
                <div className={`max-w-[75%] ${message.sender === 'user' ? 'bg-[#0F62FE] text-white' : 'bg-white text-gray-800 shadow-sm'} rounded-lg px-4 py-3`}>
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
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type something..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0F62FE] text-sm"
                disabled={isLoading}
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#0F62FE] text-white px-4 py-2 rounded hover:bg-[#0353E9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                aria-label="Send"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IBM Watson Style Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-[#DA1E28] hover:bg-[#BA1B23] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-4 border-white ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Open the chat window"
      >
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 4L22 6 26.586 6 20 12.586 21.414 14 28 7.414 28 12 30 12 30 4 22 4zM28 16v4a1.9965 1.9965 0 01-2 2H20l-4 7 1.7358 1 3.4288-6H26a3.9992 3.9992 0 004-4V16zM4 20V8A1.9965 1.9965 0 016 6H18V4H6A3.9986 3.9986 0 002 8V20a3.9992 3.9992 0 004 4h9V22H6A1.9965 1.9965 0 014 20z" />
        </svg>
      </button>
    </div>
  );
};

export default KromiumChatbot;