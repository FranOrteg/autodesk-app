const express = require("express");
const router = express.Router();

const { getDbElements } = require('../../models/elements.model');

router.get('/modelElements', async (req,res) => {
    try {
        const [elements] = await getDbElements();

        res.json(elements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});


module.exports = router;