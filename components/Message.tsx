
import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, Role } from '../types';
import { ASSISTANT_NAME } from '../constants';

interface MessageProps {
    message: MessageType;
}

const SpeakerIcon: React.FC<{ text: string }> = ({ text }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Effect to create and configure the utterance instance.
    useEffect(() => {
        if (!('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        utteranceRef.current = utterance;

        // Cleanup: ensure speech is stopped if component unmounts while speaking.
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [text]);


    const handleToggleSpeech = () => {
        const synth = window.speechSynthesis;
        const utterance = utteranceRef.current;

        if (!utterance) {
            alert('Sorry, your browser does not support text-to-speech.');
            return;
        }

        if (isSpeaking) {
            // Stop the speech.
            synth.cancel();
        } else {
            // Cancel any previously speaking utterances before starting a new one.
            synth.cancel(); 
            synth.speak(utterance);
        }
    };
    
    const iconClass = isSpeaking ? 'fa-stop-circle' : 'fa-volume-up';
    const ariaLabel = isSpeaking ? 'Stop reading message aloud' : 'Read message aloud';

    return (
        <button 
            onClick={handleToggleSpeech} 
            className="text-gray-400 hover:text-cyan-500 transition-colors duration-200 ml-2"
            aria-label={ariaLabel}
        >
            <i className={`fas ${iconClass}`}></i>
        </button>
    );
};


export const Message: React.FC<MessageProps> = ({ message }) => {
    const isAssistant = message.role === Role.ASSISTANT;

    return (
        <div className={`flex items-start gap-4 ${isAssistant ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isAssistant ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                <i className={`fas ${isAssistant ? 'fa-robot' : 'fa-user'} text-white text-xl`}></i>
            </div>
            <div className={`max-w-xl p-4 rounded-lg shadow-md ${isAssistant ? 'bg-white text-gray-800' : 'bg-slate-700 text-white'}`}>
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold">{isAssistant ? ASSISTANT_NAME : 'User'}</p>
                    {isAssistant && <SpeakerIcon text={message.text} />}
                </div>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.citations && message.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">Sources:</h4>
                        <ul className="space-y-1">
                            {message.citations.map((citation, index) => (
                                <li key={index} className="flex items-center text-xs">
                                    <i className="fas fa-link text-gray-400 mr-2"></i>
                                    <a
                                        href={citation.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-600 hover:underline truncate"
                                        title={citation.title}
                                    >
                                        {citation.title || citation.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
