const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');

const { extractRevitProperties } = require('../../models/properties.model');

router.get('/:projectId/:urn/properties', ensureAuthToken, async (req, res) => {
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