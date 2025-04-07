const mysql = require('mysql2');

/* DEV POOL */
const poolDev = mysql.createPool({
    host: process.env.DB_HOST_DEV,
    user: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    port: process.env.DB_PORT_DEV,
    database: process.env.DB_NAME_DEV
});

/* PROD POOL */
const pool = mysql.createPool({
    host: process.env.DB_HOST_DEV,
    user: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    port: process.env.DB_PORT_DEV,
    database: process.env.DB_NAME_DEV
});

/* CHANGE POOL FOR PROD */
global.db = poolDev.promise();