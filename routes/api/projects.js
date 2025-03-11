const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');

const { listProjects } = require('../../models/projects.model');

router.get('/:hubId', ensureAuthToken, async (req,res) => {
    try {
        const hubId = req.params.hubId;
        const projects = await listProjects(req.accessToken, hubId);

        /* const projectsWithRoot = await Promise.all(
            projects.data.map(async (project) => {
              const rootFolderId = await getProjectRootFolder(req.accessToken, hubId, project.id);
              return {
                ...project,
                // "rootFolder" será un string con el ID
                rootFolder: rootFolderId
              };
            })
          ); */
        res.json(projects);
    } catch (error) {
        res.json({ fatal: error.message})
    }
})


module.exports = router;