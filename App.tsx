<<<<<<< HEAD

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat, Part, Content } from '@google/genai';
import { type Message, Sender, type FileAttachment, type ChatSession } from './types';
import Header from './components/Header';
import SettingsMenu from './components/SettingsMenu';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { ScrollDownIcon } from './components/Icons';

// Constants
const LOCAL_STORAGE_KEY = 'nik-ai-chat-sessions';
const AI_NAME = 'Nik';
const CREATOR_NAME = 'Nikshith';
const INITIAL_MESSAGE_TEXT = `Hey, I'm ${AI_NAME}. How can I help you today?`;
const DEFAULT_CHAT_TITLE = "New Chat";

// Utility Functions
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Main App Component
export type ModelQuality = 'fast' | 'quality';

const App: React.FC = () => {
    // State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modelQuality, setModelQuality] = useState<ModelQuality>('fast');
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refs
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(false);
    const stopStreamController = useRef(new AbortController());

    // Initialize AI Client
    // The API key is obtained exclusively from the environment variable process.env.API_KEY.
    const aiClient = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);

    // Memoized Derived State
    const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);
    const messages = useMemo(() => {
        const baseMessages = activeSession?.messages || [];
        return streamingMessage ? [...baseMessages, streamingMessage] : baseMessages;
    }, [activeSession, streamingMessage]);

    // Effects
    useEffect(() => {
        // Load sessions from localStorage
        const savedSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            if (savedSessions) {
                const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
                if(parsedSessions.length > 0) {
                    setSessions(parsedSessions);
                    setActiveSessionId(parsedSessions[0].id);
                } else {
                   startNewChat();
                }
            } else {
                startNewChat();
            }
        } catch (error) {
            console.error("Failed to parse sessions from localStorage, starting fresh.", error);
            startNewChat();
        }
    }, []);

    const initializeChat = useCallback((session: ChatSession) => {
        const modelName = 'gemini-2.5-flash';
        const config: any = {
            systemInstruction: `You are ${AI_NAME}, a conversational AI. Your creator is ${CREATOR_NAME}. Your responses should be direct and natural. Avoid mentioning you are an AI. Use markdown for formatting.`,
        };
        if (modelQuality === 'fast') config.thinkingConfig = { thinkingBudget: 0 };

        const history: Content[] = session.messages
            .slice(1)
            .flatMap(msg => {
                const parts: Part[] = [];
                if(msg.text) parts.push({text: msg.text});
                // Note: File history is not supported in the same way, but text is.
                // We show files in the UI, but only text is part of the API history.
                return [{ role: msg.sender === Sender.USER ? 'user' : 'model', parts }];
            });
        
        chatRef.current = aiClient.chats.create({ model: modelName, config, history });
    }, [aiClient, modelQuality]);

     const startNewChat = useCallback(() => {
        const newSession: ChatSession = {
            id: crypto.randomUUID(),
            title: DEFAULT_CHAT_TITLE,
            messages: [{ id: crypto.randomUUID(), sender: Sender.BOT, text: INITIAL_MESSAGE_TEXT }],
            createdAt: Date.now(),
        };
        setSessions(prev => [newSession, ...prev.filter(s => s.messages.length > 1)]);
        setActiveSessionId(newSession.id);
        setIsLoading(false);
        shouldAutoScroll.current = true;
    }, []);
    
    const generateTitleForSession = useCallback(async (session: ChatSession) => {
        if (session.messages.length < 2) return;
        const conversation = session.messages.slice(1, 3).map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `Generate a very short, concise title (4-5 words max) for the following conversation:\n\n${conversation}`;
        
        try {
            const response = await aiClient.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const newTitle = response.text.trim().replace(/^"|"$/g, '');
            if(newTitle) {
                 setSessions(prev => prev.map(s => s.id === session.id ? { ...s, title: newTitle } : s));
            }
        } catch (error) {
            console.error("Failed to generate title:", error);
        }
    }, [aiClient]);

    useEffect(() => {
        if (activeSession) {
            initializeChat(activeSession);
        }
    }, [activeSessionId, modelQuality, initializeChat]);

    useEffect(() => {
        const sessionToSave = sessions.filter(s => s.messages.length > 1 || s.id === activeSessionId);
        if (sessionToSave.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessionToSave));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
        
        if (activeSession?.title === DEFAULT_CHAT_TITLE && activeSession.messages.length === 3) {
            generateTitleForSession(activeSession);
        }

    }, [sessions, activeSession, generateTitleForSession]);
    
    useEffect(() => {
        if (shouldAutoScroll.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    useEffect(() => {
        const mainContent = document.getElementById('main-content');
        const throttledScroll = throttle(handleScroll, 100);

        if (mainContent) {
            mainContent.addEventListener('scroll', throttledScroll);
            handleScroll({ target: mainContent } as unknown as Event); // Initial check
        }
        return () => mainContent?.removeEventListener('scroll', throttledScroll);
    }, [activeSessionId]);

    const handleSelectSession = useCallback((id: string) => setActiveSessionId(id), []);

    const handleDeleteSession = useCallback((id: string) => {
        const remainingSessions = sessions.filter(s => s.id !== id);
        
        if (remainingSessions.length === 0) {
            startNewChat();
        } else {
            if (activeSessionId === id) {
                setActiveSessionId(remainingSessions[0].id);
            }
            setSessions(remainingSessions);
        }
    }, [sessions, activeSessionId, startNewChat]);

    const handleSendMessage = useCallback(async (prompt: string, file: File | null) => {
        if (isLoading || (!prompt.trim() && !file) || !chatRef.current || !activeSession) return;
        
        shouldAutoScroll.current = true;
        stopStreamController.current = new AbortController();
        setIsLoading(true);

        const fileAttachment = file ? { name: file.name, type: file.type, url: URL.createObjectURL(file) } : undefined;
        const userMessage: Message = { id: crypto.randomUUID(), text: prompt, sender: Sender.USER, file: fileAttachment };
        
        setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, messages: [...s.messages, userMessage] } : s));

        const botMessage: Message = { id: crypto.randomUUID(), text: '', sender: Sender.BOT };
        setStreamingMessage(botMessage);
        
        try {
            const messageParts: Part[] = [];
            if (prompt.trim()) messageParts.push({ text: prompt });
            if (file) messageParts.push({ inlineData: { mimeType: file.type, data: await fileToBase64(file) } });
            
            const stream = await chatRef.current.sendMessageStream({ message: messageParts });
            
            let fullResponse = '';
            for await (const chunk of stream) {
                if (stopStreamController.current.signal.aborted) break;
                fullResponse += chunk.text;
                setStreamingMessage({ ...botMessage, text: fullResponse });
            }
            
            if (fullResponse) {
                const finalBotMessage = { ...botMessage, text: fullResponse };
                setSessions(prev => prev.map(s => s.id === activeSession.id ? {...s, messages: [...s.messages, finalBotMessage]} : s))
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
            const errorBotMessage = { ...botMessage, text: `Sorry, an error occurred: ${errorText}`};
            setSessions(prev => prev.map(s => s.id === activeSession.id ? {...s, messages: [...s.messages, errorBotMessage]} : s))
        } finally {
            if (fileAttachment) URL.revokeObjectURL(fileAttachment.url);
            setStreamingMessage(null);
            setIsLoading(false);
        }
    }, [isLoading, activeSession]);

    const handleStopGenerating = useCallback(() => stopStreamController.current.abort(), []);
    
    const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = target;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
        setShowScrollButton(!isAtBottom && scrollTop > 0);
        shouldAutoScroll.current = isAtBottom;
    };

    const instantScrollToBottom = () => {
        const container = document.getElementById('main-content');
        if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    };

    const lastMessage = messages[messages.length - 1];
    const isBotTyping = isLoading && !!streamingMessage && lastMessage?.id === streamingMessage.id;
    
    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-hidden">
            <div className="flex flex-col h-full min-w-0">
                <Header
                    sessionTitle={activeSession?.title || 'Chat'}
                    onToggleMenu={() => setIsMenuOpen(prev => !prev)}
                />
                
                <main id="main-content" className="flex-1 overflow-y-auto pb-8">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                isTyping={isBotTyping && index === messages.length - 1}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </main>

                <div className="flex-shrink-0 relative">
                     {showScrollButton && (
                        <button
                          onClick={instantScrollToBottom}
                          className="absolute -top-16 right-4 sm:right-6 z-20 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-opacity duration-300"
                          aria-label="Scroll to bottom"
                        >
                          <ScrollDownIcon className="w-6 h-6" />
                        </button>
                      )}
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} onStopGenerating={handleStopGenerating} />
                </div>
            </div>
            <SettingsMenu
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={startNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                modelQuality={modelQuality}
                onSetModelQuality={setModelQuality}
            />
        </div>
    );
};

export default App;
=======
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
>>>>>>> a33004e48aff2727052893d65efad48b7b8eaad0
