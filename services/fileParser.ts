

// Dynamically load PDF.js from a CDN
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
let pdfjsLib: any; // Will hold the pdfjsLib object once loaded

// FIX: Removed redeclaration of `pdfjsLib`. The module-level `let` is sufficient.
const loadPdfJs = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window['pdfjs-dist/build/pdf'] !== 'undefined') {
            pdfjsLib = window['pdfjs-dist/build/pdf'];
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = PDFJS_URL;
        script.onload = () => {
            // pdfjsLib is now available on the window
            pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load PDF.js library.'));
        };
        document.head.appendChild(script);
    });
};

const parseTxtFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
};

const parsePdfFile = async (file: File): Promise<string> => {
    try {
        await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return fullText;
    } catch (error) {
        console.error("Error parsing PDF file:", error);
        throw new Error('Could not process the PDF file. It may be corrupted or in an unsupported format.');
    }
};


export const parseFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
        return parseTxtFile(file);
    } else if (file.type === 'application/pdf') {
        return parsePdfFile(file);
    } else {
        throw new Error('Unsupported file type. Please upload a .txt or .pdf file.');
    }
};