const router = require('express').Router();

const { getHub, getAccessToken } = require('../../models/auth.model')

router.get('/', async (req,res) => {
    try {
        const accessToken = await getAccessToken();
        const hub = await getHub(accessToken.access_token);
        res.json(hub);
    } catch (error) {
        res.json({ fatal: error.message });
    }
})

module.exports = router;
