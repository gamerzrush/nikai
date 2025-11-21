import React from 'react';
import { NikAvatar, MenuIcon } from './Icons';

interface HeaderProps {
    onToggleMenu: () => void;
    sessionTitle: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleMenu, sessionTitle }) => {
    return (
        <header className="flex-shrink-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                       <NikAvatar className="w-10 h-10"/>
                       <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{sessionTitle}</h1>
                            <p className="text-sm text-green-500 dark:text-green-400 flex items-center">
                                <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleMenu}
                        className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Toggle menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default React.memo(Header);