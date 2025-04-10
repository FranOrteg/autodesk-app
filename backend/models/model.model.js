/* ######## */
/* ##BBDD## */
/* ######## */

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
    insertModel,
    getDbModels,
    getDbModelsById,
    getDbModelsByName,
}