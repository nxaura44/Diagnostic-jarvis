
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { getAiResponse } from './services/geminiService';
import { speechService } from './services/speechService';
import { parseFile } from './services/fileParser';
import { Message, Role } from './types';
import { INITIAL_GREETING, ASSISTANT_NAME } from './constants';
import { SettingsModal } from './components/SettingsModal';

interface AppSettings {
    apiKey: string;
    speechLang: string;
    interimResults: boolean;
}

interface DocumentContext {
    name: string;
    content: string;
}

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>('Initializing...');
    const [settings, setSettings] = useState<AppSettings>({
        apiKey: '',
        speechLang: 'en-US',
        interimResults: false,
    });
    const [isSettingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
    const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
    const [isAssistantSpeaking, setIsAssistantSpeaking] = useState<boolean>(false);
    const [documentContext, setDocumentContext] = useState<DocumentContext | null>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    // Effect for loading settings and initial messages
    useEffect(() => {
        // Load settings from localStorage
        const storedKey = localStorage.getItem('gemini-api-key');
        const storedLang = localStorage.getItem('speech-lang');
        const storedInterim = localStorage.getItem('interim-results');

        const loadedSettings: AppSettings = {
            apiKey: storedKey || '',
            speechLang: storedLang || 'en-US',
            interimResults: storedInterim ? JSON.parse(storedInterim) : false,
        };
        setSettings(loadedSettings);

        if (!loadedSettings.apiKey) {
            setSettingsModalOpen(true);
        }

        // Load chat history from localStorage
        try {
            const storedHistory = localStorage.getItem('chat-history');
            if (storedHistory) {
                const parsedHistory = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
                    setMessages(parsedHistory);
                } else {
                     setMessages([{ role: Role.ASSISTANT, text: INITIAL_GREETING, id: Date.now() }]);
                }
            } else {
                setMessages([{ role: Role.ASSISTANT, text: INITIAL_GREETING, id: Date.now() }]);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
            setMessages([{ role: Role.ASSISTANT, text: INITIAL_GREETING, id: Date.now() }]);
        }

        setStatus('Online');
    }, []);

    // Effect for saving messages to localStorage
    useEffect(() => {
        // Do not save the initial empty array or default message on first load if history exists
        if (messages.length > 0) {
            localStorage.setItem('chat-history', JSON.stringify(messages));
        }
    }, [messages]);
    
    // Effect for auto-scrolling
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSaveSettings = (newSettings: AppSettings) => {
        if (newSettings.apiKey.trim()) {
            setSettings(newSettings);
            localStorage.setItem('gemini-api-key', newSettings.apiKey);
            localStorage.setItem('speech-lang', newSettings.speechLang);
            localStorage.setItem('interim-results', JSON.stringify(newSettings.interimResults));
            setSettingsModalOpen(false);
            setStatus('Online'); // In case status was error
        }
    };

    const handleToggleLiveMode = () => {
        setIsLiveMode(prev => {
            const newMode = !prev;
            if (!newMode) {
                // If turning off, stop any current speech
                speechService.cancel();
                setIsAssistantSpeaking(false);
            }
            return newMode;
        });
    };

    const handleFileChange = async (file: File) => {
        setStatus('Parsing document...');
        setIsLoading(true);
        try {
            const content = await parseFile(file);
            setDocumentContext({ name: file.name, content });
        } catch (error) {
            console.error("Failed to parse file:", error);
            const errorMessage: Message = {
                role: Role.ASSISTANT,
                text: `Error parsing file: ${(error as Error).message}`,
                id: Date.now() + 1,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setStatus('Online');
        }
    };

    const handleClearFile = () => {
        setDocumentContext(null);
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        if (!settings.apiKey) {
            setSettingsModalOpen(true);
            return;
        }

        const userMessage: Message = {
            role: Role.USER,
            text,
            id: Date.now(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setStatus('Thinking...');
        speechService.cancel(); // Stop any speaking when user sends a message

        try {
            const aiResponse = await getAiResponse(
                text, 
                settings.apiKey,
                documentContext?.content,
                documentContext?.name
            );
            const assistantMessage: Message = {
                role: Role.ASSISTANT,
                text: aiResponse.text,
                id: Date.now() + 1,
                citations: aiResponse.citations,
            };
            setMessages(prev => [...prev, assistantMessage]);

            if (isLiveMode) {
                setIsAssistantSpeaking(true);
                speechService.speak(aiResponse.text, () => {
                    setIsAssistantSpeaking(false);
                });
            }

        } catch (error) {
            console.error("Error fetching AI response:", error);
            const isInvalidKey = (error as Error).message.includes("API key not valid");
            const errorMessageText = isInvalidKey
                ? "Your API key seems to be invalid. Please correct it in the settings."
                : "I'm having trouble connecting. Please check your internet connection and API key, then try again.";

            const errorMessage: Message = {
                role: Role.ASSISTANT,
                text: errorMessageText,
                id: Date.now() + 1,
            };
            setMessages(prev => [...prev, errorMessage]);
            
            if (isInvalidKey) {
                setSettingsModalOpen(true);
            }
        } finally {
            setIsLoading(false);
            setStatus('Online');
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden font-sans">
            <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onSave={handleSaveSettings}
                onClose={() => setSettingsModalOpen(false)}
                currentSettings={settings}
            />
            <Header 
                assistantName={ASSISTANT_NAME} 
                status={status} 
                onSettingsClick={() => setSettingsModalOpen(true)}
                isLiveMode={isLiveMode}
                onToggleLiveMode={handleToggleLiveMode}
            />
            <ChatWindow messages={messages} isLoading={isLoading} ref={chatWindowRef} />
            <InputBar 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                updateStatus={setStatus}
                isConfigured={!!settings.apiKey}
                speechLang={settings.speechLang}
                interimResults={settings.interimResults}
                isLiveMode={isLiveMode}
                isAssistantSpeaking={isAssistantSpeaking}
                onFileChange={handleFileChange}
                onClearFile={handleClearFile}
                documentName={documentContext?.name || null}
            />
        </div>
    );
};

export default App;
