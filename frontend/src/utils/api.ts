import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

/**
 * Get CSRF token from cookie
 */
const getCsrfToken = (): string | null => {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : null;
};

/**
 * Add CSRF token to request headers for state-changing operations
 */
axios.interceptors.request.use((config) => {
    // Add CSRF token for POST, PUT, DELETE, PATCH requests
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export interface RetryConfig {
    maxRetries?: number;
    retryDelay?: number;
    retryableStatuses?: number[];
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: AxiosError, retryableStatuses: number[]): boolean => {
    if (!error.response) {
        // Network errors are retryable
        return true;
    }
    return retryableStatuses.includes(error.response.status);
};

/**
 * Make an API request with automatic retry logic
 */
export async function apiRequest<T = any>(
    config: AxiosRequestConfig,
    retryConfig: RetryConfig = {}
): Promise<AxiosResponse<T>> {
    const { maxRetries, retryDelay, retryableStatuses } = {
        ...DEFAULT_RETRY_CONFIG,
        ...retryConfig,
    };

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.request<T>(config);
            return response;
        } catch (error) {
            lastError = error as AxiosError;

            // Don't retry if it's the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Check if error is retryable
            if (!isRetryableError(lastError, retryableStatuses)) {
                break;
            }

            // Calculate delay with exponential backoff
            const backoffDelay = retryDelay * Math.pow(2, attempt);
            console.log(`Request failed, retrying in ${backoffDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
            await delay(backoffDelay);
        }
    }

    throw lastError;
}

/**
 * API utility functions with retry logic
 */
export const api = {
    get: <T = any>(url: string, config?: AxiosRequestConfig, retryConfig?: RetryConfig) => {
        return apiRequest<T>({ ...config, method: 'GET', url }, retryConfig);
    },

    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) => {
        return apiRequest<T>({ ...config, method: 'POST', url, data }, retryConfig);
    },

    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) => {
        return apiRequest<T>({ ...config, method: 'PUT', url, data }, retryConfig);
    },

    delete: <T = any>(url: string, config?: AxiosRequestConfig, retryConfig?: RetryConfig) => {
        return apiRequest<T>({ ...config, method: 'DELETE', url }, retryConfig);
    },

    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig, retryConfig?: RetryConfig) => {
        return apiRequest<T>({ ...config, method: 'PATCH', url, data }, retryConfig);
    },
};

/**
 * Extract error message from axios error
 */
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.data?.error) {
            return error.response.data.error;
        }
        if (error.message) {
            return error.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export default api;
