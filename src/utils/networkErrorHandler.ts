
import { useToast } from '@/hooks/use-toast';

export interface NetworkError {
  status?: number;
  message: string;
  code?: string;
  retryable: boolean;
}

export const handleNetworkError = (error: any): NetworkError => {
  // Handle Supabase errors
  if (error?.message) {
    if (error.message.includes('JWT expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        code: 'AUTH_EXPIRED',
        retryable: false,
      };
    }

    if (error.message.includes('Network request failed')) {
      return {
        message: 'Network connection failed. Please check your internet connection.',
        code: 'NETWORK_FAILED',
        retryable: true,
      };
    }

    if (error.message.includes('Permission denied')) {
      return {
        message: 'You don\'t have permission to perform this action.',
        code: 'PERMISSION_DENIED',
        retryable: false,
      };
    }
  }

  // Handle HTTP errors
  if (error?.status) {
    switch (error.status) {
      case 400:
        return {
          status: 400,
          message: 'Invalid request. Please check your input and try again.',
          code: 'BAD_REQUEST',
          retryable: false,
        };
      case 401:
        return {
          status: 401,
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED',
          retryable: false,
        };
      case 403:
        return {
          status: 403,
          message: 'Access forbidden. You don\'t have permission.',
          code: 'FORBIDDEN',
          retryable: false,
        };
      case 404:
        return {
          status: 404,
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          retryable: false,
        };
      case 429:
        return {
          status: 429,
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          retryable: true,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          status: error.status,
          message: 'Server error. Please try again in a few moments.',
          code: 'SERVER_ERROR',
          retryable: true,
        };
    }
  }

  // Default error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    retryable: true,
  };
};

export const useNetworkErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (error: any, context?: string) => {
    const networkError = handleNetworkError(error);
    
    console.error(`Network error${context ? ` in ${context}` : ''}:`, error);

    toast({
      title: 'Error',
      description: networkError.message,
      variant: 'destructive',
    });

    return networkError;
  };

  const retryWithExponentialBackoff = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<any> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const networkError = handleNetworkError(error);

        if (!networkError.retryable || attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };

  return { handleError, retryWithExponentialBackoff };
};
