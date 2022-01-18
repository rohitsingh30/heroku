const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'rohit',
    database: 'todo_database',
    host: 'https://app1xapp1.herokuapp.com/',
    port: 5432
});

module.exports = pool;
