
import React from 'react';

interface HeaderProps {
    assistantName: string;
    status: string;
    onSettingsClick: () => void;
    isLiveMode: boolean;
    onToggleLiveMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ assistantName, status, onSettingsClick, isLiveMode, onToggleLiveMode }) => {
    const statusColor = status === 'Online' ? 'bg-green-500' : 'bg-yellow-500';
    const liveModeColor = isLiveMode ? 'text-cyan-400' : 'text-gray-300';

    return (
        <header className="bg-slate-800 text-white p-4 flex justify-between items-center border-b-4 border-cyan-500">
            <div className="flex items-center space-x-3">
                <i className="fas fa-robot text-3xl text-cyan-400"></i>
                <div>
                    <h1 className="text-xl font-bold">{assistantName}</h1>
                    <p className="text-sm text-gray-300">AI Diagnostic Assistant</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></div>
                    <span className="text-sm font-medium">{status}</span>
                </div>
                <button 
                    onClick={onToggleLiveMode} 
                    className={`${liveModeColor} hover:text-white transition-colors`} 
                    aria-label={isLiveMode ? "Deactivate live conversation mode" : "Activate live conversation mode"}
                    title={isLiveMode ? "Deactivate Live Mode" : "Activate Live Mode"}
                >
                    <i className="fas fa-headset text-xl"></i>
                </button>
                 <button onClick={onSettingsClick} className="text-gray-300 hover:text-white transition-colors" aria-label="Settings">
                    <i className="fas fa-cog text-xl"></i>
                </button>
            </div>
        </header>
    );
};