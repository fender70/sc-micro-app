import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageCircle, FiX, FiMinimize2, FiMaximize2, FiUser, FiZap } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import './ChatInterface.css';

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('/');
  const [userRole, setUserRole] = useState('operator');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: `Hello! I'm your SC Micro Assistant. I can help you with:
          
• Dashboard analysis and metrics
• Creating and managing work requests
• Customer relationship insights
• Project optimization and timelines
• CSV import/export operations
• Navigation and troubleshooting

What would you like to know?`,
          timestamp: new Date(),
          suggestedActions: [
            { action: 'View Dashboard', description: 'See current metrics', route: '/' },
            { action: 'Create Work Request', description: 'Add new request', route: '/add-work-request' },
            { action: 'View Customers', description: 'Customer overview', route: '/customers' }
          ]
        }
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the LangGraph agent API
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          current_page: currentPage,
          user_role: userRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response_message,
        timestamp: new Date(),
        suggestedActions: data.suggested_actions || [],
        followUpQuestions: data.follow_up_questions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedAction = (action) => {
    // Navigate to the suggested route
    if (action.route) {
      window.location.href = action.route;
    }
    
    // Add a system message to show the action taken
    const systemMessage = {
      id: Date.now().toString(),
      type: 'system',
      content: `Navigating to: ${action.action}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleFollowUpQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className={`chat-interface ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        title="Open AI Assistant"
      >
        <FiMessageCircle />
        {!isOpen && <span className="chat-toggle-text">AI Assistant</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-title">
                <FiZap className="chat-icon" />
                <span>SC Micro Assistant</span>
              </div>
              <div className="chat-controls">
                <button 
                  className="chat-control-btn"
                  onClick={clearChat}
                  title="Clear chat"
                >
                  Clear
                </button>
                <button 
                  className="chat-control-btn"
                  onClick={toggleMinimize}
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
                </button>
                <button 
                  className="chat-control-btn"
                  onClick={toggleChat}
                  title="Close chat"
                >
                  <FiX />
                </button>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="chat-messages">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`chat-message ${message.type} ${message.isError ? 'error' : ''}`}
                  >
                    <div className="message-avatar">
                      {message.type === 'user' ? <FiUser /> : <FiZap />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.content}
                      </div>
                      <div className="message-timestamp">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      {/* Suggested Actions */}
                      {message.suggestedActions && message.suggestedActions.length > 0 && (
                        <div className="suggested-actions">
                          <div className="suggested-actions-title">Quick Actions:</div>
                          <div className="suggested-actions-list">
                            {message.suggestedActions.map((action, index) => (
                              <button
                                key={index}
                                className="suggested-action-btn"
                                onClick={() => handleSuggestedAction(action)}
                              >
                                {action.action}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Questions */}
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="follow-up-questions">
                          <div className="follow-up-title">You might also want to ask:</div>
                          <div className="follow-up-list">
                            {message.followUpQuestions.map((question, index) => (
                              <button
                                key={index}
                                className="follow-up-btn"
                                onClick={() => handleFollowUpQuestion(question)}
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && (
                  <div className="chat-message assistant">
                    <div className="message-avatar">
                      <FiZap />
                    </div>
                    <div className="message-content">
                      <div className="loading-indicator">
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="chat-input-container">
                <div className="chat-input-wrapper">
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your SC Micro system..."
                    rows="1"
                    disabled={isLoading}
                  />
                  <button
                    className="send-button"
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <FiSend />
                  </button>
                </div>
                <div className="chat-input-hint">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 