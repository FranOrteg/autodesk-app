const fs = require("fs/promises");
const path = require("path");
const { OpenAI } = require("openai");
const { v4: uuidv4} = require("uuid");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Formatear propiedades del modelo como texto
function formatPropertiesToTextPerModel(modelName, urn, collection) {
    return `Nombre del modelo: ${modelName}
  URN: ${urn}
  
  ` + collection
      .map((element) => {
        const props = Object.entries(element.properties || {})
          .map(([category, values]) => {
            return Object.entries(values)
              .map(([prop, val]) => `- ${prop}: ${val}`)
              .join("\n");
          })
          .join("\n");
  
        return `Elemento ${element.objectid}:\n${props}`;
      })
      .join("\n\n");
}

exports.uploadModelToVectorStore = async (req, res) => {
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
      // Generar texto
      const content = formatPropertiesToTextPerModel(modelName, urn, enrichedCollection);
      // Crear nombre de archivo basado en el nombre del modelo
      const safeModelName = modelName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
      const filename = `${safeModelName}.txt`;
      const filepath = path.join(__dirname, "..", "temp", filename);
      // Guardar archivo local temporalmente
      await fs.writeFile(filepath, content);
      // Subir archivo a OpenAI
      const file = await openai.files.create({
        file: await fs.readFile(filepath),
        purpose: "assistants",
      });
      // Asociar archivo al vector store
      await openai.beta.vectorStores.files.create(VECTOR_STORE_ID, {
      file_id: file.id,
      });

      // (Opcional) Asociar vector store al assistant
      await openai.beta.assistants.update(ASSISTANT_ID, {
        tool_resources: {
          vector_stores: [VECTOR_STORE_ID],
        },
      });

      // Eliminar archivo temporal
      await fs.unlink(filepath);
      // Devolver confirmación
      res.status(200).json({
          message: `Modelo "${modelName}" subido correctamente`,
          file_id: file.id,
          filename,
      });
  } catch (error) {
    console.error("Error al subir el modelo a Vector Store:", error);
    res.status(500).json({ error: "Error interno", detail: error.message });
  }
};