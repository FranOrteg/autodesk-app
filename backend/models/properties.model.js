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
 * Extrae todos los elementos del modelo con información detallada.
 */
async function extractRevitElements(accessToken, urn) {
    try {
        // 1. Verificar si el modelo está completamente procesado
        const manifest = await getModelStatus(accessToken, urn);
        if (manifest.progress !== "complete") {
            throw new Error(`El modelo aún no está completamente procesado. Progreso: ${manifest.progress}`);
        }

        // 2 Obtener metadata del modelo
        const metadata = await getMetadata(accessToken, urn);
        if (!metadata.data.metadata || metadata.data.metadata.length === 0) {
            throw new Error("No metadata found for the model.");
        }

        // 3 Buscar GUIDs 3D
        const guidList = metadata.data.metadata.filter(view => view.role === "3d").map(view => view.guid);
        if (guidList.length === 0) {
            throw new Error("No se encontraron vistas 3D en el modelo.");
        }

        console.log(`Se encontraron ${guidList.length} vistas 3D. Procesando todas...`);

        // 4 Diccionario de elementos organizados
        const elements = {
            walls: [], doors: [], windows: [], floors: [],
            materials: [], furniture: [], rooms: [], others: []
        };

        // 5 Recorrer cada GUID 3D y extraer propiedades
        for (const guid of guidList) {
            console.log(`Procesando GUID: ${guid}`);

            const propertiesData = await getAllProperties(accessToken, urn, guid);
            if (!propertiesData.data.collection || propertiesData.data.collection.length === 0) {
                console.warn(`No se encontraron propiedades en la vista 3D GUID: ${guid}`);
                continue;
            }

            // 6 Clasificación de elementos
            propertiesData.data.collection.forEach(obj => {
                const identityData = obj.properties["Identity Data"] || {};
                const category = identityData.Category || identityData["Revit Category"] || "Other";
                const ifcEntity = obj.properties["IFC Parameters"]?.IfcEntity || "";
                const familyName = identityData.Family || "Unknown Family";
                const typeName = identityData["Type Name"] || "Unknown Type";
                const material = obj.properties.Materials?.["Main Material"] || "No Material";
                const volume = obj.properties.Dimensions?.["Gross Volume"] || "N/A";
                const area = obj.properties.Dimensions?.["Gross Floor Area"] || "N/A";
                const cost = identityData.Cost || "Unknown";
                const level = obj.properties["Constraints"]?.["Level"] || "No Level";
                const phase = obj.properties["Phasing"]?.["Phase Created"] || "Unknown Phase";
                const categoryType = obj.properties["Category Type"]?.["Category Type"] || "Unknown Type";
                const boundingBox = obj.boundingBox || { min: [0,0,0], max: [0,0,0] };

                // Objeto final con toda la info
                const elementData = {
                    id: obj.objectId,
                    name: obj.name || typeName || familyName,
                    category,
                    family: familyName,
                    type: typeName,
                    material,
                    volume,
                    area,
                    cost,
                    level,
                    phase,
                    categoryType,
                    ifcEntity,
                    boundingBox,
                    properties: obj.properties
                };

                // Asignación por categorías
                if (category.toLowerCase().includes("wall")) {
                    elements.walls.push(elementData);
                } else if (category.toLowerCase().includes("door")) {
                    elements.doors.push(elementData);
                } else if (category.toLowerCase().includes("window")) {
                    elements.windows.push(elementData);
                } else if (category.toLowerCase().includes("floor")) {
                    elements.floors.push(elementData);
                } else if (category.toLowerCase().includes("material")) {
                    elements.materials.push(elementData);
                } else if (category.toLowerCase().includes("furniture")) {
                    elements.furniture.push(elementData);
                } else if (category.toLowerCase().includes("room")) {
                    elements.rooms.push(elementData);
                } else {
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


module.exports = {
    getModelStatus,
    extractRevitElements,
    getModelObjects,
    getMetadata
}