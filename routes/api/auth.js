// routes/api/auth.js
const router = require('express').Router();

router.get('/', (req, res) => {
    res.send({ message: 'Auth API funcionando!' });
});

module.exports = router;
