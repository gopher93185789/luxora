

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// wtf is this overcomplicated and unnecesary code nigga?
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname.includes('github.dev') ||
   window.location.hostname.includes('gitpod.io') ||
   window.location.port === '5173');


export function getApiUrl(path: string): string {
  return `https://api.luxoras.nl/${path}`;
}

export const envInfo = {
  isDevelopment,
  hostname: typeof window !== 'undefined' ? window.location.hostname : '',
};
