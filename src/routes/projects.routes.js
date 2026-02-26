const express = require('express');
const controller = require('../controllers/projects.controller');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.use(requireAuth);

router.post('/', controller.createProject);
router.get('/', controller.listProjects);
router.get('/:id', controller.getProjectById);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);

module.exports = router;
