# Desarrollo

## Pruebas

```
npm test
```

Usa el ejecutor de pruebas de Node, sin dependencias. Cada carpeta de `src/` tiene sus
pruebas en `pruebas/`.

## Comprobar que el DXF se abre en un programa real

Las pruebas de Node comprueban la estructura del DXF, pero no que otro programa lo lea.
Para eso se usa [ezdxf](https://ezdxf.readthedocs.io/), en un entorno virtual de Python
fuera del proyecto, para no instalar nada en el sistema:

```
python3 -m venv /tmp/venv-dxf
/tmp/venv-dxf/bin/pip install ezdxf matplotlib
node herramientas/generar-muestra.mjs "Texto de prueba" /tmp
/tmp/venv-dxf/bin/python herramientas/comprobar-dxf.py /tmp/muestra.dxf /tmp/muestra.png
```

Tiene que decir «errores 0». El PNG es el dibujo tal como lo interpreta ezdxf.
