// files.model.js
const axios = require('axios');

/**
 * Llama a la API de Autodesk para obtener la información (metadata) de un folder concreto.
 * Esto es opcional, pero útil si quieres el "nombre" de la carpeta (displayName).
 */

async function getFolderDetails(accessToken, projectId, folderId) {
    const resp = await axios.get(
      `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}`,
      {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
            }
      }
    );
    // Retorna la data completa; en resp.data.data.attributes.displayName está el nombre
    return resp.data.data; 
  }

/**
 * Función recursiva para listar únicamente archivos .rvt
 */

async function listRvtFiles(accessToken, projectId, folderId) {
  const contentsUrl = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`;

  const { data } = await axios.get(contentsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  let rvtFiles = [];

  for (const item of data.data) {
    if (item.type === 'folders') {
      // Si es una carpeta, busca dentro recursivamente
      const nestedFiles = await listRvtFiles(accessToken, projectId, item.id);
      rvtFiles = rvtFiles.concat(nestedFiles);
    } else if (item.type === 'items' && item.attributes.displayName.endsWith('.rvt')) {
      // Si es un archivo .rvt, añádelo
      rvtFiles.push({
        id: item.id,
        name: item.attributes.displayName,
        type: item.type,
      });
    }
  }

  return rvtFiles;
}

async function getFileVersionId(accessToken, projectId, itemId) {
  const url = `https://developer.api.autodesk.com/data/v1/projects/${projectId}/items/${itemId}/versions`;

  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const versionId = data.data[0].id;
  return versionId;
}


module.exports = {
  listRvtFiles,
  getFolderDetails,
  getFileVersionId,
};
