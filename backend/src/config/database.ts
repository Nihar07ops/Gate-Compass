import { Pool, PoolConfig } from 'pg';

// Lazy initialization - pool will be created on first use
let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        // Database configuration - read env vars when pool is first created
        const poolConfig: PoolConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME || 'gate_compass',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: parseInt(process.env.DB_POOL_MAX || '20', 10),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
        };

        console.log('Creating database pool with config:', {
            user: poolConfig.user,
            database: poolConfig.database,
            host: poolConfig.host
        });

        pool = new Pool(poolConfig);

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
}

// Test database connection
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await getPool().connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection established successfully');
        return true;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        return false;
    }
};

// Query helper with error handling
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const result = await getPool().query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Query error:', { text, error });
        throw error;
    }
};

// Get a client from the pool for transactions
export const getClient = async () => {
    return await getPool().connect();
};

// Close pool (for graceful shutdown)
export const closePool = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        console.log('Database pool closed');
    }
};

// Export a proxy object that lazily gets the pool
export default new Proxy({} as Pool, {
    get: (target, prop) => {
        const poolInstance = getPool();
        const value = (poolInstance as any)[prop];
        return typeof value === 'function' ? value.bind(poolInstance) : value;
    }
});
