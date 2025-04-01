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
        insertProperties,
        insertModel
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
        const { modelName, urn, elements, properties } = req.body;

        if (!modelName || !urn || !elements || !properties) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Insertar el modelo y obtener su ID
        const modelId = await insertModel({ name: modelName, urn });
        console.log(`Modelo insertado con ID: ${modelId}`);


         // Insertar elementos
        for (const element of elements) {
            const { objectid, name, externalId, type } = element;
            await insertElements({ objectid, name, externalId, type,  model_id: modelId  });
            console.log(`Elemento insertado con objectID: ${objectid} en el modelo ${modelId}`);
        }

        // Insertar propiedades
        for (const property of properties) {
            const { element_id, category, property_name, property_value } = property;

            // Asegurar que element_id existe en elements como objectid
            const existingElement = elements.find(e => e.objectid === element_id);
            if (!existingElement) {
                console.warn(`Advertencia: No se encontró element_objectid=${element_id} en elements. Saltando.`);
                continue; // Evita insertar si no hay referencia válida
            }

            await insertProperties({ 
                element_objectid: element_id, 
                category, 
                property_name, 
                property_value,
                model_id: modelId 
            });
        }
            
        res.json({ message: 'Datos almacenados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
})

module.exports = router;