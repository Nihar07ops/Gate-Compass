import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../contexts/AuthContext';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.defaults = { withCredentials: false } as any;
        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));
        mockNavigate.mockClear();
    });

    it('renders Google login button', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
        });
    });

    it('displays GATE COMPASS title', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('GATE COMPASS')).toBeInTheDocument();
        });
    });

    it('displays platform description', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/Intelligent GATE CSIT Exam Preparation Platform/i)
            ).toBeInTheDocument();
        });
    });

    it('calls login function when Google login button is clicked', async () => {
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = { href: '' } as any;

        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
        });

        const loginButton = screen.getByText(/Sign in with Google/i);
        fireEvent.click(loginButton);

        expect(window.location.href).toBe('/api/auth/google');

        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: true,
        });
    });

    it('displays error message from URL parameter', async () => {
        render(
            <MemoryRouter initialEntries={['/login?error=auth_failed']}>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/Authentication failed. Please try again./i)
            ).toBeInTheDocument();
        });
    });

    it('displays session expired error message', async () => {
        render(
            <MemoryRouter initialEntries={['/login?error=session_expired']}>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/Your session has expired. Please log in again./i)
            ).toBeInTheDocument();
        });
    });

    it('redirects to dashboard if user is already authenticated', async () => {
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            role: 'user',
        };

        mockedAxios.get.mockResolvedValue({ data: mockUser });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });
});
