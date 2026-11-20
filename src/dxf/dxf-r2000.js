// Escritor de DXF R2000 (AC1015). Solo se usa cuando los puntos llevan relleno (HATCH),
// que R12 no admite.
//
// La estructura obligatoria de R2000 (tablas, bloques, diccionarios, identificadores)
// sale de una plantilla generada con ezdxf: ver herramientas/crear-plantilla-r2000.py.
// Aquí solo se insertan las entidades, cada una con su identificador, y se actualizan en
// la cabecera el siguiente identificador libre ($HANDSEED) y la extensión del dibujo.

import {
  ANTES_DE_ENTIDADES,
  DESPUES_DE_ENTIDADES,
  DUENO_MODEL_SPACE,
  PRIMER_IDENTIFICADOR,
} from './plantilla-r2000.js';
import { num, extension } from './comun.js';

const SALTO = '\r\n';
const CAPAS_DE_LA_PLANTILLA = new Set(['0', 'TINTA', 'BRAILLE']);

export function generarDxfR2000({ capas, entidades }) {
  for (const capa of capas) {
    if (!CAPAS_DE_LA_PLANTILLA.has(capa.nombre)) {
      throw new Error(`La plantilla R2000 no tiene la capa ${capa.nombre}: hay que regenerarla.`);
    }
  }

  let siguiente = PRIMER_IDENTIFICADOR;
  const nuevoIdentificador = () => (siguiente++).toString(16).toUpperCase();

  const g = [];
  const par = (codigo, valor) => g.push(String(codigo).padStart(3), String(valor));
  const cabeceraDeEntidad = (tipo, capa, subclase) => {
    par(0, tipo);
    par(5, nuevoIdentificador());
    par(330, DUENO_MODEL_SPACE);
    par(100, 'AcDbEntity');
    par(8, capa);
    par(100, subclase);
  };

  par(0, 'SECTION');
  par(2, 'ENTITIES');
  for (const e of entidades) {
    if (e.tipo === 'circulo') {
      cabeceraDeEntidad('CIRCLE', e.capa, 'AcDbCircle');
      par(10, num(e.x));
      par(20, num(e.y));
      par(30, 0);
      par(40, num(e.radio));
      if (e.relleno) rellenoDeCirculo(e, cabeceraDeEntidad, par);
    } else if (e.tipo === 'polilinea') {
      cabeceraDeEntidad('LWPOLYLINE', e.capa, 'AcDbPolyline');
      par(90, e.vertices.length);
      par(70, e.cerrada ? 1 : 0);
      for (const [x, y] of e.vertices) {
        par(10, num(x));
        par(20, num(y));
      }
    } else {
      throw new Error(`Tipo de entidad desconocido: ${e.tipo}`);
    }
  }
  par(0, 'ENDSEC');

  const { min, max } = extension(entidades);
  const cabecera = ANTES_DE_ENTIDADES.replace(/(\$HANDSEED\n {2}5\n)[0-9A-F]+/, `$1${siguiente.toString(16).toUpperCase()}`)
    .replace(/(\$EXTMIN\n 10\n)[^\n]+(\n 20\n)[^\n]+(\n 30\n)[^\n]+/, `$1${num(min[0])}$2${num(min[1])}$30`)
    .replace(/(\$EXTMAX\n 10\n)[^\n]+(\n 20\n)[^\n]+(\n 30\n)[^\n]+/, `$1${num(max[0])}$2${num(max[1])}$30`);

  const texto = cabecera + g.join('\n') + '\n' + DESPUES_DE_ENTIDADES;
  return texto.replace(/\n/g, SALTO);
}

/** Relleno sólido con un contorno de un solo arco de 360°: el mismo círculo. */
function rellenoDeCirculo(c, cabeceraDeEntidad, par) {
  cabeceraDeEntidad('HATCH', c.capa, 'AcDbHatch');
  par(10, 0);
  par(20, 0);
  par(30, 0);
  par(210, 0);
  par(220, 0);
  par(230, 1);
  par(2, 'SOLID');
  par(70, 1); // relleno sólido
  par(71, 0); // no asociativo
  par(91, 1); // un contorno
  par(92, 1); // contorno exterior, hecho de aristas
  par(93, 1); // una arista
  par(72, 2); // arco de circunferencia
  par(10, num(c.x));
  par(20, num(c.y));
  par(40, num(c.radio));
  par(50, 0);
  par(51, 360);
  par(73, 1); // en sentido antihorario
  par(97, 0); // sin objetos de origen
  par(75, 0); // estilo normal
  par(76, 1); // patrón predefinido
  par(98, 0); // sin puntos semilla
}
