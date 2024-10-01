import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, HelpCircle } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.css';
import {invokeBedrockAgent} from "./invokeBedrockAgent";

const callAmazonBedrockAPI = async (message) => {
  console.log('Calling Amazon Bedrock API with message:', message);

  try {
    const apiCall = invokeBedrockAgent(message, "123");
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API call took too long')), 10000)
    );

    const result = await Promise.race([apiCall, timeout]);
    console.log(result);

    return result.completion;
  } catch (error) {
    console.error('Error calling Amazon Bedrock API:', error.message);
    // throw error;
  }
};



const ChatbotUI = () => {
  const [messages, setMessages] = useState([{ text: 'Hi there! I am a chat bot that can engage in a conversation with you!', sender: 'bot' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

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
        setLoadingText(`Loading${dots}`);
      }, 500);
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






  return (
      <div className={` flex flex-col h-screen bg-[#ffdee1] font-['Lora', 'Times New Roman', serif] transition-all duration-500 no-scroll ${isSidebarOpen && window.innerWidth >= 768? 'pr-32' : ''}`}>
        <div
            className="absolute top-0 left-0 right-0 text-center p-4 text-2xl font-bold text-[#53212b] transition-opacity duration-300 z-10"
            style={{opacity: titleOpacity, fontFamily: 'Lora, sans-serif'}}
        >
          Valorant Chatbot
        </div>


        <div
            className={`absolute top-4 right-4 z-20 flex flex-col transition-all duration-500 ${isSidebarOpen && window.innerWidth >= 768? 'pr-32' : ''} z-20`}>
          <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-[#fd4556] bg-opacity-50 rounded-md mb-2"
          >
            <Menu size={24} color="#53212b"/>
          </button>
          <button
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              className="p-2 bg-[#fd4556] bg-opacity-50 rounded-md"
          >
            <HelpCircle size={24} color="#53212b"/>
          </button>
        </div>

        {/* Sidebar for desktop */}
        <div
            className={`fixed inset-y-0 right-0 transform transition-transform duration-500 ease-in-out z-30 bg-[#bd3944] bg-opacity-90 p-4 ${isSidebarOpen && window.innerWidth >= 768 ? 'translate-x-0' : 'translate-x-full'} hidden md:block`}>
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4">
            <X size={24} color="white"/>
          </button>
          <h2 className="text-white text-xl mb-4">Menu</h2>
          <ul>
            <li className="text-white mb-2 cursor-pointer">Page 1</li>
            <li className="text-white mb-2 cursor-pointer">Page 2</li>
            <li className="text-white mb-2 cursor-pointer">Page 3</li>
          </ul>
        </div>

        {/* Popup menu for mobile */}
        {isSidebarOpen && (
            <div className="fixed inset-0 z-40 bg-[#bd3944] bg-opacity-90 p-4 block md:hidden">
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4">
                <X size={24} color="white"/>
              </button>
              <h2 className="text-white text-xl mb-4">Menu</h2>
              <ul>
                <li className="text-white mb-2 cursor-pointer">Page 1</li>
                <li className="text-white mb-2 cursor-pointer">Page 2</li>
                <li className="text-white mb-2 cursor-pointer">Page 3</li>
              </ul>
            </div>
        )}

        {isHelpOpen && (
            <div className="fixed top-16 right-16 w-64 bg-[#bd3944] bg-opacity-90 p-4 rounded-md z-30">
              <button onClick={() => setIsHelpOpen(false)} className="absolute top-2 right-2">
                <X size={18} color="white"/>
              </button>
              <h3 className="text-white text-lg mb-2">How to use:</h3>
              <p className="text-white text-sm">Type your message in the input box and press enter or click the send
                button to chat with the Valorant bot.</p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto no-scroll p-4 pt-16" ref={chatContainerRef}>
          <div className="mt-5">
            {/*placeholder margin*/}
          </div>
          {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user' ? 'bg-white text-[#53212b] shadow' : 'bg-[#fd4556] bg-opacity-20 text-[#53212b]'
                }`}>
                  {message.text}
                </div>
              </div>
          ))}
          {isLoading && (
              <div className="">
                <span
                    className="inline-block p-2 bg-[#fd4556] bg-opacity-20 rounded-lg text-[#53212b]">{loadingText}</span>
              </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        <div className="p-4">
          <div className="flex items-center">
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bd3944] bg-transparent border-b border-[#bd3944] text-[#53212b]"
                disabled={isLoading}
            />
            <button
                onClick={handleSendMessage}
                className={`ml-2 p-2 text-[#bd3944] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#bd3944] ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#53212b]'
                }`}
                disabled={isLoading}
            >
              <Send size={24}/>
            </button>
          </div>
        </div>
      </div>
  );
};

export default ChatbotUI;
