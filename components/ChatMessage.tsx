import React from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9?bundle';
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle';
import { Sender, type Message } from '../types';
import { NikAvatar, TypingIndicator, FileIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping = false }) => {
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`group flex w-full items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && <NikAvatar className="w-8 h-8 self-end" />}
      <div className={`flex flex-col gap-2 max-w-xl ${isBot ? 'items-start' : 'items-end'}`}>
        {message.file && (
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 max-w-xs">
             {message.file.type.startsWith('image/') ? (
                <img src={message.file.url} alt={message.file.name} className="max-w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-600" />
             ) : (
                <div className="p-3 bg-white dark:bg-slate-700">
                    <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                        <FileIcon className="w-8 h-8 flex-shrink-0 text-slate-500" />
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{message.file.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{message.file.type}</p>
                        </div>
                    </div>
                </div>
             )}
          </div>
        )}
        {(message.text || (isTyping && message.text.length === 0)) && (
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
              isBot 
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                : 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-none'
          }`}>
            {isTyping && message.text.length === 0 ? (
              <TypingIndicator />
            ) : (
               <div className="markdown-content whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);