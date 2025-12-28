import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProject } from './validation.js';
import { vehicleSchema } from './schemas.js';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

const app = express();
app.use(cors());
app.use(express.json());

// Attach a request id to every inbound request to help with log correlation
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  console.info(`[${requestId}] ${req.method} ${req.originalUrl}`);
  next();
});

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

app.get('/', (_req, res) => {
  res.json({
    message: 'API de Abastecimiento operativa',
    endpoints: ['/api/health', '/api/vehicles', '/api/validate', '/api/plans'],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get(
  '/api/vehicles',
  asyncHandler(async (_req, res) => {
    const vehiclesPath = path.join(DATA_DIR, 'vehicles');
    const files = await fs.readdir(vehiclesPath);
    const payload = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(vehiclesPath, file), 'utf-8');
      payload.push(JSON.parse(raw));
    }
    res.json(payload);
  })
);

app.post(
  '/api/vehicles',
  asyncHandler(async (req, res) => {
    const parsed = vehicleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw httpError(400, JSON.stringify(parsed.error.flatten()));
    }
    const vehicle = parsed.data;
    const target = path.join(DATA_DIR, 'vehicles', `${vehicle.id}.json`);
    await fs.writeFile(target, JSON.stringify(vehicle, null, 2));
    res.status(201).json(vehicle);
  })
);

app.post('/api/validate', (req, res) => {
  const { project, vehicle } = req.body;
  const result = validateProject(project, vehicle);
  res.json(result);
});

app.post(
  '/api/plans',
  asyncHandler(async (req, res) => {
    const project = req.body;
    if (!project?.id) throw httpError(400, 'Project id is required');
    const target = path.join(DATA_DIR, 'plans', `${project.id}.json`);
    await fs.writeFile(target, JSON.stringify(project, null, 2));
    res.status(201).json(project);
  })
);

app.get(
  '/api/plans/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const target = path.join(DATA_DIR, 'plans', `${id}.json`);
    try {
      const raw = await fs.readFile(target, 'utf-8');
      res.json(JSON.parse(raw));
    } catch (error) {
      if (error.code === 'ENOENT') throw httpError(404, 'Plan not found');
      throw error;
    }
  })
);

const PORT = process.env.PORT || 4000;

// Central error handler to standardize error responses and logging
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const requestId = req.requestId || 'unknown-request';
  const message = err.message || 'Unexpected error';
  console.error(`[${requestId}]`, err);
  res.status(status).json({ error: message, requestId });
});

app.listen(PORT, () => console.log(`API running on ${PORT}`));
