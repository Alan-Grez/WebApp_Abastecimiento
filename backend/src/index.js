import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateProject } from './validation.js';
import { vehicleSchema } from './schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/vehicles', async (_req, res) => {
  try {
    const vehiclesPath = path.join(DATA_DIR, 'vehicles');
    const files = await fs.readdir(vehiclesPath);
    const payload = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const raw = await fs.readFile(path.join(vehiclesPath, file), 'utf-8');
      payload.push(JSON.parse(raw));
    }
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to load vehicles' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const vehicle = parsed.data;
  try {
    const target = path.join(DATA_DIR, 'vehicles', `${vehicle.id}.json`);
    await fs.writeFile(target, JSON.stringify(vehicle, null, 2));
    res.status(201).json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to save vehicle' });
  }
});

app.post('/api/validate', (req, res) => {
  const { project, vehicle } = req.body;
  const result = validateProject(project, vehicle);
  res.json(result);
});

app.post('/api/plans', async (req, res) => {
  const project = req.body;
  if (!project?.id) return res.status(400).json({ error: 'Project id is required' });
  const target = path.join(DATA_DIR, 'plans', `${project.id}.json`);
  await fs.writeFile(target, JSON.stringify(project, null, 2));
  res.status(201).json(project);
});

app.get('/api/plans/:id', async (req, res) => {
  const id = req.params.id;
  const target = path.join(DATA_DIR, 'plans', `${id}.json`);
  try {
    const raw = await fs.readFile(target, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    res.status(404).json({ error: 'Plan not found' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
