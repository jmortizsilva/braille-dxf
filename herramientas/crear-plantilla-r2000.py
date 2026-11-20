"""Genera la plantilla del DXF R2000 (src/dxf/plantilla-r2000.js) con ezdxf.

El formato R2000 exige identificadores, tablas y diccionarios que en R12 no hacen falta.
En vez de escribirlos a mano, se parte de un documento vacío que ezdxf garantiza válido
y se le añaden las capas. La página solo inserta las entidades.

Uso: python crear-plantilla-r2000.py src/dxf/plantilla-r2000.js
"""
import io
import json
import sys

import ezdxf

doc = ezdxf.new("R2000", setup=False, units=4)  # 4: milímetros
doc.layers.add("TINTA", color=7)
doc.layers.add("BRAILLE", color=5)
texto = io.StringIO()
doc.write(texto)
dxf = texto.getvalue().replace("\r\n", "\n")

# Marcas que el escritor de JavaScript sustituye.
inicio = dxf.index("  0\nSECTION\n  2\nENTITIES\n")
fin = dxf.index("  0\nENDSEC\n", inicio) + len("  0\nENDSEC\n")
antes, despues = dxf[:inicio], dxf[fin:]

modelo = doc.block_records.get("*Model_Space").dxf.handle
semilla = doc.header["$HANDSEED"]

with open(sys.argv[1], "w", encoding="utf-8") as salida:
    salida.write("// Generado por herramientas/crear-plantilla-r2000.py con ezdxf ")
    salida.write(ezdxf.__version__ + ". No editar a mano.\n\n")
    salida.write(f"export const DUENO_MODEL_SPACE = {json.dumps(modelo)};\n")
    salida.write(f"export const PRIMER_IDENTIFICADOR = 0x{semilla};\n")
    salida.write(f"export const ANTES_DE_ENTIDADES = {json.dumps(antes, ensure_ascii=False)};\n")
    salida.write(f"export const DESPUES_DE_ENTIDADES = {json.dumps(despues, ensure_ascii=False)};\n")
print("model space:", modelo, "| semilla:", semilla, "| tamaño:", len(dxf))
