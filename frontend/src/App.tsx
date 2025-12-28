import React, { useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MapCanvas } from './components/MapCanvas';
import { ErrorConsole } from './components/ErrorConsole';
import { ArmadaProject, VehicleSpec } from './types';
import { validateProject } from './lib/validation';
import { subscribeToErrors, trackError, TrackedError } from './lib/errorTracking';

const initialProject: ArmadaProject = {
  id: 'demo-1',
  name: 'Armada demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  vehicleId: 'pumper-1500',
  nodes: [
    {
      id: 'source-1',
      type: 'source',
      label: 'Carro bomba',
      position: { lat: -33.4489, lng: -70.6693 },
      params: { flowTargetLpm: 1500, pressure: 10 },
      ports: { inputs: 0, outputs: 2 },
    },
    {
      id: 'nozzle-1',
      type: 'nozzle',
      label: 'Boquilla 38mm',
      position: { lat: -33.4495, lng: -70.6691 },
      params: { flowTargetLpm: 500, pressure: 3.5 },
      ports: { inputs: 1, outputs: 0 },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      from: 'source-1',
      to: 'nozzle-1',
      geometry: [
        { lat: -33.4489, lng: -70.6693 },
        { lat: -33.4495, lng: -70.6691 },
      ],
      lengthMeters: 80,
      diameterMm: 45,
      targetFlowLpm: 500,
    },
  ],
};

const mapCenter: [number, number] = [initialProject.nodes[0].position.lng, initialProject.nodes[0].position.lat];

function latLngToXY(center: [number, number], lat: number, lng: number) {
  const dx = (lng - center[0]) * 100000;
  const dy = (lat - center[1]) * -100000;
  return { x: dx + 400, y: dy + 300 };
}

const palette = [
  { type: 'source', label: 'Fuente (carro)' },
  { type: 'appliance', label: 'Accesorio' },
  { type: 'hose', label: 'Manguera' },
  { type: 'nozzle', label: 'Boquilla' },
];

function App() {
  const [project, setProject] = useState<ArmadaProject>(initialProject);
  const [validation, setValidation] = useState(() => validateProject(initialProject));
  const [vehicles, setVehicles] = useState<VehicleSpec[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSpec | undefined>();
  const [errors, setErrors] = useState<TrackedError[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToErrors(setErrors);
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/api/vehicles')
      .then((r) => r.json())
      .then((data) => {
        setVehicles(data);
        const v = data.find((d: VehicleSpec) => d.id === project.vehicleId) || data[0];
        setSelectedVehicle(v);
      })
      .catch((err) => {
        trackError(err, { action: 'fetch-vehicles' });
        setVehicles([]);
      });
  }, [project.vehicleId]);

  useEffect(() => {
    setValidation(validateProject(project, selectedVehicle));
  }, [project, selectedVehicle]);

  const flowNodes = useMemo(
    () =>
      project.nodes.map((n) => ({
        id: n.id,
        data: { label: n.label },
        position: latLngToXY(mapCenter, n.position.lat, n.position.lng),
        type: 'default',
      })),
    [project.nodes]
  );

  const flowEdges = useMemo(
    () =>
      project.edges.map((e) => ({
        id: e.id,
        source: e.from,
        target: e.to,
        label: `${e.targetFlowLpm} LPM / ${e.diameterMm}mm`,
        animated: true,
      })),
    [project.edges]
  );

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  const addComponent = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type: type as any,
      label: `${type} nuevo`,
      position: { lat: initialProject.nodes[0].position.lat + 0.0003, lng: initialProject.nodes[0].position.lng },
      params: { flowTargetLpm: 400, pressure: 3.5 },
      ports: { inputs: 1, outputs: 1 },
    };
    setProject((prev) => ({ ...prev, nodes: [...prev.nodes, newNode], updatedAt: new Date().toISOString() }));
  };

  const saveProject = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const err = new Error(payload.error || 'No se pudo guardar el proyecto');
        trackError(err, { action: 'save-project', status: response.status, requestId: payload.requestId });
        alert(`Error al guardar: ${err.message}` + (payload.requestId ? ` (ID ${payload.requestId})` : ''));
        return;
      }
      alert('Proyecto guardado en backend (archivo JSON).');
    } catch (error) {
      const tracked = trackError(error, { action: 'save-project' });
      alert(`No se pudo guardar. Revisa la consola de errores (${tracked.id}).`);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Catálogo</h2>
        <div className="palette">
          {palette.map((item) => (
            <button key={item.type} onClick={() => addComponent(item.type)}>
              {item.label}
            </button>
          ))}
        </div>

        <h3>Carro bomba</h3>
        <select
          value={project.vehicleId}
          onChange={(e) => {
            const v = vehicles.find((veh) => veh.id === e.target.value);
            setSelectedVehicle(v);
            setProject((prev) => ({ ...prev, vehicleId: e.target.value }));
          }}
        >
          <option value="">-- selecciona --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {selectedVehicle && (
          <div className="validation-panel">
            <strong>{selectedVehicle.name}</strong>
            <div>Tanque: {selectedVehicle.tankLiters} L</div>
            <div>Modos: {selectedVehicle.modes.join(', ')}</div>
          </div>
        )}

        <div className="validation-panel">
          <h4>Validación</h4>
          {validation.errors.length === 0 && validation.warnings.length === 0 && (
            <div className="validation-ok">Sin observaciones</div>
          )}
          {validation.errors.length > 0 && (
            <ul className="validation-error">
              {validation.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          {validation.warnings.length > 0 && (
            <ul className="validation-warning">
              {validation.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <button onClick={saveProject}>Guardar armada</button>
        </div>
        <ErrorConsole errors={errors} />
      </aside>
      <main className="map-canvas">
        <MapCanvas center={mapCenter} />
        <div className="flow-overlay">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}

export default App;
