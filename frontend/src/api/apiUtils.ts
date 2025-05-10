// src/api/apiUtils.ts
import { apiUrl } from './config';

/**
 * Base function to make authenticated API requests
 * @param endpoint - API endpoint (without base URL)
 * @param method - HTTP method
 * @param body - Optional request body
 * @returns Promise with the response data
 */
export const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
  
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw the error with the original message
      throw error;
    } else {
      // Handle non-Error objects
      throw new Error('Unknown error occurred');
    }
  }
};

/**
 * Handle API errors in a consistent way
 * @param error - The caught error
 * @param fallbackMessage - Message to display if error is not an Error object
 * @returns Error message string
 */
export const handleApiError = (error: unknown, fallbackMessage: string = 'An error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};
