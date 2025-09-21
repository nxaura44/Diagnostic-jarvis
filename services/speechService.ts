
class SpeechService {
    private synth: SpeechSynthesis;
    private isSupported: boolean;

    constructor() {
        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
            this.isSupported = true;
        } else {
            console.warn("Speech synthesis not supported in this browser.");
            this.synth = {} as SpeechSynthesis; // Mock to prevent errors
            this.isSupported = false;
        }
    }

    speak(text: string, onEndCallback?: () => void) {
        if (!this.isSupported || !text) {
            if (onEndCallback) onEndCallback();
            return;
        }

        // Cancel any ongoing speech to prevent overlap
        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onend = () => {
            if (onEndCallback) {
                onEndCallback();
            }
        };

        utterance.onerror = (e) => {
            console.error("Speech synthesis error:", e);
            // Ensure callback is called even on error to unblock state
            if (onEndCallback) {
                onEndCallback();
            }
        };

        this.synth.speak(utterance);
    }

    cancel() {
        if (this.isSupported) {
            this.synth.cancel();
        }
    }
}

export const speechService = new SpeechService();
