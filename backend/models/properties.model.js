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
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/${guid}/properties?forceget=true`;

    const { data } = await axios.get(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return data;
}

/* ######## */
/* ##BBDD## */
/* ######## */

/**
 * Obtiene todas las propiedades de los elementos del modelo almacenadas en la BBDD.
 */
const getDbProperties = () => {
    return db.query('SELECT * FROM properties');
};

/**
 * Obtiene todas las propiedades de los elementos del modelo almacenadas en la BBDD mediante su ID.
 */
const getDbPropertiesById = (propertiesId) => {
    return db.query('SELECT * FROM properties WHERE id = ?', [propertiesId]);
};

/**
 * Obtiene todas las propiedades de los elementos del modelo almacenadas en la BBDD mediante su Categoria.
 */
const getDbPropertiesByCategory = (category) => {
    return db.query('SELECT * FROM properties WHERE category = ?', [category]);
};

/**
 * Obtiene todas las propiedades de los elementos del modelo almacenadas en la BBDD mediante el Id del elemento.
 */
const getDbPropertiesByElementId = (element_objectid) => {
    return db.query('SELECT * FROM properties WHERE element_objectid = ?', [element_objectid]);
};


/**
 * Almacena las propuedades del modelo en la BBDD.
 */
const insertPropertiesBatch = async (properties) => {
    if (properties.length === 0) return;

    const values = properties.map(p => [p.element_objectid, p.category, p.property_name, p.property_value, p.model_id]);
    
    const query = `
        INSERT INTO properties (element_objectid, category, property_name, property_value, model_id) 
        VALUES ? 
        ON DUPLICATE KEY UPDATE property_value = VALUES(property_value)
    `;

    return db.query(query, [values]);
};


module.exports = {
    getModelStatus,
    getModelObjects,
    getAllProperties,
    getMetadata,
    insertPropertiesBatch,
    getDbProperties,
    getDbPropertiesById,
    getDbPropertiesByCategory,
    getDbPropertiesByElementId
}