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
 * Obtiene todos los elementos de un modelo .RVT a partir de su GUID.
 */

async function getModelObjects(accessToken, urn, guid){
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}`;
    
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
 * Obtiene todas las propiedades de los elementos del modelo.
 */

async function getAllProperties(accessToken, urn, guid) {
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
 * Extrae TODOS los elementos del modelo, con sus familias, materiales y dimensiones.
 */
async function extractRevitElements(accessToken, urn) {
    try {
        // 1. Obtener metadata del modelo
        const metadata = await getMetadata(accessToken, urn);
        if (!metadata.data.metadata || metadata.data.metadata.length === 0) {
            throw new Error("No metadata found for the model.");
        }

        // 2. Filtrar solo los GUID que tienen "role": "3d"
        const guidList = metadata.data.metadata.filter(view => view.role === "3d").map(view => view.guid);
        if (guidList.length === 0) {
            throw new Error("No se encontraron vistas 3D en el modelo.");
        }

        console.log(`Se encontraron ${guidList.length} vistas 3D. Procesando todas...`);

        // 3. Recorrer todos los GUIDs 3D y combinar los resultados
        const elements = {
            walls: [],
            doors: [],
            windows: [],
            floors: [],
            materials: [],
            others: []
        };

        for (const guid of guidList) {
            console.log(`Procesando GUID: ${guid}`);

            // Obtener objetos del modelo
            const modelObjects = await getModelObjects(accessToken, urn, guid);
            if (!modelObjects.data.objects || modelObjects.data.objects.length === 0) {
                console.warn(`No se encontraron objetos en la vista 3D GUID: ${guid}`);
                continue;
            }

            // Obtener propiedades de los objetos
            const propertiesData = await getAllProperties(accessToken, urn, guid);
            if (!propertiesData.data.collection || propertiesData.data.collection.length === 0) {
                console.warn(`No se encontraron propiedades en la vista 3D GUID: ${guid}`);
                continue;
            }

            // Organizar datos por categoría
            propertiesData.data.collection.forEach(obj => {
                const category = obj.properties["Identity Data"]?.Category || "Other";
                const elementData = {
                    id: obj.objectId,
                    name: obj.name || "Unnamed",
                    category,
                    properties: obj.properties
                };

                switch (category.toLowerCase()) {
                    case "walls":
                        elements.walls.push(elementData);
                        break;
                    case "doors":
                        elements.doors.push(elementData);
                        break;
                    case "windows":
                        elements.windows.push(elementData);
                        break;
                    case "floors":
                        elements.floors.push(elementData);
                        break;
                    case "materials":
                        elements.materials.push(elementData);
                        break;
                    default:
                        elements.others.push(elementData);
                }
            });
        }

        return elements;
    } catch (error) {
        console.error("Error extracting elements:", error.message);
        throw error;
    }
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
    extractRevitElements,
    getModelObjects,
    getProperties,
    getMetadata
}