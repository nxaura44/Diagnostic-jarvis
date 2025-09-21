
export enum Role {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export interface Citation {
    uri: string;
    title: string;
}

export interface Message {
    id: number;
    role: Role;
    text: string;
    citations?: Citation[];
}
