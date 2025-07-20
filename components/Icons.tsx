import React from 'react';

export const NikAvatar: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
    <div className={`flex-shrink-0 ${className}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="40" height="40" rx="20" fill="url(#avatar-gradient)"/>
            <path d="M13 22C13 22 15.5 25 20 25C24.5 25 27 22 27 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="15" cy="17" r="2" fill="white"/>
            <circle cx="25" cy="17" r="2" fill="white"/>
            <defs>
                <linearGradient id="avatar-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1D4ED8"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                </linearGradient>
            </defs>
        </svg>
    </div>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

export const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-3">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
    </div>
);