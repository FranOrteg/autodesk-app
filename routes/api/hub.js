const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');

const { getHub } = require('../../models/auth.model');

router.get('/',ensureAuthToken, async (req,res) => {
    try {
        const hub = await getHub(req.accessToken);
        res.json(hub);
    } catch (error) {
        res.json({ fatal: error.message });
    }
})

module.exports = router;
