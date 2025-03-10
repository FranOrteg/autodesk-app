const router = require('express').Router();

const ensureAuthToken = require('../../helpers/middlewares');
const { listProjects } = require('../../models/projects.model');

router.get('/:hubId', ensureAuthToken, async (req,res) => {
    try {
        const hubId = req.params.hubId;
        const projects = await listProjects(req.accessToken, hubId);
        res.json(projects);
    } catch (error) {
        res.json({ fatal: error.message})
    }
})


module.exports = router;