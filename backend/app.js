const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(logger('dev'));

// Aumenta el límite de tamaño permitido (por ejemplo, 50MB)
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Rutas
app.use('/api', require('./routes/api'));

module.exports = app;
