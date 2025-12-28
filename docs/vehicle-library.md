# Biblioteca de vehículos (carros bomba)

- Archivos en `data/vehicles/*.json` siguiendo el esquema descrito en `docs/architecture.md`.
- Los manuales PDF se almacenan en `data/manuals/` solo como referencia (no se parsean en el MVP).
- Flujo propuesto para admins:
  1. Revisar manual y cargar datos en un formulario (futuro frontend) o crear el JSON manualmente.
  2. Validar contra el endpoint `POST /api/vehicles` (usa Zod y guarda el archivo).
  3. Versionar los archivos en git o firmarlos con metadatos `notes` y `manufacturer`.

## Ejemplo mínimo
Consulta `data/vehicles/sample-pumper.json` para una curva simplificada.
