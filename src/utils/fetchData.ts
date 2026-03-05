import axios from 'axios';

const ALLOWED_HOSTS = ['data-api.polymarket.com'];

const validateUrl = (url: string): void => {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid URL: ${url}`);
    }
    if (parsed.protocol !== 'https:') {
        throw new Error(`URL must use HTTPS: ${url}`);
    }
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        throw new Error(`URL hostname not allowed: ${parsed.hostname}`);
    }
};

const fetchData = async (url: string, retries = 3, delay = 2000) => {
    validateUrl(url);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Fetching data (attempt ${attempt}/${retries})`);
            
            const response = await axios.get(url, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });
            
            return response.data;
        } catch (error: unknown) {
            const isLastAttempt = attempt === retries;
            const errorCode = (error as { code?: string })?.code;
            const errorMessage = (error as { message?: string })?.message || errorCode || 'Unknown error';
            const isTimeout = errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED';
            const isNetworkError = errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND';
            
            if (isLastAttempt) {
                console.error(
                    `Failed to fetch data after ${retries} attempts:`,
                    errorMessage
                );
                // Return empty array instead of throwing to prevent bot crash
                return [];
            }
            
            if (isTimeout || isNetworkError) {
                console.warn(
                    `Network error (attempt ${attempt}/${retries}): ${errorMessage}. Retrying in ${delay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                // Exponential backoff
                delay *= 1.5;
            } else {
                // For other errors, don't retry
                console.error('Error fetching data:', errorMessage);
                return [];
            }
        }
    }
    
    return [];
};

export default fetchData;
