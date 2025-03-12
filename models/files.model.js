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
 * Función recursiva para listar todo el contenido de un folder en Autodesk ACC
 */

async function listFolderContentsRecursively(accessToken, projectId, folderId) {
  const resp = await axios.get(
    `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${folderId}/contents`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  return Promise.all(resp.data.data.map(async (item) => {
    const simplifiedItem = {
      id: item.id,
      name: item.attributes.displayName || item.attributes.name,
      type: item.type
    };

    if (item.type === 'folders') {
      simplifiedItem.children = await listFolderContentsRecursively(accessToken, projectId, item.id);
    }

    return simplifiedItem;
  }));
}

  

module.exports = {
    listFolderContentsRecursively,
    getFolderDetails
};
