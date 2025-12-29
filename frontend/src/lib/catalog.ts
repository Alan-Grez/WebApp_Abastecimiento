import accesorioIcon from '../icons/accesorio.svg';
import carroIcon from '../icons/carro.svg';
import grifoIcon from '../icons/grifo.svg';
import mangueraIcon from '../icons/manguera.svg';
import piscinaIcon from '../icons/piscina.svg';
import pitonIcon from '../icons/piton.svg';
import { ArmadaNode, NodeType, NodeVariant } from '../types';

export type CatalogGroupId = 'fuentes_de_agua' | 'mangueras' | 'pitones' | 'accesorios';

export interface CatalogItem {
  id: string;
  variant: NodeVariant;
  group: CatalogGroupId;
  label: string;
  icon: string;
  nodeType: NodeType;
  defaults: Pick<ArmadaNode, 'params' | 'ports' | 'stats' | 'connections'> & Partial<ArmadaNode>;
}

const iconsByVariant: Record<NodeVariant, string> = {
  carro: carroIcon,
  grifo: grifoIcon,
  piscina: piscinaIcon,
  manguera: mangueraIcon,
  piton: pitonIcon,
  accesorio: accesorioIcon,
};

export const catalog: CatalogItem[] = [
  {
    id: 'carro',
    variant: 'carro',
    group: 'fuentes_de_agua',
    label: 'Carro bomba',
    icon: carroIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 1500, pressure: 10 },
      ports: { inputs: 0, outputs: 2 },
      stats: { health: 'operational', inletDiameterMm: 125, outletDiameterMm: 65, maxOutputs: 2 },
      connections: { compatibleAccessories: ['accesorio', 'manguera', 'piton'] },
    },
  },
  {
    id: 'carro_rural',
    variant: 'carro',
    group: 'fuentes_de_agua',
    label: 'Carro rural 1000 gpm',
    icon: carroIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 1000, pressure: 8 },
      ports: { inputs: 0, outputs: 2 },
      stats: { health: 'operational', inletDiameterMm: 100, outletDiameterMm: 65, maxOutputs: 2 },
      connections: { compatibleAccessories: ['accesorio', 'manguera', 'piton'] },
    },
  },
  {
    id: 'carro_forestal',
    variant: 'carro',
    group: 'fuentes_de_agua',
    label: 'Carro forestal 750 gpm',
    icon: carroIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 750, pressure: 7 },
      ports: { inputs: 0, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 100, outletDiameterMm: 45, maxOutputs: 1 },
      connections: { compatibleAccessories: ['accesorio', 'manguera', 'piton'] },
    },
  },
  {
    id: 'grifo',
    variant: 'grifo',
    group: 'fuentes_de_agua',
    label: 'Grifo',
    icon: grifoIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 800, pressure: 6 },
      ports: { inputs: 0, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 100, outletDiameterMm: 65, maxOutputs: 1 },
      connections: { compatibleAccessories: ['manguera', 'accesorio'] },
    },
  },
  {
    id: 'grifo_doble',
    variant: 'grifo',
    group: 'fuentes_de_agua',
    label: 'Grifo doble 2x65mm',
    icon: grifoIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 1200, pressure: 8 },
      ports: { inputs: 0, outputs: 2 },
      stats: { health: 'operational', inletDiameterMm: 125, outletDiameterMm: 65, maxOutputs: 2 },
      connections: { compatibleAccessories: ['manguera', 'accesorio'] },
    },
  },
  {
    id: 'piscina',
    variant: 'piscina',
    group: 'fuentes_de_agua',
    label: 'Piscina',
    icon: piscinaIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 600, pressure: 2 },
      ports: { inputs: 0, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 125, outletDiameterMm: 65, maxOutputs: 1 },
      connections: { compatibleAccessories: ['manguera', 'accesorio'] },
    },
  },
  {
    id: 'piscina_portatil',
    variant: 'piscina',
    group: 'fuentes_de_agua',
    label: 'Piscina portátil 5000 L',
    icon: piscinaIcon,
    nodeType: 'source',
    defaults: {
      params: { flowTargetLpm: 400, pressure: 1.5 },
      ports: { inputs: 0, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 100, outletDiameterMm: 65, maxOutputs: 1 },
      connections: { compatibleAccessories: ['manguera', 'accesorio'] },
    },
  },
  {
    id: 'manguera',
    variant: 'manguera',
    group: 'mangueras',
    label: 'Manguera',
    icon: mangueraIcon,
    nodeType: 'hose',
    defaults: {
      params: { diameter: 45, lossCoefficient: 0.6 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 45, outletDiameterMm: 45, lengthMeters: 25 },
      connections: { compatibleAccessories: ['accesorio', 'piton'] },
    },
  },
  {
    id: 'manguera_65',
    variant: 'manguera',
    group: 'mangueras',
    label: 'Manguera 65mm / 20m',
    icon: mangueraIcon,
    nodeType: 'hose',
    defaults: {
      params: { diameter: 65, lossCoefficient: 0.45 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 65, lengthMeters: 20 },
      connections: { compatibleAccessories: ['accesorio', 'piton'] },
    },
  },
  {
    id: 'manguera_38',
    variant: 'manguera',
    group: 'mangueras',
    label: 'Manguera 38mm / 15m',
    icon: mangueraIcon,
    nodeType: 'hose',
    defaults: {
      params: { diameter: 38, lossCoefficient: 0.8 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 38, outletDiameterMm: 38, lengthMeters: 15 },
      connections: { compatibleAccessories: ['accesorio', 'piton'] },
    },
  },
  {
    id: 'piton',
    variant: 'piton',
    group: 'pitones',
    label: 'Pitón / boquilla',
    icon: pitonIcon,
    nodeType: 'nozzle',
    defaults: {
      params: { flowTargetLpm: 500, pressure: 3.5 },
      ports: { inputs: 1, outputs: 0 },
      stats: { health: 'operational', inletDiameterMm: 38, outletDiameterMm: 25, maxOutputs: 0 },
      connections: { compatibleAccessories: ['accesorio'] },
    },
  },
  {
    id: 'piton_neblina',
    variant: 'piton',
    group: 'pitones',
    label: 'Boquilla neblina 45mm',
    icon: pitonIcon,
    nodeType: 'nozzle',
    defaults: {
      params: { flowTargetLpm: 200, pressure: 2.5 },
      ports: { inputs: 1, outputs: 0 },
      stats: { health: 'operational', inletDiameterMm: 45, outletDiameterMm: 22, maxOutputs: 0 },
      connections: { compatibleAccessories: ['accesorio'] },
    },
  },
  {
    id: 'monitor_portatil',
    variant: 'piton',
    group: 'pitones',
    label: 'Monitor portátil 65mm',
    icon: pitonIcon,
    nodeType: 'nozzle',
    defaults: {
      params: { flowTargetLpm: 1200, pressure: 6 },
      ports: { inputs: 1, outputs: 0 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 38, maxOutputs: 0 },
      connections: { compatibleAccessories: ['accesorio'] },
    },
  },
  {
    id: 'accesorio',
    variant: 'accesorio',
    group: 'accesorios',
    label: 'Accesorio',
    icon: accesorioIcon,
    nodeType: 'appliance',
    defaults: {
      params: { lossCoefficient: 0.2 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 65, maxOutputs: 2 },
      connections: { compatibleAccessories: ['manguera', 'piton'] },
    },
  },
  {
    id: 'wye_doble',
    variant: 'accesorio',
    group: 'accesorios',
    label: 'Wye doble 65 a 2x38',
    icon: accesorioIcon,
    nodeType: 'appliance',
    defaults: {
      params: { lossCoefficient: 0.35 },
      ports: { inputs: 1, outputs: 2 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 38, maxOutputs: 2 },
      connections: { compatibleAccessories: ['manguera', 'piton'] },
    },
  },
  {
    id: 'reductor_65_38',
    variant: 'accesorio',
    group: 'accesorios',
    label: 'Reductor 65 a 38mm',
    icon: accesorioIcon,
    nodeType: 'appliance',
    defaults: {
      params: { lossCoefficient: 0.15 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 38, maxOutputs: 1 },
      connections: { compatibleAccessories: ['manguera', 'piton'] },
    },
  },
  {
    id: 'valvula_corte',
    variant: 'accesorio',
    group: 'accesorios',
    label: 'Válvula de corte 65mm',
    icon: accesorioIcon,
    nodeType: 'appliance',
    defaults: {
      params: { lossCoefficient: 0.1 },
      ports: { inputs: 1, outputs: 1 },
      stats: { health: 'operational', inletDiameterMm: 65, outletDiameterMm: 65, maxOutputs: 1 },
      connections: { compatibleAccessories: ['manguera', 'piton'] },
    },
  },
];

export function iconForVariant(variant: NodeVariant) {
  return iconsByVariant[variant];
}

export function catalogGroupedByOrder(order: CatalogGroupId[]) {
  const groups = order.map((groupId) => ({
    id: groupId,
    items: catalog.filter((item) => item.group === groupId),
  }));
  return groups;
}

export function buildNodeFromCatalog(item: CatalogItem, lat: number, lng: number): ArmadaNode {
  return {
    id: `${item.variant}-${Date.now()}`,
    type: item.nodeType,
    variant: item.variant,
    label: item.label,
    position: { lat, lng },
    params: item.defaults.params,
    ports: item.defaults.ports,
    stats: item.defaults.stats,
    connections: item.defaults.connections,
  };
}
