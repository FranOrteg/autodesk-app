const router = require('express').Router();

// AccessToken
router.use('/auth', require('./api/auth'));

// Hubs
router.use('/hub', require('./api/hub'));

// Projects
router.use('/projects', require('./api/projects'));

// Files
router.use('/root', require('./api/files'));

module.exports = router;