const router = require('express').Router();

router.use('/auth', require('./api/auth'));

module.exports = router;