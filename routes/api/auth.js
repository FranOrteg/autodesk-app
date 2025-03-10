const router = require('express').Router();

const { getAccessToken } = require('../../models/auth.model')

router.get('/', async (req, res) => {
    try {
        const token = await getAccessToken();
        res.json(token)
    } catch (error) {
        res.json({ fatal: error.message });
    }
});

module.exports = router;
