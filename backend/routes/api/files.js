// files.js
const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');

const { listProjectsFiltered } = require('../../models/projects.model');
const { listRvtFiles } = require('../../models/files.model');


router.get('/:hubId/:projectId/files', ensureAuthToken, async (req, res) => {
    try {
      const { hubId, projectId } = req.params;
  
      // 1) Obtener la lista de proyectos en ese hub
      const projects = await listProjectsFiltered(req.accessToken, hubId);
      console.log(projects);
      
      // 2) Encontrar el proyecto que coincida con el 'projectId' del path
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        return res.status(404).json({ fatal: 'Project not found' });
      }
  
      // 2. Obtener el rootFolderId
      const rootFolderId = project.rootFolder;

      // 3. Listar sólo archivos .rvt recursivamente
      const rvtFiles = await listRvtFiles(req.accessToken, projectId, rootFolderId);

      res.json(rvtFiles);
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ fatal: error.message });
    }
  });
  
module.exports = router;
