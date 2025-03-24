// models/properties.model.js
const axios = require('axios');

/**
 * Obtiene el `metadata` del archivo Revit en Model Derivative API.
 */

async function getMetadata(accessToken, urn) {
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata`;

    const { data } = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return data;
}

/**
 * Obtiene el estado del modelo para saber si está completamente procesado.
 */

async function getModelStatus(accessToken, urn) {
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`;

    const { data } = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return data;
}

/**
 * Obtiene las propiedades de un objeto dentro del archivo Revit.
 * - `urn`: URN del modelo.
 * - `guid`: GUID de la estructura interna del archivo (viene de getMetadata).
 */

async function getProperties(accessToken, urn, guid) {
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties`;

    const { data } = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return data;
}

/**
 * Extrae todas las propiedades organizadas por objectId.
 */

async function extractRevitProperties(accessToken, urn){
    try {
        
        // 1. Verificar si el modelo está completamente procesado
        const manifest = await getModelStatus(accessToken, urn);
        if (manifest.progress !== "complete") {
            throw new Error(`El modelo aún no está completamente procesado. Progreso: ${manifest.progress}`);
        }

        // 2. Obtener metadata del modelo
        const metadata = await getMetadata(accessToken, urn);
        
        if(!metadata.data.metadata || metadata.data.metadata.length === 0){
            throw new Error('No metadata found for the model.');
        }

        // 3. Extraer el primer GUID disponible (puede haber varios)
        let guid = metadata.data.metadata.find(view => view.isMasterView)?.guid || metadata.data.metadata[0].guid;

        // 4. Obtener propiedades del modelo
        const propertiesData = await getProperties(accessToken, urn, guid);
        if (!propertiesData.data.collection) {
            throw new Error("No se encontraron propiedades en la respuesta de la API.");
        }

        // 4. Formatear las propiedades en un objeto organizado por objectId
        const propertiesMap = {};
        propertiesData.data.collection.forEach(obj => {
            propertiesMap[obj.objectId] = obj.properties;
        })

        return propertiesMap;
    } catch (error) {
        console.error("Error fetching Revit properties:", error.message);
        throw error;
    }
}

module.exports = {
    extractRevitProperties,
    getModelStatus,
    getMetadata
}