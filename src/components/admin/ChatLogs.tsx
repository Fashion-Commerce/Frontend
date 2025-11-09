import React from "react";
// FIX: Changed import path to be explicit to avoid a path resolution conflict.
import { ChatMessage, MessageSender, AgentType } from "../../types/index";

interface ChatLogsProps {
  messages: ChatMessage[];
}

const getAgentBadgeColor = (agent?: AgentType) => {
  switch (agent) {
    case AgentType.SEARCH:
      return "bg-sky-500";
    case AgentType.ADVISOR:
      return "bg-violet-500";
    case AgentType.ORDER:
      return "bg-teal-500";
    default:
      return "bg-gray-500";
  }
};

const ChatLogs: React.FC<ChatLogsProps> = ({ messages }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Lịch sử Chatbot</h2>
      <div className="bg-white shadow-md rounded-lg p-4 h-[75vh] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === MessageSender.USER ? "flex-row-reverse" : ""}`}
            >
              {msg.sender === MessageSender.BOT && (
                <img
                  src="https://picsum.photos/seed/avatar/40/40"
                  alt="Bot"
                  className="w-10 h-10 rounded-full"
                />
              )}
              {msg.sender === MessageSender.USER && (
                <div className="w-10 h-10 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  U
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-lg ${msg.sender === MessageSender.USER ? "bg-slate-100 text-gray-800" : "bg-gray-100 text-gray-800"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">
                    {msg.sender === MessageSender.BOT
                      ? "AgentFashion AI"
                      : "Người dùng"}
                  </p>
                  {msg.sender === MessageSender.BOT && msg.agent && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full text-white ${getAgentBadgeColor(msg.agent)}`}
                    >
                      {msg.agent}
                    </span>
                  )}
                </div>
                <p className="text-sm">{msg.content}</p>
                {msg.suggestedProducts && (
                  <div className="mt-2 text-xs text-gray-500 italic">
                    [Bot đã đề xuất {msg.suggestedProducts.length} sản phẩm]
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatLogs;
