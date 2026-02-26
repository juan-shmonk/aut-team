const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Projects API - Reportes Técnicos',
    version: '1.0.0',
    description: 'CRUD de Proyectos/Servicios para instalaciones solares.'
  },
  servers: [
    { url: 'http://localhost:3000' }
  ],
  tags: [
    { name: 'Projects' }
  ],
  components: {
    securitySchemes: {
      userId: {
        type: 'apiKey',
        in: 'header',
        name: 'x-user-id'
      },
      userRole: {
        type: 'apiKey',
        in: 'header',
        name: 'x-user-role'
      }
    },
    schemas: {
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', minLength: 3, maxLength: 120 },
          clientName: { type: 'string', minLength: 2, maxLength: 120 },
          clientEmail: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED'] },
          scheduledAt: { type: 'string', format: 'date-time', nullable: true },
          createdByUserId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          isDeleted: { type: 'boolean' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      ProjectCreate: {
        type: 'object',
        required: ['title', 'clientName'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 120 },
          clientName: { type: 'string', minLength: 2, maxLength: 120 },
          clientEmail: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED'] },
          scheduledAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      ProjectUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 120 },
          clientName: { type: 'string', minLength: 2, maxLength: 120 },
          clientEmail: { type: 'string', format: 'email', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED'] },
          scheduledAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Meta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 12 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          pages: { type: 'integer', example: 2 }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } }
            }
          }
        }
      }
    }
  },
  security: [
    { userId: [], userRole: [] }
  ],
  paths: {
    '/api/projects': {
      get: {
        tags: ['Projects'],
        summary: 'Listar proyectos',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', example: 'createdAt' } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
        ],
        responses: {
          200: {
            description: 'Lista de proyectos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Project' } },
                    meta: { $ref: '#/components/schemas/Meta' }
                  }
                }
              }
            }
          },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Prohibido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Crear proyecto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProjectCreate' }
            }
          }
        },
        responses: {
          201: {
            description: 'Proyecto creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          400: { description: 'Validación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Detalle de proyecto',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Proyecto',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          404: { description: 'No encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      put: {
        tags: ['Projects'],
        summary: 'Actualizar proyecto',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProjectUpdate' }
            }
          }
        },
        responses: {
          200: {
            description: 'Proyecto actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          400: { description: 'Validación', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'No encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      },
      delete: {
        tags: ['Projects'],
        summary: 'Eliminar proyecto (soft delete)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Proyecto eliminado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          },
          404: { description: 'No encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
