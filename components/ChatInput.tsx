import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSendMessage(prompt);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 py-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Nik anything..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-full py-3 px-5 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex-shrink-0 bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </footer>
  );
};

export default ChatInput;