/* ######## */
/* ##BBDD## */
/* ######## */

/**
 * Obtiene todas las propiedades de los elementos del modelo almacenadas en la BBDD.
 */
const getDbProperties = () => {
    return db.query('SELECT * FROM properties');
}

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
    insertElementsBatch,
    insertPropertiesBatch,
    insertModel,
}