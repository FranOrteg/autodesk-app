const mysql = require('mysql2');
require('dotenv').config(); 

const isProduction = process.env.NODE_ENV === 'production';

// Configuración del pool de desarrollo
const poolDev = mysql.createPool({
    host: process.env.DB_HOST_DEV,
    user: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    port: process.env.DB_PORT_DEV,
    database: process.env.DB_NAME_DEV
});

// Configuración del pool de producción
const poolProd = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Selección del pool en función del entorno
const pool = isProduction ? poolProd : poolDev;

// Mensajes de control
console.log('🌍 Entorno:', isProduction ? 'Producción' : 'Desarrollo');
console.log('🛠 Conectando a:', isProduction ? process.env.DB_HOST : process.env.DB_HOST_DEV);

// Verificar la conexión una vez al iniciar
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos!');
        connection.release();
    }
});

// Hacer disponible el pool globalmente como promesa
global.db = pool.promise();
