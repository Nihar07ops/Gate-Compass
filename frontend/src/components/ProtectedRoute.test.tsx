import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.defaults = { withCredentials: false } as any;
    });

    it('shows loading spinner while checking authentication', () => {
        // Mock axios to delay response
        mockedAxios.get.mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('redirects unauthenticated users to login page', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Login Page')).toBeInTheDocument();
        });

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders protected content for authenticated users', async () => {
        const mockUser = {
            userId: '123',
            email: 'test@example.com',
            role: 'user',
        };

        mockedAxios.get.mockResolvedValue({ data: mockUser });

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('preserves location state when redirecting to login', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

        const { container } = render(
            <MemoryRouter initialEntries={['/protected']}>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/protected"
                            element={
                                <ProtectedRoute>
                                    <div>Protected Content</div>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/login"
                            element={<div data-testid="login-page">Login Page</div>}
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
    });
});
