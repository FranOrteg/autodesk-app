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
    insertElementsBatch
}