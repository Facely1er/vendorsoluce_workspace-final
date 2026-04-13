import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePageContext } from '../../hooks/usePageContext';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChatbot } from '../../hooks/useChatbot';
import './ChatWidget.css';
import { logger } from '../../utils/logger';

interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  initialMessage?: string;
  context?: {
    page: string;
    feature?: string;
    userRole?: string;
  };
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  isOpen: controlledIsOpen, 
  onToggle, 
  initialMessage,
  context: propContext 
}) => {
  const { user, profile } = useAuth();
  const pageContext = usePageContext();
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    loadChatHistory
  } = useChatbot({
    userId: user?.id,
    context: {
      ...pageContext,
      ...propContext,
      userRole: profile?.role,
      companySize: profile?.company_size,
      industry: profile?.industry
    }
  });

  // Handle controlled vs uncontrolled state
  const actualIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const actualOnToggle = onToggle || setIsOpen;

  useEffect(() => {
    if (actualIsOpen && initialMessage) {
      sendMessage(initialMessage);
    }
  }, [actualIsOpen, initialMessage, sendMessage]);

  useEffect(() => {
    if (actualIsOpen && user?.id) {
      loadChatHistory();
    }
  }, [actualIsOpen, user?.id, loadChatHistory]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    setIsTyping(true);
    try {
      await sendMessage(message);
    } catch (err) {
      logger.error('Failed to send message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggle = () => {
    const newState = !actualIsOpen;
    actualOnToggle(newState);
    if (newState && user?.id) {
      loadChatHistory();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!actualIsOpen) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="chat-widget-fab fixed bottom-24 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200/90 bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition-colors hover:border-gray-300 hover:bg-gray-50/95 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vendorsoluce-green dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white motion-safe:transition-[colors,box-shadow] max-[480px]:bottom-28"
        aria-label="Open in-app help"
        title="In-app help"
      >
        <MessageCircle className="h-[18px] w-[18px] shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <div
      className={`chat-widget fixed bottom-24 right-5 z-50 max-[480px]:bottom-28 rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50/90 p-4 dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-vendorsoluce-green/90">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">In-app help</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isTyping ? 'Preparing a reply…' : 'Guidance and shortcuts'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={isMinimized ? 'Expand help panel' : 'Minimize help panel'}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4 text-gray-500" />
            ) : (
              <Minimize2 className="h-4 w-4 text-gray-500" />
            )}
          </button>
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Close in-app help"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]"
          >
            <MessageList 
              messages={messages} 
              isLoading={isLoading}
              isTyping={isTyping}
              onSuggestionClick={handleSendMessage}
            />
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-600 dark:text-red-400 text-xs underline mt-1"
                >
                  Try refreshing the page
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading || isTyping}
              placeholder="Ask for guidance about VendorSoluce…"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
