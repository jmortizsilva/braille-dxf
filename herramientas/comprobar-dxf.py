"""Abre un DXF con ezdxf, lo audita y lo dibuja en PNG.

Uso: python comprobar-dxf.py muestra.dxf muestra.png
Necesita ezdxf y matplotlib; ver docs/desarrollo.md.
"""
import sys

import ezdxf
from ezdxf.addons.drawing import matplotlib as dibujo

doc = ezdxf.readfile(sys.argv[1])
auditor = doc.audit()
print("versión", doc.dxfversion, "| errores", len(auditor.errors), "| arreglos", len(auditor.fixes))
for error in auditor.errors:
    print("  error:", error)
msp = doc.modelspace()
print("entidades por capa:", {c.dxf.name: len(msp.query(f'*[layer=="{c.dxf.name}"]')) for c in doc.layers})
print("radios:", {round(c.dxf.radius, 4) for c in msp.query("CIRCLE")})
if len(sys.argv) > 2:
    dibujo.qsave(msp, sys.argv[2], bg="#FFFFFF", fg="#000000", dpi=150)
sys.exit(1 if auditor.errors else 0)
