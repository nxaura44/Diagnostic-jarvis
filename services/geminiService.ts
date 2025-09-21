
import { GoogleGenAI } from "@google/genai";
import { HEALTHCARE_SYSTEM_PROMPT } from '../constants';
import { Citation } from '../types';

const SEARCH_PREFIX = "search for";

interface AiResponse {
    text: string;
    citations?: Citation[];
}

export const getAiResponse = async (
    prompt: string, 
    apiKey: string,
    documentContent?: string,
    documentName?: string
): Promise<AiResponse> => {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const isSearchQuery = prompt.toLowerCase().startsWith(SEARCH_PREFIX);
    const model = 'gemini-2.5-flash';

    if (isSearchQuery) {
        const searchQuery = prompt.substring(SEARCH_PREFIX.length).trim();
        const response = await ai.models.generateContent({
            model,
            contents: `Please provide a concise summary for the following query: ${searchQuery}`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text;
        const rawCitations = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const citations: Citation[] = (rawCitations || [])
            .map((chunk: any) => ({
                uri: chunk.web?.uri,
                title: chunk.web?.title,
            }))
            .filter((citation: Citation) => citation.uri && citation.title);

        return { text, citations };

    } else {
        let finalPrompt = prompt;
        if (documentContent) {
            finalPrompt = `Based on the following document named "${documentName}", provide a concise answer to the user's question. If the answer isn't in the document, say so.\n\n--- DOCUMENT CONTENT ---\n${documentContent}\n\n--- USER QUESTION ---\n${prompt}`;
        }

        const response = await ai.models.generateContent({
            model,
            contents: finalPrompt,
            config: {
                systemInstruction: HEALTHCARE_SYSTEM_PROMPT,
            },
        });
        return { text: response.text };
    }
};
