from __future__ import annotations

"""Motor de cálculo en Python para modelar la red de abastecimiento.

Cada elemento se modela como una clase con atributos físicos mínimos
(entradas, salidas, diámetros, estado) y utilidades para validar
compatibilidades.
"""

from dataclasses import dataclass, field
from typing import Iterable, List, Optional


@dataclass
class Connector:
  """Describe una entrada o salida física."""

  name: str
  diameter_mm: int
  allowed_variants: List[str] = field(default_factory=list)

  def is_compatible_with(self, other: "Connector") -> bool:
    return self.diameter_mm == other.diameter_mm or not self.allowed_variants or other.name in self.allowed_variants


@dataclass
class Equipment:
  """Base para cualquier elemento de la red."""

  uid: str
  label: str
  variant: str
  health: str = "operational"
  inputs: List[Connector] = field(default_factory=list)
  outputs: List[Connector] = field(default_factory=list)
  length_m: float = 0.0
  flow_lpm: float = 0.0
  pressure_bar: float = 0.0

  def is_operational(self) -> bool:
    return self.health == "operational"

  def connectable_outputs(self, target: "Equipment") -> List[Connector]:
    return [
      out_c
      for out_c in self.outputs
      for in_c in target.inputs
      if out_c.is_compatible_with(in_c)
    ]

  def can_connect(self, target: "Equipment") -> bool:
    return self.is_operational() and target.is_operational() and bool(self.connectable_outputs(target))

  def describe(self) -> str:
    return f"{self.label} ({self.variant}) {self.flow_lpm} LPM @ {self.pressure_bar} bar"


@dataclass
class WaterSource(Equipment):
  """Modela carros, grifos o piscinas."""

  storage_liters: Optional[int] = None
  max_outputs: int = 2

  def available_flow(self) -> float:
    return self.flow_lpm if self.is_operational() else 0.0


@dataclass
class Hose(Equipment):
  loss_coefficient: float = 0.6

  def pressure_drop(self) -> float:
    return (self.length_m / 100.0) * self.loss_coefficient * (self.flow_lpm / 1000.0)


@dataclass
class Nozzle(Equipment):
  required_pressure: float = 3.5

  def has_enough_pressure(self, inlet_pressure: float) -> bool:
    return inlet_pressure >= self.required_pressure


@dataclass
class Accessory(Equipment):
  extra_loss_bar: float = 0.2


def build_catalog() -> Iterable[Equipment]:
  """Ejemplo mínimo de catálogo programable."""

  carro = WaterSource(
    uid="carro-1",
    label="Carro bomba",
    variant="carro",
    flow_lpm=1500,
    pressure_bar=10,
    max_outputs=2,
    outputs=[Connector(name="descarga-65", diameter_mm=65)],
  )

  grifo = WaterSource(
    uid="grifo-1",
    label="Grifo",
    variant="grifo",
    flow_lpm=800,
    pressure_bar=6,
    max_outputs=1,
    outputs=[Connector(name="salida-65", diameter_mm=65)],
  )

  piscina = WaterSource(
    uid="piscina-1",
    label="Piscina",
    variant="piscina",
    flow_lpm=600,
    pressure_bar=2,
    storage_liters=20000,
    outputs=[Connector(name="salida-superficie", diameter_mm=65)],
  )

  manguera = Hose(
    uid="manguera-1",
    label="Manguera 45mm",
    variant="manguera",
    flow_lpm=500,
    pressure_bar=8,
    length_m=25,
    loss_coefficient=0.6,
    inputs=[Connector(name="entrada-45", diameter_mm=45)],
    outputs=[Connector(name="salida-45", diameter_mm=45)],
  )

  piton = Nozzle(
    uid="piton-1",
    label="Pitón 38mm",
    variant="piton",
    flow_lpm=500,
    pressure_bar=3.5,
    required_pressure=3.5,
    inputs=[Connector(name="entrada-38", diameter_mm=38)],
  )

  accesorio = Accessory(
    uid="accesorio-1",
    label="Divisor",
    variant="accesorio",
    flow_lpm=500,
    pressure_bar=3,
    extra_loss_bar=0.2,
    inputs=[Connector(name="entrada-65", diameter_mm=65)],
    outputs=[Connector(name="salida-45", diameter_mm=45)],
  )

  return [carro, grifo, piscina, manguera, piton, accesorio]
