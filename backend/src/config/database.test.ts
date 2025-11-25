import { Pool } from 'pg';
import { query, getClient, testConnection } from './database';

// Mock pg Pool
jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('Database Connection Utility', () => {
    let mockPool: any;

    beforeEach(() => {
        mockPool = new Pool();
        jest.clearAllMocks();
    });

    describe('testConnection', () => {
        it('should return true when connection is successful', async () => {
            const mockClient = {
                query: jest.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
                release: jest.fn(),
            };
            mockPool.connect.mockResolvedValue(mockClient);

            const result = await testConnection();

            expect(result).toBe(true);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT NOW()');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should return false when connection fails', async () => {
            mockPool.connect.mockRejectedValue(new Error('Connection failed'));

            const result = await testConnection();

            expect(result).toBe(false);
        });
    });

    describe('query', () => {
        it('should execute query and return result', async () => {
            const mockResult = { rows: [{ id: 1 }], rowCount: 1 };
            mockPool.query.mockResolvedValue(mockResult);

            const result = await query('SELECT * FROM users WHERE id = $1', ['1']);

            expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['1']);
            expect(result).toEqual(mockResult);
        });

        it('should throw error when query fails', async () => {
            const mockError = new Error('Query failed');
            mockPool.query.mockRejectedValue(mockError);

            await expect(query('INVALID SQL')).rejects.toThrow('Query failed');
        });
    });

    describe('getClient', () => {
        it('should return a client from the pool', async () => {
            const mockClient = { query: jest.fn(), release: jest.fn() };
            mockPool.connect.mockResolvedValue(mockClient);

            const client = await getClient();

            expect(client).toBe(mockClient);
            expect(mockPool.connect).toHaveBeenCalled();
        });
    });
});
