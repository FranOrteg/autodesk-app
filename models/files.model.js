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
  
    // 'contents' será un array de items: cada item puede ser 'folders' o 'items'
    const contents = resp.data.data || [];
  
    for (const item of contents) {
      // Si es subcarpeta, volvemos a hacer la llamada recursiva
      if (item.type === 'folders') {
        item.children = await listFolderContentsRecursively(accessToken, projectId, item.id);
      }
      // Si es 'items', son ficheros finales (o versiones). Dependiendo de tu necesidad, puedes filtrarlos.
    }
    
    return contents;
  }
  

module.exports = {
    listFolderContentsRecursively,
    getFolderDetails
};
