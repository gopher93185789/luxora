

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname.includes('github.dev') ||
   window.location.hostname.includes('gitpod.io') ||
   window.location.port === '5173');

export const apiConfig: ApiConfig = {
  baseUrl: isDevelopment 
    ? (typeof window !== 'undefined' && window.location.hostname.includes('github.dev')
        ? 'http://localhost:8080' 
        : 'https://api.luxoras.nl')
    : 'https://api.luxoras.nl',
  timeout: 10000,
};

export function getApiUrl(path: string): string {
  return `${apiConfig.baseUrl}${path}`;
}

export const envInfo = {
  isDevelopment,
  hostname: typeof window !== 'undefined' ? window.location.hostname : '',
  baseUrl: apiConfig.baseUrl,
};
