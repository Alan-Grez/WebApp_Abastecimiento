# Motor de cálculo hidráulico (Python)

Clases listas para usar en scripts o notebooks para modelar los elementos de abastecimiento (fuentes de agua, mangueras, pitones y accesorios).

```bash
python - <<'PY'
from python_engine import build_catalog

for item in build_catalog():
    print(item.describe())
PY
```

Cada elemento expone datos de estado (`health`), diámetros de conexión y utilidades de compatibilidad (`can_connect`, `connectable_outputs`) para validar cómo se arma la red.
