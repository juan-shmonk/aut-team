const projectsRepo = require('../repositories/projects.repo');
const { AppError } = require('../utils/AppError');

const STATUS_VALUES = ['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED'];
const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'title',
  'status',
  'scheduledAt',
  'clientName'
]);

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function parseSort(query) {
  const sortBy = ALLOWED_SORT_FIELDS.has(query.sortBy)
    ? query.sortBy
    : 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { sortBy, sortOrder };
}

function parseStatus(status) {
  if (!status) return undefined;
  if (!STATUS_VALUES.includes(status)) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid status value',
      details: [{ field: 'status', message: `Allowed: ${STATUS_VALUES.join(', ')}` }]
    });
  }
  return status;
}

function buildWhere(user, query) {
  const where = { isDeleted: false };

  if (user.role === 'technician') {
    where.createdByUserId = user.id;
  }

  const status = parseStatus(query.status);
  if (status) {
    where.status = status;
  }

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { clientName: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  return where;
}

async function createProject(data, user) {
  const payload = { ...data, createdByUserId: user.id };
  return projectsRepo.createProject(payload);
}

async function listProjects(query, user) {
  const where = buildWhere(user, query);
  const { page, limit, skip } = parsePagination(query);
  const { sortBy, sortOrder } = parseSort(query);

  const result = await projectsRepo.listProjects(
    where,
    { [sortBy]: sortOrder },
    skip,
    limit
  );

  const pages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    items: result.items,
    meta: {
      total: result.total,
      page,
      limit,
      pages
    }
  };
}

async function getProjectById(id, user) {
  const where = { id, isDeleted: false };
  if (user.role === 'technician') {
    where.createdByUserId = user.id;
  }

  const project = await projectsRepo.findProject(where);
  if (!project) {
    throw new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Project not found'
    });
  }
  return project;
}

async function updateProject(id, data, user) {
  if (!data || Object.keys(data).length === 0) {
    throw new AppError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'No fields to update'
    });
  }

  const where = { id, isDeleted: false };
  if (user.role === 'technician') {
    where.createdByUserId = user.id;
  }

  const existing = await projectsRepo.findProject(where);
  if (!existing) {
    throw new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Project not found'
    });
  }

  return projectsRepo.updateProject(existing.id, data);
}

async function deleteProject(id, user) {
  const where = { id, isDeleted: false };
  if (user.role === 'technician') {
    where.createdByUserId = user.id;
  }

  const existing = await projectsRepo.findProject(where);
  if (!existing) {
    throw new AppError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Project not found'
    });
  }

  return projectsRepo.updateProject(existing.id, {
    isDeleted: true,
    deletedAt: new Date()
  });
}

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject
};
