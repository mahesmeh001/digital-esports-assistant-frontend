import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, HelpCircle, Trash2 } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';
import { invokeBedrockAgent } from "./invokeBedrockAgent";

const callAmazonBedrockAPI = async (message) => {
  console.log('Calling Amazon Bedrock API with message:', message);

  try {
    const apiCall = invokeBedrockAgent(message, "123");
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API call took too long')), 1200000)
    );

    const result = await Promise.race([apiCall, timeout]);
    console.log(result);

    return result.completion.replace(/\n/g, '<br />');
  } catch (error) {
    console.error('Error calling Amazon Bedrock API:', error.message);
    // throw error;
  }
};

const ChatbotUI = () => {
  const [messages, setMessages] = useState([{ text: 'Hey there! Ready to build a winning team and dominate the VCT? Ask me anything to get started, and let\'s craft your path to victory!', sender: 'bot' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Clear conversation handler
  const handleClearConversation = () => {
    setMessages([{ text: 'Hey there! Ready to build a winning team and dominate the VCT? Ask me anything to get started, and let\'s craft your path to victory!', sender: 'bot' }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    document.title = 'AimBot';
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = chatContainerRef.current.scrollTop;
      const newOpacity = Math.max(0, 1 - scrollPosition / 100);
      setTitleOpacity(newOpacity);
    };

    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isLoading) {
      let dots = '';
      const interval = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : '';
        setLoadingText(`.${dots}`);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setIsLoading(true);
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');

      try {
        const response = await callAmazonBedrockAPI(inputMessage);
        setMessages(prevMessages => [...prevMessages, { text: response, sender: 'bot' }]);
      } catch (error) {
        console.error('Error calling Amazon Bedrock API:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Sorry, there was an error processing your request.', sender: 'bot' }]);
      } finally {
        setIsLoading(false);
        setLoadingText('');
      }
    }
  };

  // Inverted Valorant logo SVG component
  const ValorantLogo = () => (
      <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
        <path d="M50 100L0 50h25l25 25 25-25h25L50 100z" />
      </svg>
  );

  return (

      <div className="flex flex-col h-[100dvh] bg-[#0F1923] font-['Lora', 'Times New Roman', serif] transition-all duration-500 text-[#ECE8E1]">
        <div
            className="absolute top-0 left-0 right-0 text-center p-4 text-2xl font-bold transition-opacity duration-300 z-10"
            style={{opacity: titleOpacity}}
        >
          AimBot
          <div
              className="mt-2 text-lg font-medium text-gray-100 italic"
          >
            Your tactical edge in VCT team building
          </div>
        </div>


        {/* Control buttons */}
        <div
            className={`absolute top-4 right-4 z-20 flex flex-col gap-2 transition-all duration-500 ${isSidebarOpen && window.innerWidth >= 768 ? 'pr-32' : ''}`}>
          <button
              onClick={handleClearConversation}
              className="p-2 bg-[#FF4655] bg-opacity-80 rounded-md hover:bg-opacity-100 transition-all"
          >
            <Trash2 size={24} className="text-[#ECE8E1]" />
          </button>
          <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-[#FF4655] bg-opacity-80 rounded-md hover:bg-opacity-100 transition-all"
          >
            <Menu size={24} className="text-[#ECE8E1]" />
          </button>
          <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-2 bg-[#FF4655] bg-opacity-80 rounded-md hover:bg-opacity-100 transition-all"
          >
            <HelpCircle size={24} className="text-[#ECE8E1]" />
          </button>
        </div>

        {/* Sidebar for desktop */}
        <div
            className={`fixed inset-y-0 right-0 transform transition-transform duration-500 ease-in-out z-30 bg-[#1F2731] p-4 ${
                isSidebarOpen && window.innerWidth >= 768 ? 'translate-x-0' : 'translate-x-full'
            } hidden md:block`}
        >
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4">
            <X size={24} className="text-[#ECE8E1]" />
          </button>
          <h2 className="text-[#ECE8E1] text-xl mb-4">Menu</h2>
          <ul>
            <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 1</li>
            <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 2</li>
            <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 3</li>
          </ul>
        </div>

        {/* Popup menu for mobile */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-40 bg-[#1F2731] p-4 block md:hidden">
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4">
                <X size={24} className="text-[#ECE8E1]" />
              </button>
              <h2 className="text-[#ECE8E1] text-xl mb-4">Menu</h2>
              <ul>
                <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 1</li>
                <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 2</li>
                <li className="text-[#ECE8E1] mb-2 cursor-pointer hover:text-[#FF4655]">Page 3</li>
              </ul>
            </div>
        )}

        {/* Help popup */}
        {isHelpOpen && (
            <div className="fixed top-16 right-16 w-64 bg-[#1F2731] p-4 rounded-md z-30">
              <button onClick={() => setIsHelpOpen(false)} className="absolute top-2 right-2">
                <X size={18} className="text-[#ECE8E1]" />
              </button>
              <h3 className="text-[#ECE8E1] text-lg mb-2">How to use:</h3>
              <p className="text-[#ECE8E1] text-sm">
                Type your message in the input box and press enter or click the send button to chat with the Valorant bot.
              </p>
            </div>
        )}

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-4 pt-16" ref={chatContainerRef}>
          <div className="mt-20" />
          {messages.map((message, index) => (
              <div key={index} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start items-center'}`}>
                {message.sender === 'bot' && (
                    <div className="mr-2">
                      <ValorantLogo />
                    </div>
                )}
                <div
                    className={`p-3 max-w-[80%] ${
                        message.sender === 'user'
                            ? 'bg-[#FF4655] text-[#ECE8E1] clip-path-message-user'
                            : 'bg-[#1F2731] text-[#ECE8E1] clip-path-message-bot'
                    }`}
                    dangerouslySetInnerHTML={{__html: message.text}}
                />
              </div>
          ))}
          {isLoading && (
              <div className="flex items-center">
                <div className="mr-2">
                  <ValorantLogo />
                </div>
                <span className="p-2 bg-[#1F2731] rounded-lg text-[#ECE8E1]">{loadingText}</span>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-[#1F2731] safe-area-bottom">
          <div className="flex items-center">
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4655] bg-[#0F1923] text-[#ECE8E1] border-b border-[#FF4655]"
                disabled={isLoading}
            />
            <button
                onClick={handleSendMessage}
                className={`ml-2 p-2 text-[#FF4655] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4655] ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#ECE8E1]'
                }`}
                disabled={isLoading}
            >
              <Send size={24} />
            </button>
          </div>
        </div>

        {/* Styles */}
        <style jsx>{`
        .clip-path-message-user {
          //clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%);
          //border-radius: 8px;
        }
        
        .clip-path-message-bot {
          //clip-path: polygon(0 0, 100% 0, 100% 100%, 5% 100%, 0 85%);
          //border-radius: 8px;
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
      </div>
  );
};

export default ChatbotUI;