import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { type Message, Sender } from './types';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: "AIzaSyAW_bzbb-GTMRzzy4ai9UlyWarJ1VIctiE" });
        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are Nik, a friendly and helpful AI assistant. Your responses should be concise, informative, and have a positive tone. Format your responses with markdown where appropriate.",
          },
        });
        setChat(chatSession);
        setMessages([
          {
            id: 'init-message',
            sender: Sender.BOT,
            text: "Hello! I'm Nik, your friendly AI assistant. How can I help you today?",
          },
        ]);
      } catch (e) {
        console.error("Failed to initialize AI Chat:", e);
        setMessages([
          {
            id: 'error-message',
            sender: Sender.BOT,
            text: "Sorry, I couldn't connect to my brain right now. There might be an issue with the API key or network connection. Please refresh the page to try again.",
          },
        ]);
        setIsLoading(true); // Disable input on error
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (prompt: string) => {
    if (isLoading || !prompt.trim() || !chat) return;

    const userMessage: Message = { id: Date.now().toString(), text: prompt, sender: Sender.USER };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = { id: botMessageId, text: '', sender: Sender.BOT };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
        const stream = await chat.sendMessageStream({ message: prompt });
        
        let fullResponse = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            setMessages(prev => prev.map(msg => 
                msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
            ));
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: 'An error occurred. Please try again.' } : msg
        ));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto pt-20 pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg}
              isTyping={isLoading && msg.sender === Sender.BOT && msg.id === messages[messages.length-1].id}
            />
          ))}
        </div>
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;