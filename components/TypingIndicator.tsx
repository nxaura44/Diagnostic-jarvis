
import React from 'react';
import { ASSISTANT_NAME } from '../constants';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500">
                <i className="fas fa-robot text-white text-xl"></i>
            </div>
            <div className="max-w-xl p-4 rounded-lg shadow-md bg-white">
                 <p className="font-bold mb-2">{ASSISTANT_NAME}</p>
                 <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                </div>
            </div>
        </div>
    );
};
