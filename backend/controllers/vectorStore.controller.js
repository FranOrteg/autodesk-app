const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// Formatea las propiedades del modelo como texto legible por el asistente
function formatPropertiesToTextPerModel(modelName, urn, collection) {
  return `Nombre del modelo: ${modelName}\nURN: ${urn}\n\n` +
    collection.map((element) => {
      const props = Object.entries(element.properties || {})
        .map(([category, values]) => {
          return Object.entries(values)
            .map(([prop, val]) => `- ${prop}: ${val}`)
            .join("\n");
        })
        .join("\n");
      return `Elemento ${element.objectid}:\n${props}`;
    }).join("\n\n");
}

const uploadModelToVectorStore = async (req, res) => {
  try {
    const { modelName, urn, elements, properties } = req.body;

    if (!modelName || !urn || !elements || !properties) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Enriquecer elementos con propiedades
    const enrichedCollection = elements.map((el) => {
      const props = properties.filter((p) => p.element_id === el.objectid);
      const grouped = props.reduce((acc, { category, property_name, property_value }) => {
        if (!acc[category]) acc[category] = {};
        acc[category][property_name] = property_value;
        return acc;
      }, {});
      return { ...el, properties: grouped };
    });

    const content = formatPropertiesToTextPerModel(modelName, urn, enrichedCollection);

    const safeModelName = modelName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
    const filename = `${safeModelName}.txt`;
    const filepath = path.join(__dirname, "..", "temp", filename);

    // Guardar archivo temporalmente
    await fsp.writeFile(filepath, content);

    // Subir archivo a OpenAI
    const file = await openai.files.create({
      file: fs.createReadStream(filepath),
      purpose: "assistants",
    });

    // Asociar archivo al vector store
    await openai.vectorStores.fileBatches.create(VECTOR_STORE_ID, {
        file_ids: [file.id],
    });
      
    // Eliminar archivo temporal
    await fsp.unlink(filepath);

    res.status(200).json({
      message: `Modelo "${modelName}" subido correctamente al vector store`,
      file_id: file.id,
      filename,
    });

  } catch (error) {
    console.error("Error al subir el modelo a Vector Store:", error);
    res.status(500).json({ error: "Error interno", detail: error.message });
  }
};

module.exports = {
  uploadModelToVectorStore,
};
