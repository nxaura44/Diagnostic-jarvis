
import React, { useState, useRef, useEffect } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
// These interfaces are not part of the standard TypeScript DOM library.
interface SpeechRecognitionAlternative {
    transcript: string;
}

interface SpeechRecognitionResult {
    readonly [index: number]: SpeechRecognitionAlternative;
    readonly length: number;
    isFinal: boolean;
}

interface SpeechRecognitionResultList {
    readonly [index: number]: SpeechRecognitionResult;
    readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
    readonly resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onspeechend: () => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: {
            new(): SpeechRecognition;
        };
    }
}


interface InputBarProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
    updateStatus: (status: string) => void;
    isConfigured: boolean;
    speechLang: string;
    interimResults: boolean;
    isLiveMode: boolean;
    isAssistantSpeaking: boolean;
    onFileChange: (file: File) => void;
    onClearFile: () => void;
    documentName: string | null;
}

export const InputBar: React.FC<InputBarProps> = ({ 
    onSendMessage, 
    isLoading, 
    updateStatus, 
    isConfigured, 
    speechLang, 
    interimResults,
    isLiveMode,
    isAssistantSpeaking,
    onFileChange,
    onClearFile,
    documentName,
}) => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isDisabled = isLoading || !isConfigured;
    const placeholderText = isConfigured ? "Type your message or use the microphone..." : "Please set your API key in settings...";

    // Effect to setup speech recognition
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; // Process one phrase at a time
        recognition.lang = speechLang;
        recognition.interimResults = interimResults;

        recognition.onstart = () => {
            setIsListening(true);
            updateStatus('Listening...');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            const isFinal = event.results[0].isFinal;

            if (isLiveMode) {
                if(isFinal) {
                    onSendMessage(transcript);
                }
            } else {
                 setText(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                updateStatus('Mic access denied');
            } else if (event.error !== 'no-speech') {
              updateStatus('Error listening');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            if (!isLoading && !isLiveMode) { // In live mode, status is controlled by the main loop
                updateStatus('Online');
            }
        };
        
        recognitionRef.current = recognition;

    }, [speechLang, interimResults, updateStatus, isLoading, isLiveMode, onSendMessage]);
    
    // Effect to control listening state in live mode
    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        const shouldBeListening = isLiveMode && !isAssistantSpeaking && !isLoading;

        if (shouldBeListening && !isListening) {
            recognition.start();
        } else if (!shouldBeListening && isListening) {
            recognition.stop();
        }

    }, [isLiveMode, isAssistantSpeaking, isLoading, isListening]);


    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSendMessage(text);
        setText('');
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileChange(file);
        }
        // Reset the input value to allow selecting the same file again
        if(event.target) {
            event.target.value = '';
        }
    };

    return (
        <footer className="bg-slate-100 p-4 border-t-2 border-gray-200">
            {documentName && (
                <div className="mb-2 p-2 bg-cyan-100 border border-cyan-300 rounded-md flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2 truncate">
                        <i className="fas fa-file-alt text-cyan-600"></i>
                        <span className="text-cyan-800 font-medium truncate" title={documentName}>{documentName}</span>
                    </div>
                    <button onClick={onClearFile} className="text-cyan-600 hover:text-cyan-800" aria-label="Clear document">
                        <i className="fas fa-times-circle"></i>
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isDisabled}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-500 text-white hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Attach a document"
                >
                    <i className="fas fa-paperclip text-xl"></i>
                </button>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept=".txt,.pdf"
                />
                <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={isDisabled || isLiveMode}
                    className={`flex-shrink-0 w-12 h-12 rounded-full text-white transition-colors duration-200 flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse' : 'bg-cyan-500 hover:bg-cyan-600'} disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    title={isLiveMode ? "Live mode active" : "Toggle microphone"}
                >
                    <i className={`fas ${isLiveMode ? 'fa-headset' : 'fa-microphone'} text-xl`}></i>
                </button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholderText}
                    disabled={isDisabled}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={isDisabled || !text.trim()}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-700 text-white hover:bg-slate-800 transition-colors duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-paper-plane text-xl"></i>
                </button>
            </form>
        </footer>
    );
};
