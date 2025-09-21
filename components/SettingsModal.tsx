
import React, { useState, useEffect } from 'react';

interface Settings {
    apiKey: string;
    speechLang: string;
    interimResults: boolean;
}

interface SettingsModalProps {
    isOpen: boolean;
    onSave: (settings: Settings) => void;
    onClose: () => void;
    currentSettings: Settings;
}

const SPEECH_LANGUAGES = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ru-RU', name: 'Русский' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onSave, onClose, currentSettings }) => {
    const [settings, setSettings] = useState<Settings>(currentSettings);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        if (settings.apiKey.trim()) {
            onSave(settings);
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSave();
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        setSettings(prev => ({
            ...prev,
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full m-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close settings">
                    <i className="fas fa-times text-2xl"></i>
                </button>

                <h2 className="text-2xl font-bold mb-2 text-gray-800">Settings</h2>
                <p className="mb-6 text-gray-600">
                    Configure your application settings below.
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apiKey">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            id="apiKey"
                            name="apiKey"
                            value={settings.apiKey}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your Gemini API key"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            aria-label="Gemini API Key Input"
                        />
                         <p className="mt-1 text-xs text-gray-500">
                            Your key is stored in your browser's local storage.
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline ml-1">
                                Get your API key here
                                <i className="fas fa-external-link-alt text-xs ml-1"></i>
                            </a>
                        </p>
                    </div>

                    <div className="border-t pt-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-3">Speech Recognition</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="speechLang">
                                    Language
                                </label>
                                <select
                                    id="speechLang"
                                    name="speechLang"
                                    value={settings.speechLang}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    {SPEECH_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center">
                                    <input
                                        id="interimResults"
                                        name="interimResults"
                                        type="checkbox"
                                        checked={settings.interimResults}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                    />
                                    <label htmlFor="interimResults" className="ml-2 block text-sm text-gray-700">
                                        Enable interim results
                                    </label>
                                </div>
                            </div>
                         </div>
                         <p className="mt-1 text-xs text-gray-500">
                            Interim results provide real-time transcription feedback.
                         </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!settings.apiKey.trim()}
                    className="w-full mt-8 p-3 rounded-lg bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};
