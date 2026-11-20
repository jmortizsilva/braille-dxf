// Escritor de DXF, en milímetros y con el eje Y hacia arriba.
//
// Por defecto escribe R12 (AC1009), el formato que acepta casi cualquier programa y que no
// necesita identificadores de objeto ni sección OBJECTS. R12 no admite HATCH (relleno
// sólido): los puntos con relleno se escriben en R2000, en dxf-r2000.js.
// Referencia de códigos de grupo: «DXF Reference» de Autodesk.

import { generarDxfR2000 } from './dxf-r2000.js';
import { num, extension } from './comun.js';

const SALTO = '\r\n';

const NOMBRE_DE_CAPA_VALIDO = /^[A-Z0-9_$-]+$/;

/**
 * @typedef {{ nombre: string, color: number }} Capa  color: índice de color ACI (1 a 255)
 * @typedef {{ capa: string, tipo: 'circulo', x: number, y: number, radio: number, relleno?: boolean }} Circulo
 * @typedef {{ capa: string, tipo: 'polilinea', vertices: [number, number][], cerrada?: boolean }} Polilinea
 * @param {{ capas: Capa[], entidades: (Circulo | Polilinea)[], formato?: 'R12' | 'R2000' }} dibujo
 * @returns {string}
 */
export function generarDxf(dibujo) {
  comprobarDibujo(dibujo);
  if (dibujo.formato === 'R2000') return generarDxfR2000(dibujo);
  if (dibujo.entidades.some((e) => e.relleno)) {
    throw new Error('El relleno de los círculos necesita el formato R2000.');
  }
  return generarDxfR12(dibujo);
}

function comprobarDibujo({ capas, entidades }) {
  for (const capa of capas) {
    if (!NOMBRE_DE_CAPA_VALIDO.test(capa.nombre)) {
      throw new Error(`Nombre de capa no válido para DXF R12: ${capa.nombre}`);
    }
  }
  const nombres = new Set(capas.map((c) => c.nombre));
  for (const e of entidades) {
    if (!nombres.has(e.capa)) throw new Error(`Entidad en una capa que no existe: ${e.capa}`);
  }
}

function generarDxfR12({ capas, entidades }) {
  const g = [];
  const par = (codigo, valor) => g.push(String(codigo), String(valor));
  const { min, max } = extension(entidades);

  par(0, 'SECTION');
  par(2, 'HEADER');
  par(9, '$ACADVER');
  par(1, 'AC1009');
  // $INSUNITS es de R2000, pero varios programas lo leen también en R12 para saber
  // que las unidades son milímetros (4). Los que no lo conocen lo ignoran.
  par(9, '$INSUNITS');
  par(70, 4);
  par(9, '$EXTMIN');
  par(10, num(min[0]));
  par(20, num(min[1]));
  par(30, 0);
  par(9, '$EXTMAX');
  par(10, num(max[0]));
  par(20, num(max[1]));
  par(30, 0);
  par(0, 'ENDSEC');

  par(0, 'SECTION');
  par(2, 'TABLES');
  par(0, 'TABLE');
  par(2, 'LTYPE');
  par(70, 1);
  par(0, 'LTYPE');
  par(2, 'CONTINUOUS');
  par(70, 0);
  par(3, 'Solid line');
  par(72, 65);
  par(73, 0);
  par(40, 0);
  par(0, 'ENDTAB');
  par(0, 'TABLE');
  par(2, 'LAYER');
  par(70, capas.length);
  for (const capa of capas) {
    par(0, 'LAYER');
    par(2, capa.nombre);
    par(70, 0);
    par(62, capa.color);
    par(6, 'CONTINUOUS');
  }
  par(0, 'ENDTAB');
  par(0, 'ENDSEC');

  par(0, 'SECTION');
  par(2, 'ENTITIES');
  for (const e of entidades) {
    if (e.tipo === 'circulo') {
      par(0, 'CIRCLE');
      par(8, e.capa);
      par(10, num(e.x));
      par(20, num(e.y));
      par(30, 0);
      par(40, num(e.radio));
    } else if (e.tipo === 'polilinea') {
      par(0, 'POLYLINE');
      par(8, e.capa);
      par(66, 1);
      par(10, 0);
      par(20, 0);
      par(30, 0);
      par(70, e.cerrada ? 1 : 0);
      for (const [x, y] of e.vertices) {
        par(0, 'VERTEX');
        par(8, e.capa);
        par(10, num(x));
        par(20, num(y));
        par(30, 0);
      }
      par(0, 'SEQEND');
      par(8, e.capa);
    } else {
      throw new Error(`Tipo de entidad desconocido: ${e.tipo}`);
    }
  }
  par(0, 'ENDSEC');
  par(0, 'EOF');

  return g.join(SALTO) + SALTO;
}
