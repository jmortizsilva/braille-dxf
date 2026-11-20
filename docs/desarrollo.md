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

## Plantilla del DXF R2000

Los puntos con relleno obligan a escribir el DXF en R2000, que necesita tablas,
diccionarios e identificadores que R12 no pide. Esa estructura sale de una plantilla
generada con ezdxf, en `src/dxf/plantilla-r2000.js`; no se edita a mano. Si cambian las
capas, se regenera con:

```
/tmp/venv-dxf/bin/python herramientas/crear-plantilla-r2000.py src/dxf/plantilla-r2000.js
```

## Actualizar opentype.js

Se copia `dist/opentype.min.mjs` del paquete de npm a `vendor/opentype.js-<versión>/`, junto
con su licencia, después de comprobar que la suma del paquete coincide con la que publica
npm (`npm view opentype.js@<versión> dist.integrity`).
