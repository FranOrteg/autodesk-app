const express = require('express');
const router = express.Router();
const ensureAuthToken = require('../../helpers/middlewares');
const { getMetadata, 
        extractRevitElements, 
        getModelObjects, 
        getModelStatus, 
        getAllProperties,
        getDbProperties,
        insertElements,
        insertProperties
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

router.get('/:projectId/:urn/allElements', ensureAuthToken, async (req, res) => {
    try {
        const { projectId, urn } = req.params;

        // Obtener todos los elementos del modelo
        const elements = await extractRevitElements(req.accessToken, urn);

        res.json(elements);
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

router.get('/models', async (req,res) => {
    try {
        const [properties] = await getDbProperties();

        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.post('/storeModelData', async (req, res) => {
    try {
        const { elements, properties } = req.body;

        if (!elements || !properties) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Insertar elementos y obtener sus `id`
        for (const element of elements) {
            const { objectid, name, externalId, type } = element;
            // Insertar el elemento y obtener el id generado
            const elementId = await insertElements({ objectid, name, externalId, type });
            console.log(`Elemento insertado con ID: ${elementId}`);

            // Actualizar las propiedades para usar el `elementId`
            const elementProperties = properties.filter(p => p.element_id === objectid);
            for (const property of elementProperties) {
                const { category, property_name, property_value } = property;
                // Usamos el `elementId` para asociar las propiedades
                await insertProperties({ element_id: elementId, category, property_name, property_value });
            }
        }

        res.json({ message: 'Datos almacenados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
})

module.exports = router;