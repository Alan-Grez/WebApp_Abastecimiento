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
