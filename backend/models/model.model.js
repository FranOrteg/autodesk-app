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
 * Obtiene todos las elementos del modelo almacenadas en la BBDD.
 */
const getDbElements = () => {
    return db.query('SELECT * FROM elements');
};

/**
 * Obtiene todos las elementos del modelo almacenadas en la BBDD por ID.
 */
const getDbElementsById = (elementId) => {
    return db.query('SELECT * FROM elements WHERE id', [elementId]);
};

/**
 * Obtiene todos los modelos almacenadas en la BBDD.
 */
const getDbModels = () => {
    return db.query('SELECT * FROM models;');
};

/**
 * Obtiene todos los modelos almacenadas en la BBDD.
 */
const getDbModelsById = (modelId) => {
    return db.query('SELECT * FROM models WHERE id = ?;', [modelId]);
};

/**
 * Obtiene el modelo almacenadas en la BBDD por ID.
 */
const getDbModelsByName = (modelName) => {
    return db.query('SELECT * FROM models WHERE name = ?;', [modelName]);
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

/**
 * Insertar modelo en la BBDD
 */
const insertModel = async (model) => {
    const result = await db.query(
        'INSERT INTO models (name, urn) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [model.name, model.urn]
    );

    // Verificar que se obtuvo un ID válido
    const insertId = result[0].insertId;
    if (!insertId) {
        throw new Error(`Error: No se pudo obtener el ID del modelo para ${model.name}`);
    }

    return insertId;
};

module.exports = {
    getDbProperties,
    getDbElements,
    insertElementsBatch,
    insertModel,
    getDbModels,
    getDbModelsById,
    getDbElementsById,
    getDbModelsByName
}