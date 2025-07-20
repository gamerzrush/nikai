import React from 'react';
import { Sender, type Message } from '../types';
import { NikAvatar, TypingIndicator } from './Icons';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping = false }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex w-full items-end gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && <NikAvatar className="w-8 h-8 self-end" />}
      <div className={`max-w-xl px-4 py-3 rounded-2xl ${
          isBot 
            ? 'bg-gray-700 text-gray-200 rounded-bl-none'
            : 'bg-blue-600 text-white rounded-br-none'
      }`}>
        {isTyping && message.text.length === 0 ? <TypingIndicator /> : <p className="whitespace-pre-wrap">{message.text}</p>}
      </div>
    </div>
  );
};

export default ChatMessage;