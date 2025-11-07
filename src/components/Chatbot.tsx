

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Product } from '@/types';
import { AgentType, MessageSender } from '@/types';
import { SearchAgentIcon, AdvisorAgentIcon, OrderAgentIcon } from '@/components/icons';


interface ChatbotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isBotTyping: boolean;
  onProductClick: (product: Product) => void;
  activeAgent: AgentType;
}

const agentDetails = {
    [AgentType.SEARCH]: { 
        icon: SearchAgentIcon, 
        text: 'Đang tìm kiếm sản phẩm...', 
        color: 'text-sky-500 dark:text-sky-400',
        borderColor: 'border-sky-500 dark:border-sky-400',
        badgeColor: 'bg-sky-500'
    },
    [AgentType.ADVISOR]: { 
        icon: AdvisorAgentIcon, 
        text: 'Đang chuẩn bị lời khuyên...', 
        color: 'text-violet-500 dark:text-violet-400',
        borderColor: 'border-violet-500 dark:border-violet-400',
        badgeColor: 'bg-violet-500'
    },
    [AgentType.ORDER]: { 
        icon: OrderAgentIcon, 
        text: 'Đang xử lý thông tin...', 
        color: 'text-teal-500 dark:text-teal-400',
        borderColor: 'border-teal-500 dark:border-teal-400',
        badgeColor: 'bg-teal-500'
    },
    [AgentType.SYSTEM]: { 
        icon: AdvisorAgentIcon, 
        text: 'AI đang suy nghĩ...', 
        color: 'text-gray-500 dark:text-gray-400',
        borderColor: 'border-gray-500 dark:border-gray-400',
        badgeColor: 'bg-gray-500'
    }
};

const getAgentDetails = (agent?: AgentType) => {
    return agentDetails[agent || AgentType.SYSTEM];
}


const AgentTypingIndicator: React.FC<{ activeAgent: AgentType }> = ({ activeAgent }) => {
    const activeDetails = getAgentDetails(activeAgent);
    const allAgents = [AgentType.SEARCH, AgentType.ADVISOR, AgentType.ORDER];

    return (
        <>
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.9); opacity: 1; }
                    80%, 100% { transform: scale(1.8); opacity: 0; }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>
             <div className="flex items-end gap-2 justify-start">
                <img src="https://picsum.photos/seed/avatar/32/32" alt="Bot Avatar" className="w-8 h-8 rounded-full" />
                <div className="max-w-xs md:max-w-md rounded-2xl px-4 py-3 bg-gray-200 dark:bg-slate-700 rounded-bl-none">
                    <div className="flex justify-center items-center space-x-6">
                        {allAgents.map(agent => {
                           const details = getAgentDetails(agent);
                           const Icon = details.icon;
                           const isActive = agent === activeAgent;
                           return (
                               <div key={agent} className={`relative flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                   <Icon className={`w-7 h-7 ${isActive ? details.color : 'text-gray-500 dark:text-gray-400'}`} />
                                   {isActive && <div className={`absolute w-10 h-10 rounded-full border-2 ${details.borderColor} animate-pulse-ring`}></div>}
                               </div>
                           );
                        })}
                    </div>
                    <p className="text-xs text-center italic text-gray-600 dark:text-gray-400 mt-2.5">{activeDetails.text}</p>
                </div>
              </div>
        </>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ messages, onSendMessage, isBotTyping, onProductClick, activeAgent }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div id="chatbot-panel" className="w-full md:w-1/3 lg:w-1/4 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-lg">
      <div className="p-4 border-b border-slate-700 flex items-center space-x-3 bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <div className="relative">
            <img src="https://picsum.photos/seed/avatar/40/40" alt="Chatbot Avatar" className="w-10 h-10 rounded-full border-2 border-white" />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-800"></span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">AgentFashion AI</h2>
          <p className="text-sm text-slate-300">Online</p>
        </div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === MessageSender.BOT && <img src="https://picsum.photos/seed/avatar/32/32" alt="Bot Avatar" className="w-8 h-8 rounded-full self-start flex-shrink-0" />}
            <div className={`flex flex-col items-start ${msg.sender === MessageSender.USER ? 'items-end' : ''}`}>
              <div className={`
                max-w-xs md:max-w-md rounded-2xl px-4 py-2 
                ${msg.sender === MessageSender.USER 
                    ? 'bg-slate-600 text-white rounded-br-none' 
                    : `bg-gray-200 text-gray-800 rounded-bl-none dark:bg-slate-700 dark:text-gray-200 border-l-4 ${getAgentDetails(msg.agent).borderColor}`
                }
              `}>
                 {msg.sender === MessageSender.BOT && msg.agent && (
                   <span className={`px-2 py-0.5 text-xs rounded-full text-white mb-2 inline-block ${getAgentDetails(msg.agent).badgeColor}`}>
                        {msg.agent}
                   </span>
               )}
                <p className="text-sm">{msg.content}</p>
                {msg.suggestedProducts && (
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {msg.suggestedProducts.map(p => (
                      <div key={p.id} onClick={() => onProductClick(p)} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-600">
                        <img src={p.imageUrls[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                        <div>
                          <p className="text-xs font-semibold dark:text-gray-200">{p.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">{formatPrice(p.basePrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isBotTyping && <AgentTypingIndicator activeAgent={activeAgent} />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Bạn cần tìm gì?"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
          />
          <button type="submit" className="bg-slate-600 text-white p-2 rounded-full hover:bg-slate-700 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;