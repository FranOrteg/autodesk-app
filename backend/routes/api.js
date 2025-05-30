const router = require('express').Router();

// AccessToken
router.use('/auth', require('./api/auth'));

// Hubs
router.use('/hub', require('./api/hub'));

// Projects
router.use('/projects', require('./api/projects'));

// Files
router.use('/root', require('./api/files'));

// Properties
router.use('/properties', require('./api/properties'));

// Model
router.use('/model', require('./api/model'));

// Elements
router.use('/elements', require('./api/elements'));

// VectorStore OpenAI
router.use('/vectorStore', require('./api/vectorStore'));


module.exports = router;