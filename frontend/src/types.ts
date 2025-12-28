export type NodeType = 'source' | 'appliance' | 'hose' | 'nozzle';
export type NodeVariant = 'carro' | 'grifo' | 'piscina' | 'manguera' | 'piton' | 'accesorio';

export interface ArmadaNode {
  id: string;
  type: NodeType;
  variant: NodeVariant;
  label: string;
  position: { lat: number; lng: number };
  params: {
    diameter?: number;
    flowTargetLpm?: number;
    pressure?: number;
    lossCoefficient?: number;
  };
  ports: { inputs: number; outputs: number };
  stats?: {
    health: 'operational' | 'damaged';
    inletDiameterMm?: number;
    outletDiameterMm?: number;
    maxOutputs?: number;
    lengthMeters?: number;
  };
  connections?: { compatibleAccessories?: NodeVariant[] };
}

export interface ArmadaEdge {
  id: string;
  from: string;
  to: string;
  geometry: Array<{ lat: number; lng: number }>;
  lengthMeters: number;
  diameterMm: number;
  targetFlowLpm: number;
}

export interface VehicleSpec {
  id: string;
  name: string;
  tankLiters: number;
  pumpCurve: { flowLpm: number; pressureBar: number }[];
  discharges: { name: string; diameterMm: number; maxFlowLpm: number }[];
  intakes?: { name: string; diameterMm: number; maxVacuumBar?: number }[];
  modes: string[];
  notes?: string;
}

export interface ArmadaProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: ArmadaNode[];
  edges: ArmadaEdge[];
  vehicleId?: string;
}

export interface ValidationResult {
  warnings: string[];
  errors: string[];
  pressureAtNozzles: Record<string, number>;
}
