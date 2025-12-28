import { ArmadaProject, ValidationResult, VehicleSpec } from '../types';

const diameterLossLookup: Record<number, number> = {
  38: 0.9,
  45: 0.6,
  65: 0.3,
  75: 0.25,
  100: 0.12,
};

function interpolatePumpPressure(curve: VehicleSpec['pumpCurve'] | undefined, flow: number) {
  if (!curve?.length) return 0;
  const sorted = [...curve].sort((a, b) => a.flowLpm - b.flowLpm);
  if (flow <= sorted[0].flowLpm) return sorted[0].pressureBar;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (flow >= a.flowLpm && flow <= b.flowLpm) {
      const t = (flow - a.flowLpm) / (b.flowLpm - a.flowLpm);
      return a.pressureBar + t * (b.pressureBar - a.pressureBar);
    }
  }
  return sorted[sorted.length - 1].pressureBar;
}

function hoseLossPer100m(diameterMm: number, flowLpm: number) {
  const factor = diameterLossLookup[diameterMm] ?? 0.5;
  return factor * (flowLpm / 1000);
}

export function validateProject(project: ArmadaProject, vehicle?: VehicleSpec): ValidationResult {
  const validation: ValidationResult = { warnings: [], errors: [], pressureAtNozzles: {} };
  const vehicleMaxFlow = vehicle?.discharges?.reduce((sum, d) => sum + d.maxFlowLpm, 0) || 0;

  const edgesByTarget: Record<string, typeof project.edges> = {};
  const edgesBySource: Record<string, typeof project.edges> = {};
  project.edges.forEach((e) => {
    (edgesByTarget[e.to] = edgesByTarget[e.to] || []).push(e);
    (edgesBySource[e.from] = edgesBySource[e.from] || []).push(e);
  });

  project.nodes.forEach((node) => {
    const inflow = (edgesByTarget[node.id] || []).reduce((sum, e) => sum + e.targetFlowLpm, 0);
    const outflow = (edgesBySource[node.id] || []).reduce((sum, e) => sum + e.targetFlowLpm, 0);
    if (node.type === 'source') {
      if (vehicleMaxFlow && outflow > vehicleMaxFlow) {
        validation.errors.push(`Fuera de capacidad de la fuente (${outflow} LPM > ${vehicleMaxFlow} LPM)`);
      }
    } else if (outflow > inflow) {
      validation.errors.push(`Sale más agua de la que entra en ${node.label}`);
    }
  });

  const pressureAtNode = new Map<string, number>();
  const sourceNode = project.nodes.find((n) => n.type === 'source');
  if (sourceNode) {
    const totalFlow = (edgesBySource[sourceNode.id] || []).reduce((sum, e) => sum + e.targetFlowLpm, 0);
    const sourcePressure = interpolatePumpPressure(vehicle?.pumpCurve, totalFlow) || 8;
    pressureAtNode.set(sourceNode.id, sourcePressure);
  }

  const visited = new Set<string>();
  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const outgoing = edgesBySource[nodeId] || [];
    for (const edge of outgoing) {
      const currentPressure = pressureAtNode.get(nodeId) ?? 0;
      const drop = (edge.lengthMeters / 100) * hoseLossPer100m(edge.diameterMm, edge.targetFlowLpm);
      const targetPressure = Math.max(currentPressure - drop, 0);
      pressureAtNode.set(edge.to, targetPressure);
      dfs(edge.to);
    }
  }
  if (sourceNode) dfs(sourceNode.id);

  project.nodes
    .filter((n) => n.type === 'nozzle')
    .forEach((nozzle) => {
      const pIn = pressureAtNode.get(nozzle.id) ?? 0;
      const required = nozzle.params.pressure ?? 3.5;
      if (pIn < required) {
        validation.errors.push(
          `Presión insuficiente en boquilla ${nozzle.label}: ${pIn.toFixed(1)} bar < ${required} bar`
        );
      }
      validation.pressureAtNozzles[nozzle.id] = pIn;
    });

  project.edges.forEach((edge) => {
    const factor = diameterLossLookup[edge.diameterMm];
    if (!factor) {
      validation.warnings.push(`Diámetro ${edge.diameterMm} mm sin coeficiente calibrado`);
    }
  });

  return validation;
}
