import React from 'react';
import { NikAvatar } from './Icons';

const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-10 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <NikAvatar />
                        <div>
                            <h1 className="text-lg font-bold text-white">Nik</h1>
                            <p className="text-sm text-green-400 flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;