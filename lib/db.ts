import sql from 'mssql';

const config: sql.config = {
  user: 'sa',
  password: 'Prodeveloper1',
  server: 'localhost',
  database: 'MyAppDB',
  port: 1433,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    encrypt: false,
    instanceName: undefined,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
  },
  connectionTimeout: 60000,
  requestTimeout: 30000,
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (!pool) {
      console.log('Creating new database connection pool...');
      console.log('Config:', {
        server: config.server,
        database: config.database,
        user: config.user,
        port: config.port
      });
      
      pool = new sql.ConnectionPool(config);
      
      pool.on('error', err => {
        console.error('Database pool error:', err);
        pool = null;
      });

      pool.on('connect', () => {
        console.log('Database connected successfully');
      });

      await pool.connect();
      console.log('Connection pool created and connected');
    }
    
    if (pool && !pool.connected) {
      console.log('Pool exists but not connected, reconnecting...');
      pool = null;
      return await getConnection();
    }
    
    return pool;
  } catch (err) {
    console.error('Database connection error:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      code: (err as any)?.code,
      originalError: (err as any)?.originalError,
      stack: err instanceof Error ? err.stack : undefined
    });
    
    pool = null;
    throw err;
  }
}

export async function closeConnection() {
  if (pool) {
    try {
      console.log('Closing database connection pool...');
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
      pool = null;
    }
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    const result = await connection.request().query('SELECT 1 as test');
    console.log('Database test successful:', result.recordset);
    return true;
  } catch (err) {
    console.error('Database test failed:', err);
    return false;
  }
}

process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connection...');
  await closeConnection();
  process.exit(0);
});

process.on('exit', async () => {
  console.log('Process exiting, closing database connection...');
  await closeConnection();
});