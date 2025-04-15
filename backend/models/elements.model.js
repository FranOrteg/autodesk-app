/* ######## */
/* ##BBDD## */
/* ######## */

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD.
 */
const getDbElements = () => {
    return db.query('SELECT * FROM elements');
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por ID.
 */
const getDbElementsById = (elementId) => {
    return db.query('SELECT * FROM elements WHERE id = ?', [elementId]);
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por Nombre.
 */
const getDbElementsByName = (elementName) => {
    return db.query('SELECT * FROM elements WHERE name = ?', [elementName]);
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por Nombre.
 */
const getDbElementsByModelId = (modelId) => {
    return db.query('SELECT * FROM elements WHERE model_id = ?', [modelId]);
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por Tipo.
 */
const getDbElementsByType = (type) => {
    return db.query('SELECT * FROM elements WHERE type = ?', [type]);
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por Tipo.
 */
const getDbElementsByObjectid = (objectid) => {
    return db.query('SELECT * FROM elements WHERE objectid = ?', [objectid]);
};


/**
 * Almacena los elementos del modelo en la BBDD.
 */
const insertElementsBatch = async (elements) => {
    if (elements.length === 0) return;

    const values = elements.map(e => [e.objectid, e.name, e.externalId, e.type, e.model_id]);
    
    const query = `
        INSERT INTO elements (objectid, name, externalId, type, model_id) 
        VALUES ? 
        ON DUPLICATE KEY UPDATE name = VALUES(name), type = VALUES(type)
    `;

    return db.query(query, [values]);
};


module.exports = {
    getDbElements,
    getDbElementsById,
    insertElementsBatch,
    getDbElementsByName,
    getDbElementsByModelId,
    getDbElementsByType,
    getDbElementsByObjectid
}