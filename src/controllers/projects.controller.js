const projectsService = require('../services/projects.service');
const {
  createProjectSchema,
  updateProjectSchema
} = require('../validators/projects.zod');

async function createProject(req, res, next) {
  try {
    const payload = createProjectSchema.parse(req.body);
    const project = await projectsService.createProject(payload, req.user);
    res.status(201).json({ ok: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const result = await projectsService.listProjects(req.query, req.user);
    res.json({ ok: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

async function getProjectById(req, res, next) {
  try {
    const project = await projectsService.getProjectById(req.params.id, req.user);
    res.json({ ok: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const payload = updateProjectSchema.parse(req.body);
    const project = await projectsService.updateProject(
      req.params.id,
      payload,
      req.user
    );
    res.json({ ok: true, data: project });
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await projectsService.deleteProject(req.params.id, req.user);
    res.json({ ok: true, data: project });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject
};
