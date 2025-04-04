const express = require('express');
const router = express.Router();

const { insertModel, 
        insertElementsBatch, 
        insertPropertiesBatch, 
        getDbProperties,
        getDbElements,
        getDbModels,
        getDbModelsById
    } = require('../../models/model.model');

/* GET */

router.get('/modelProperties', async (req,res) => {
    try {
        const [properties] = await getDbProperties();

        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.get('/modelElements', async (req,res) => {
    try {
        const [elements] = await getDbElements();

        res.json(elements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.get('/getModels', async (req,res) => {
    try {
        const [models] = await getDbModels();

        res.json(models);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

router.get('/getModels/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const [models] = await getDbModelsById(modelId);

        res.json(models);
    } catch (error) {
        console.error(error);
        res.status(500).json({ fatal: error.message });
    }
});

/* POST */

router.post('/storeModelData', async (req, res) => {
    try {
        const { modelName, urn, elements, properties } = req.body;

        if (!modelName || !urn || !elements || !properties) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        console.log(`⏳ Insertando modelo: ${modelName} con URN ${urn}...`);

        // Insertar el modelo y obtener su ID
        const modelId = await insertModel({ name: modelName, urn });

        if (!modelId || modelId === 0) {
            throw new Error(`Error: modelId inválido (${modelId})`);
        }

        console.log(`✅ Modelo insertado con ID: ${modelId}`);

        // Insertar elementos en lotes
        const chunkSize = 1000; // Cantidad de registros por batch

        for (let i = 0; i < elements.length; i += chunkSize) {
            const chunk = elements.slice(i, i + chunkSize).map(element => ({
                ...element,
                model_id: modelId
            }));
            await insertElementsBatch(chunk);
        }
        console.log(`✅ Se han insertado ${elements.length} elementos en el modelo ${modelId}`);

        // Insertar propiedades en lotes
        const validProperties = properties.filter(property => 
            elements.some(e => e.objectid === property.element_id) // Filtra las propiedades sin elemento válido
        );

        for (let i = 0; i < validProperties.length; i += chunkSize) {
            const chunk = validProperties.slice(i, i + chunkSize).map(property => ({
                ...property,
                model_id: modelId
            }));
            await insertPropertiesBatch(chunk);
        }
        console.log(`✅ Se han insertado ${validProperties.length} propiedades en el modelo ${modelId}`);

        res.status(200).json({ success: true, message: "Modelo y propiedades insertadas correctamente." });
    } catch (error) {
        console.error("Error al almacenar datos:", error);
        res.status(500).json({ fatal: error.message });
    }
});


module.exports = router;