const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/repositories/projects.repo');

const headersTech = {
  'x-user-id': 'test-tech-1',
  'x-user-role': 'technician'
};

const headersAdmin = {
  'x-user-id': 'test-admin-1',
  'x-user-role': 'admin'
};

const testPrefix = `Test Project ${Date.now()}`;
const makeTitle = (suffix) => `${testPrefix} ${suffix}`;

describe('Projects API', () => {
  afterAll(async () => {
    await prisma.project.deleteMany({
      where: {
        title: { startsWith: testPrefix }
      }
    });
    await prisma.$disconnect();
  });

  test('POST /api/projects crea proyecto', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set(headersTech)
      .send({
        title: makeTitle('POST'),
        clientName: 'Cliente A'
      });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  test('GET /api/projects lista solo los del tecnico', async () => {
    const adminRes = await request(app)
      .post('/api/projects')
      .set(headersAdmin)
      .send({
        title: makeTitle('ADMIN'),
        clientName: 'Cliente Admin'
      });

    const techRes = await request(app)
      .post('/api/projects')
      .set(headersTech)
      .send({
        title: makeTitle('TECH'),
        clientName: 'Cliente Tech'
      });

    const listRes = await request(app)
      .get('/api/projects?page=1&limit=50')
      .set(headersTech);

    expect(listRes.status).toBe(200);
    expect(listRes.body.ok).toBe(true);

    const ids = listRes.body.data.map((p) => p.id);
    const allOwned = listRes.body.data.every(
      (p) => p.createdByUserId === headersTech['x-user-id']
    );

    expect(allOwned).toBe(true);
    expect(ids).toContain(techRes.body.data.id);
    expect(ids).not.toContain(adminRes.body.data.id);
  });

  test('GET /api/projects/:id bloquea acceso a otro usuario', async () => {
    const adminRes = await request(app)
      .post('/api/projects')
      .set(headersAdmin)
      .send({
        title: makeTitle('ADMIN-PRIVATE'),
        clientName: 'Cliente Admin'
      });

    const res = await request(app)
      .get(`/api/projects/${adminRes.body.data.id}`)
      .set(headersTech);

    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('DELETE /api/projects/:id soft delete', async () => {
    const createRes = await request(app)
      .post('/api/projects')
      .set(headersAdmin)
      .send({
        title: makeTitle('DELETE'),
        clientName: 'Cliente Delete'
      });

    const delRes = await request(app)
      .delete(`/api/projects/${createRes.body.data.id}`)
      .set(headersAdmin);

    expect(delRes.status).toBe(200);
    expect(delRes.body.ok).toBe(true);

    const getRes = await request(app)
      .get(`/api/projects/${createRes.body.data.id}`)
      .set(headersAdmin);

    expect(getRes.status).toBe(404);
  });
});
