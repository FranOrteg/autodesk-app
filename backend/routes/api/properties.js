const express = require('express');
const router = express.Router();
const ensureAuthToken = require('../../helpers/middlewares');
const { extractRevitProperties, getMetadata } = require('../../models/properties.model');


router.get('/:projectId/:urn/rvtProperties', ensureAuthToken, async (req, res) => {
    try {
        const { projectId, urn } = req.params;

        // obtener las propiedades del archivo
        const properties = await extractRevitProperties(req.accessToken, urn);

        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
    
})

router.get('/meta/:urn/metadata', ensureAuthToken, async (req, res) => {
    try {
        const { urn } = req.params;

        // obtener las propiedades del archivo
        const metadata = await getMetadata(req.accessToken, urn);

        res.json(metadata);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }

})

module.exports = router;