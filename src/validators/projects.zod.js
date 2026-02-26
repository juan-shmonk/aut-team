const { z } = require('zod');

const statusEnum = z.enum(['DRAFT', 'IN_PROGRESS', 'DONE', 'CANCELED']);

const scheduledAtCreateSchema = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.coerce.date().optional()
);

const scheduledAtUpdateSchema = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.union([z.coerce.date(), z.null()]).optional()
);

const createProjectSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    clientName: z.string().trim().min(2).max(120),
    clientEmail: z.string().trim().email().optional(),
    phone: z.string().trim().min(3).max(30).optional(),
    address: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    status: statusEnum.optional(),
    scheduledAt: scheduledAtCreateSchema
  })
  .strict();

const updateProjectSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    clientName: z.string().trim().min(2).max(120).optional(),
    clientEmail: z.string().trim().email().nullable().optional(),
    phone: z.string().trim().min(3).max(30).nullable().optional(),
    address: z.string().trim().min(3).max(200).nullable().optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: statusEnum.optional(),
    scheduledAt: scheduledAtUpdateSchema
  })
  .strict();

module.exports = {
  createProjectSchema,
  updateProjectSchema
};
