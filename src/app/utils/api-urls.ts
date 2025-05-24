import { environment } from '../../environments/environment';

// Extract base URL from API URL
// Remove '/api' from the end if present
const baseUrl = environment.apiUrl.replace(/\/api$/, '');

export const apiUrls = {
  // API base URL
  apiUrl: environment.apiUrl,
  
  // Base URL for server
  baseUrl: baseUrl,
  
  // URL for uploads directory
  uploadsUrl: `${baseUrl}/uploads`,
  
  // Generate URL for a specific upload
  getUploadUrl: (path: string = '') => {
    return `${baseUrl}/uploads/${path}`;
  },
  
  // Default fallback image
  fallbackImageUrl: `${baseUrl}/uploads/1747396263436_2855267.jpg`
};
