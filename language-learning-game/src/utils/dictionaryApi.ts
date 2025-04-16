export interface Phonetic {
    text?: string;
    audio?: string;
    sourceUrl?: string;
    license?: {
        name?: string;
        url?: string;
    };
}

export interface Definition {
    definition: string;
    synonyms: string[];
    antonyms: string[];
    example?: string;
}

export interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
    synonyms: string[];
    antonyms: string[];
}

export interface License {
    name: string;
    url: string;
}

export interface DictionaryEntry {
    word: string;
    phonetic?: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    license: License;
    sourceUrls: string[];
}

export interface DictionaryError {
    title: string;
    message: string;
    resolution: string;
}

/**
 * Fetches definitions for a Spanish word from the Free Dictionary API.
 * @param word The Spanish word to look up.
 * @returns A promise that resolves to an array of DictionaryEntry objects or a DictionaryError.
 */
export const getSpanishDefinition = async (
    word: string
): Promise<DictionaryEntry[] | DictionaryError> => {
    try {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/es/${encodeURIComponent(word)}`
        );

        if (!response.ok) {
            // If the response status is 404 (Not Found), the API returns a specific error object
            if (response.status === 404) {
                const errorData: DictionaryError = await response.json();
                console.warn(`Definition not found for "${word}":`, errorData);
                return errorData; 
            }
            // For other errors, throw a generic error
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: DictionaryEntry[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching Spanish definition:", error);
        // Return a standard error structure for consistency
        const errorResponse: DictionaryError = {
            title: "Fetch Error",
            message: "Could not fetch definition due to a network or unexpected error.",
            resolution: "Please check your network connection and try again."
        };
        return errorResponse;
    }
}; 