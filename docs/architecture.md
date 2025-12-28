# Arquitectura técnica y decisiones

## Proveedor de mapas
Se elige **Mapbox GL JS** por:
- Estilo satelital + calles disponibles de fábrica.
- API moderna WebGL con buen soporte para overlays y capas personalizadas.
- Modelo de precios más predecible y tokens fáciles de rotar en ambientes de práctica.
- Alternativa viable a Google Maps con soporte offline parcial (tiles precargados) en el futuro.

## Librerías clave
- **React + Vite**: desarrollo rápido con HMR.
- **React Flow**: modelar el grafo de armada con nodos y edges conectables.
- **Mapbox GL**: mapa base satelital, controles de zoom/rotación y medición de distancia.
- **Turf.js** (pendiente para futuro): mediciones GIS más precisas y `snap to road`.
- **Express**: API ligera para validación y persistencia sencilla.
- **Zod**: validación de esquemas en backend y frontend.
- **PDF-LIB** (futuro): exportar mapa + checklist a PDF.

## Modelo de datos
### Grafo de armada
```ts
export type NodeType = 'source' | 'appliance' | 'hose' | 'nozzle';
export interface ArmadaNode {
  id: string;
  type: NodeType;
  label: string;
  position: { lat: number; lng: number };
  params: {
    diameter?: number; // mm
    flowTargetLpm?: number;
    pressure?: number; // bar
    lossCoefficient?: number; // accesorio
  };
  ports: { inputs: number; outputs: number };
}

export interface ArmadaEdge {
  id: string;
  from: string; // node id
  to: string;   // node id
  geometry: Array<{ lat: number; lng: number }>;
  lengthMeters: number;
  diameterMm: number;
  targetFlowLpm: number;
}

export interface ArmadaProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  nodes: ArmadaNode[];
  edges: ArmadaEdge[];
  vehicleId?: string; // carro seleccionado como fuente
}
```

### Esquema de carros (JSON/YAML)
```json
{
  "id": "rescue-pumper-1500",
  "name": "Pumper 1500 GPM",
  "tankLiters": 3000,
  "pumpCurve": [
    { "flowLpm": 0, "pressureBar": 10.3 },
    { "flowLpm": 1900, "pressureBar": 8.6 },
    { "flowLpm": 3800, "pressureBar": 6.9 }
  ],
  "discharges": [
    { "name": "LDH 1", "diameterMm": 100, "maxFlowLpm": 4000 },
    { "name": "2.5in 1", "diameterMm": 65, "maxFlowLpm": 1600 }
  ],
  "intakes": [
    { "name": "Hard Suction", "diameterMm": 125, "maxVacuumBar": -0.8 }
  ],
  "modes": ["tank", "relay", "booster"]
}
```

## Lógica de validación (pseudocódigo)
```pseudo
function validateArmada(nodes, edges, vehicle):
  result = { warnings: [], errors: [] }

  # 1) Balance de caudal en nodos
  for node in nodes:
    inflow = sum(edge.targetFlowLpm for edges entering node)
    outflow = sum(edge.targetFlowLpm for edges exiting node)
    if node.type == 'source' and outflow > vehicle.maxTotalFlow():
      errors.add("Fuera de capacidad de la fuente")
    if node.type != 'source' and outflow > inflow:
      errors.add("Sale más agua de la que entra en " + node.label)

  # 2) Pérdidas por tramo
  for edge in edges:
    frictionLoss = (edge.lengthMeters / 100) * k(edge.diameterMm) * edge.targetFlowLpm
    if frictionLoss > thresholdPerEdge:
      warnings.add("Caída alta en tramo " + edge.id)
    accumulate pressure drop along paths toward nozzles

  # 3) Compatibilidad de diámetros
  if edge.diameterMm > upstreamPortDiameter:
    warnings.add("Reducción brusca puede generar pérdida")

  # 4) Presión en boquilla
  for nozzle in nodes of type 'nozzle':
    inletPressure = sourcePressure - totalDrops(path)
    if inletPressure < nozzle.params.pressure:
      errors.add("Presión insuficiente en boquilla " + nozzle.label)

  return result
```

## Persistencia
- MVP: archivos JSON en `data/plans/` (un archivo por proyecto) y carros en `data/vehicles/`.
- Futuro: Postgres con tablas `projects`, `nodes`, `edges`, `vehicles` y auditoría.

## Exportación
- MVP: exportar proyecto como JSON desde el frontend.
- Futuro: render map + lista de materiales a PDF con `pdf-lib` o `react-pdf` y captura de mapa vía Mapbox `getCanvas().toDataURL()`.

## Escalabilidad y siguientes pasos
- **Modelo hidráulico**: agregar k-factors por diámetro basados en manuales, soporte de elevación/altura y curvas de bomba por interpolación.
- **Multi-líneas**: priorización por boquilla, balance automático de caudal y modo `relay` entre carros (fuente -> carro -> boquilla).
- **Snap to road**: usar Mapbox Directions API o OSRM para ajustar mangueras a calles.
- **Roles**: separar instructor/operador, bitácora de cambios y plantillas de armadas.
- **Offline**: cache de tiles y proyectos locales para entrenamientos sin red.
