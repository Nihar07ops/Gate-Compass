import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default axios mock
        mockedAxios.defaults = { withCredentials: false } as any;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with loading state', () => {
        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBe(null);
    });

    it('should set user when authentication check succeeds', async () => {
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            role: 'user',
        };

        mockedAxios.get.mockResolvedValue({ data: mockUser });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('should handle authentication check failure', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBe(null);
    });

    it('should redirect to OAuth endpoint on login', () => {
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { href: '' } as any;

        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        result.current.login();

        expect(window.location.href).toBe('/api/auth/google');

        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
    });

    it('should clear user on logout', async () => {
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            role: 'user',
        };

        mockedAxios.get.mockResolvedValue({ data: mockUser });
        mockedAxios.post.mockResolvedValue({ data: { message: 'Logged out' } });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
        });

        await result.current.logout();

        await waitFor(() => {
            expect(result.current.user).toBe(null);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout');
    });

    it('should throw error when useAuth is used outside AuthProvider', () => {
        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within an AuthProvider');
    });
});
