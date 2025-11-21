import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, NikAvatar } from './Icons';
import type { ChatSession } from '../types';
import type { ModelQuality } from '../App';

interface SettingsMenuProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
    modelQuality: ModelQuality;
    onSetModelQuality: (quality: ModelQuality) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
    isOpen,
    onClose,
    sessions,
    activeSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    modelQuality,
    onSetModelQuality
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let openTimeoutId: number;
        let closeTimeoutId: number;

        if (isOpen) {
            setIsMounted(true);
            // We use a short timeout to allow React to render the component in its initial (off-screen) state
            // before we apply the 'active' class to trigger the slide-in animation.
            // This ensures the browser has time to paint the initial state, making the animation reliable.
            openTimeoutId = window.setTimeout(() => {
                setIsActive(true);
            }, 20);
        } else {
            setIsActive(false);
            // Wait for the closing animation to finish before unmounting the component.
            closeTimeoutId = window.setTimeout(() => {
                setIsMounted(false);
            }, 300); // Must match the CSS transition duration.
        }

        return () => {
            clearTimeout(openTimeoutId);
            clearTimeout(closeTimeoutId);
        };
    }, [isOpen]);

    if (!isMounted) {
        return null;
    }

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-30">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Menu Panel */}
            <div
                className={`fixed top-0 right-0 bottom-0 z-40 w-80 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isActive ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <NikAvatar className="w-8 h-8"/>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Nik AI Chats</h1>
                    </div>
                    <button
                        onClick={() => { onNewChat(); onClose(); }}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500"
                        aria-label="Start new chat"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessions.filter(s => s.messages.length > 1).length > 0 ? (
                        sessions.filter(s => s.messages.length > 1).map(session => (
                            <div
                                key={session.id}
                                onClick={() => { onSelectSession(session.id); onClose(); }}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm ${activeSessionId === session.id ? 'bg-blue-600 text-white font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                            >
                                <span className="truncate flex-1 pr-2">{session.title}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                    className="p-1 rounded-md hover:bg-red-500/20 text-red-500 hover:text-red-400"
                                    aria-label={`Delete chat: ${session.title}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="px-2 py-4 text-center text-sm text-slate-500 dark:text-slate-400">No past chats.</p>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="px-0 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Model Quality</div>
                    <div className="pt-1 space-y-1">
                        <label className={`flex items-start gap-3 px-3 py-2 text-sm rounded-md cursor-pointer ${modelQuality === 'quality' ? 'bg-blue-600/20 text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                            <input type="radio" name="model-quality" value="quality" checked={modelQuality === 'quality'} onChange={() => onSetModelQuality('quality')} className="sr-only" />
                            <div>
                                <span className="font-medium">High Quality</span>
                                <p className="text-xs opacity-80">Better, slower responses</p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-3 px-3 py-2 text-sm rounded-md cursor-pointer ${modelQuality === 'fast' ? 'bg-blue-600/20 text-blue-800 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                            <input type="radio" name="model-quality" value="fast" checked={modelQuality === 'fast'} onChange={() => onSetModelQuality('fast')} className="sr-only" />
                             <div>
                                <span className="font-medium">Fast</span>
                                <p className="text-xs opacity-80">Good, faster responses</p>
                            </div>
                        </label>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 px-4">Created by Nikshith</p>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SettingsMenu);