const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProject(data) {
  return prisma.project.create({ data });
}

async function findProject(where) {
  return prisma.project.findFirst({ where });
}

async function listProjects(where, orderBy, skip, take) {
  const [total, items] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy,
      skip,
      take
    })
  ]);

  return { total, items };
}

async function updateProject(id, data) {
  return prisma.project.update({
    where: { id },
    data
  });
}

module.exports = {
  prisma,
  createProject,
  findProject,
  listProjects,
  updateProject
};
