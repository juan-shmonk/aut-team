# Solar Tech Reports - Projects API

CRUD de Proyectos/Servicios para reportes tecnicos de instalaciones solares.

## Requisitos
- Node.js 20+
- PostgreSQL

## Configuracion
1. Copia `.env.example` a `.env` y ajusta `DATABASE_URL`.
2. Instala dependencias:

```bash
npm install
```

3. Genera Prisma Client:

```bash
npx prisma generate
```

4. Crea la base con migracion inicial:

```bash
npx prisma migrate dev --name init
```

5. Ejecuta en desarrollo:

```bash
npm run dev
```

## Auth simulada
Todos los endpoints requieren headers:
- `x-user-id`
- `x-user-role` (`admin` o `technician`)

Ejemplo:
```bash
curl -H "x-user-id: user-1" -H "x-user-role: technician" http://localhost:3000/api/projects
```

## Endpoints
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

## Tests
```bash
npm test
```

Nota: los tests usan la base configurada en `DATABASE_URL`.
