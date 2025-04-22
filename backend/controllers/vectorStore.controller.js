const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

function formatElementText(element) {
  const props = Object.entries(element.properties || {})
    .map(([category, values]) => {
      return Object.entries(values)
        .map(([prop, val]) => `[${category}] ${prop}: ${val}`)
        .join("\n");
    })
    .join("\n");

    return `Elemento ID: ${element.objectid}\nNombre: ${element.name}\nExternal ID: ${element.externalId}\nTipo: ${element.type}\n\nPropiedades:\n${props}`;
  }

function createChunksWithHeader(modelName, urn, enrichedCollection, chunkSize) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (let el of enrichedCollection) {
    const elementText = formatElementText(el);
    const elementBuffer = Buffer.from(elementText + "\n\n---\n\n", "utf-8");

    if (currentSize + elementBuffer.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(el);
    currentSize += elementBuffer.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function buildChunkText(modelName, urn, chunkIndex, totalChunks, chunkElements) {
  const header = `CHUNK ${chunkIndex + 1} OF ${totalChunks} (Modelo: ${modelName}, URN: ${urn})\n\n`;
  const body = chunkElements.map(formatElementText).join("\n\n---\n\n");
  return header + body;
}

const uploadModelToVectorStore = async (req, res) => {
  try {
    const { modelName, urn, elements, properties } = req.body;

    if (!modelName || !urn || !elements || !properties) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const enrichedCollection = elements.map((el) => {
      const props = properties.filter((p) => p.element_id === el.objectid);
      const grouped = props.reduce((acc, { category, property_name, property_value }) => {
        if (!acc[category]) acc[category] = {};
        acc[category][property_name] = property_value;
        return acc;
      }, {});
      return { ...el, properties: grouped };
    });

    const safeModelName = modelName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
    const tempDir = path.join(__dirname, "..", "temp");
    const CHUNK_SIZE = 10 * 1024 * 1024;

    const chunks = createChunksWithHeader(modelName, urn, enrichedCollection, CHUNK_SIZE);
    const totalChunks = chunks.length;
    const chunkFileIds = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunkText = buildChunkText(modelName, urn, i, totalChunks, chunks[i]);
      const chunkFilename = `${safeModelName}_chunk_${i + 1}_of_${totalChunks}.txt`;
      const chunkPath = path.join(tempDir, chunkFilename);

      await fsp.writeFile(chunkPath, chunkText);

      const file = await openai.files.create({
        file: fs.createReadStream(chunkPath),
        purpose: "assistants",
      });

      await openai.vectorStores.fileBatches.create(VECTOR_STORE_ID, {
        file_ids: [file.id],
      });

      chunkFileIds.push(file.id);
      //await fsp.unlink(chunkPath);
    }

    res.status(200).json({
      message: `Modelo "${modelName}" subido correctamente al vector store en ${totalChunks} fragmentos`,
      files_uploaded: chunkFileIds,
    });

  } catch (error) {
    console.error("Error al subir el modelo a Vector Store:", error);
    res.status(500).json({ error: "Error interno", detail: error.message });
  }
};

module.exports = {
  uploadModelToVectorStore,
};
