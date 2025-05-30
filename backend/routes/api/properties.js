const express = require('express');
const router = express.Router();
const ensureAuthToken = require('../../helpers/middlewares');
const { getMetadata, 
        getModelObjects, 
        getModelStatus, 
        getAllProperties,
        translateModel
    } = require('../../models/properties.model');

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

router.get('/:urn/:guid/modelObjects', ensureAuthToken, async (req,res) => {
    try {
        const { urn, guid } = req.params;

        // obtener las propiedades del archivo
        const modelObjects = await getModelObjects(req.accessToken, urn, guid);

        res.json(modelObjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.get('/:urn/:guid/allElementsHard', ensureAuthToken, async (req, res) => {
    try {
        const { urn, guid } = req.params;

        // Obtener todos los elementos del modelo
        const elements = await getAllProperties(req.accessToken, urn, guid);

        res.json(elements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.get('/:urn/modelStatus', ensureAuthToken, async (req, res) => {
    try {
        const { urn } = req.params;

        // obtener las propiedades del archivo
        const modelStatus = await getModelStatus(req.accessToken, urn);

        res.json(modelStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.post('/:urn/translate', ensureAuthToken, async (req, res) => {
    try {
        const { urn } = req.params;

        // obtener las propiedades del archivo
        const translate = await translateModel(req.accessToken, urn);

        res.json(translate);
    } catch (error) {
        console.error("error al traducir el modelo");
        res.status(500).json({ fatal: error.message });
    }
});

module.exports = router;