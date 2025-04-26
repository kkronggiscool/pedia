const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://pedia-db_owner:npg_NYHkjrECi0p4@ep-polished-violet-a45j2963-pooler.us-east-1.aws.neon.tech/pedia-db?sslmode=require',
});

pool.connect()
    .then(() => console.log('Connected to NeonDB successfully!'))
    .catch((err) => console.error('Connection to NeonDB failed:', err));

module.exports = pool;