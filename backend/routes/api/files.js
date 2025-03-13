// files.js
const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');

const { listProjects } = require('../../models/projects.model');
const { listFolderContentsRecursively, getFolderDetails } = require('../../models/files.model');


router.get('/:hubId/:projectId/files', ensureAuthToken, async (req, res) => {
    try {
      const { hubId, projectId } = req.params;
  
      // 1) Obtener la lista de proyectos en ese hub
      const projects = await listProjects(req.accessToken, hubId);
      console.log(projects);
      
      // 2) Encontrar el proyecto que coincida con el 'projectId' del path
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        throw new Error(`No se encontró el proyecto con id ${projectId} en el hub ${hubId}`);
      }
  
      // 3) Extraer el rootFolderId de "relationships.rootFolder.data.id"
      const rootFolderId = project.rootFolder;
      
      // 4) (Opcional) Si quieres el "nombre" de esa carpeta raíz:
      // const folderInfo = await getFolderDetails(req.accessToken, projectId, rootFolderId);
      // console.log("El nombre del folder raíz es:", folderInfo.attributes.displayName);
  
      // 5) Ahora sí, listar recursivamente todo su contenido
      const filesStructure = await listFolderContentsRecursively(req.accessToken, projectId, rootFolderId);
  
      res.json(filesStructure);
    } catch (error) {
      console.error(error);
      res.status(500).json({ fatal: error.message });
    }
  });
  
module.exports = router;
