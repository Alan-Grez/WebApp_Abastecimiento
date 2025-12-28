import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string().optional(),
  tankLiters: z.number(),
  pumpCurve: z.array(z.object({
    flowLpm: z.number(),
    pressureBar: z.number()
  })),
  discharges: z.array(z.object({
    name: z.string(),
    diameterMm: z.number(),
    maxFlowLpm: z.number()
  })),
  intakes: z.array(z.object({
    name: z.string(),
    diameterMm: z.number(),
    maxVacuumBar: z.number().optional()
  })).optional(),
  modes: z.array(z.enum(['tank', 'relay', 'booster'])),
  notes: z.string().optional()
});

export const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(['source', 'appliance', 'hose', 'nozzle']),
  label: z.string(),
  position: z.object({ lat: z.number(), lng: z.number() }),
  params: z.object({
    diameter: z.number().optional(),
    flowTargetLpm: z.number().optional(),
    pressure: z.number().optional(),
    lossCoefficient: z.number().optional()
  }),
  ports: z.object({ inputs: z.number(), outputs: z.number() })
});

export const edgeSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  geometry: z.array(z.object({ lat: z.number(), lng: z.number() })),
  lengthMeters: z.number(),
  diameterMm: z.number(),
  targetFlowLpm: z.number()
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  vehicleId: z.string().optional()
});
