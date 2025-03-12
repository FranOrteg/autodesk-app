const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');
const { listProjects, getProjectById } = require('../../models/projects.model');


router.get('/:hubId', ensureAuthToken, async (req,res) => {
    try {
        const hubId = req.params.hubId;
        const projects = await listProjects(req.accessToken, hubId);

        res.json(projects);
    } catch (error) {
        res.json({ fatal: error.message})
    }
})

router.get('/:hubId/:projectId', ensureAuthToken, async (req, res) => {
    try {
        const { hubId, projectId } = req.params;
        const project = await getProjectById(req.accessToken, hubId, projectId);

        res.json(project);
    } catch (error) {
        res.json({ fatal: error.message})
    }
})


module.exports = router;