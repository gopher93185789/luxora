

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Check if we're in development mode
const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development' ||
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname.includes('github.dev') ||
   window.location.hostname.includes('gitpod.io') ||
   window.location.port === '5173');

export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Always use production API for now until local backend is confirmed working
  const baseUrl = 'https://api.luxoras.nl';
  const fullUrl = `${baseUrl}/${cleanPath}`;
  
  if (isDevelopment) {
    console.log(`API URL: ${fullUrl}`);
  }
  
  return fullUrl;
}

export const envInfo = {
  isDevelopment,
  hostname: typeof window !== 'undefined' ? window.location.hostname : '',
};
