const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'naykscefaysezd',
    password: '630c01e8f9c92ef934a7f11e0192d06c41c6740292ca492f1fda63b250e26b54',
    database: 'd2it9ovdcenne2',
    host: 'ec2-3-231-69-204.compute-1.amazonaws.com',
    port: 5432
});

module.exports = pool;
