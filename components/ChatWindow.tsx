
import React, { forwardRef } from 'react';
import { Message as MessageType } from '../types';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';

interface ChatWindowProps {
    messages: MessageType[];
    isLoading: boolean;
}

export const ChatWindow = forwardRef<HTMLDivElement, ChatWindowProps>(({ messages, isLoading }, ref) => {
    return (
        <main ref={ref} className="flex-1 p-6 overflow-y-auto bg-gray-100">
            <div className="space-y-4">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
            </div>
        </main>
    );
});
