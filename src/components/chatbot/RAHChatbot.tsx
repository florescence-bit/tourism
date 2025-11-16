'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, X, MessageCircle, Loader } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * RAH Tourist Guide Chatbot Component
 * AI-powered chatbot specialized in Indian tourism guidance
 * Uses OpenAI API for intelligent responses
 */
export default function RAHChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'नमस्ते! 👋 Welcome to RAH Tourist Guide. I\'m your AI-powered Indian tourism specialist. Ask me anything about Indian destinations, cultural sites, safety tips, local transportation, food recommendations, and travel planning!',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the API route
      const response = await fetch('/api/chatbot/rah-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[RAHChatbot] Error:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please check your Gemini API configuration and try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white z-40 animate-pulse"
          aria-label="Open RAH Chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-surface-primary border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-accent-blue to-accent-purple p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  RAH
                </span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">RAH Tourist Guide</h3>
                <p className="text-xs text-blue-100">Indian Tourism Expert</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition text-white"
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-secondary/30">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-accent-blue text-white rounded-br-none'
                      : 'bg-surface-secondary text-text-primary rounded-bl-none border border-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user'
                      ? 'text-blue-100'
                      : 'text-text-tertiary'
                  }`}>
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-secondary text-text-primary px-4 py-2 rounded-lg rounded-bl-none border border-gray-700 flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">RAH is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-surface-secondary">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about Indian tourism..."
                disabled={isLoading}
                className="flex-1 bg-surface-primary border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-text-tertiary focus:outline-none focus:border-accent-blue transition text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-accent-blue hover:bg-accent-blue/80 disabled:bg-gray-700 text-white rounded-lg px-3 py-2 transition flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInput('Tell me about Taj Mahal')}
                className="text-xs bg-surface-primary border border-gray-700 hover:border-accent-blue text-text-secondary hover:text-accent-blue rounded px-2 py-1 transition"
              >
                🕌 Taj Mahal
              </button>
              <button
                type="button"
                onClick={() => setInput('What\'s the best time to visit India?')}
                className="text-xs bg-surface-primary border border-gray-700 hover:border-accent-blue text-text-secondary hover:text-accent-blue rounded px-2 py-1 transition"
              >
                📅 Best Time
              </button>
              <button
                type="button"
                onClick={() => setInput('Tell me about Indian cuisine')}
                className="text-xs bg-surface-primary border border-gray-700 hover:border-accent-blue text-text-secondary hover:text-accent-blue rounded px-2 py-1 transition"
              >
                🍲 Cuisine
              </button>
              <button
                type="button"
                onClick={() => setInput('Safety tips for tourists in India')}
                className="text-xs bg-surface-primary border border-gray-700 hover:border-accent-blue text-text-secondary hover:text-accent-blue rounded px-2 py-1 transition"
              >
                🛡️ Safety Tips
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
