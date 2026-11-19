// Posición de cada punto braille, en milímetros, con el origen en la esquina superior
// izquierda del bloque y el eje Y hacia abajo (como en SVG). El DXF lo invierte al escribir.

import { anchoDeCelda, altoDeCelda } from './medidas.js';

// Columna y fila de cada punto dentro de la celda: 1-2-3 a la izquierda, 4-5-6 a la derecha.
const POSICION_DEL_PUNTO = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
];

/**
 * @param {number[][]} lineas celdas de cada línea (máscaras de 6 bits)
 * @param {typeof import('./medidas.js').MEDIDAS_CBE} medidas
 */
export function maquetarBraille(lineas, medidas) {
  const { entrePuntos, entreCeldas, entreLineas, diametro } = medidas;
  const radio = diametro / 2;
  const celdas = [];
  const puntos = [];
  let maxCeldas = 0;

  lineas.forEach((linea, l) => {
    // Las celdas en blanco del final no ocupan sitio en el rótulo.
    let ultima = linea.length - 1;
    while (ultima >= 0 && linea[ultima] === 0) ultima--;
    maxCeldas = Math.max(maxCeldas, ultima + 1);

    linea.slice(0, ultima + 1).forEach((mascara, k) => {
      const x = k * entreCeldas;
      const y = l * entreLineas;
      celdas.push({ linea: l, columna: k, x, y, mascara });
      POSICION_DEL_PUNTO.forEach(([columna, fila], n) => {
        if (mascara & (1 << n)) {
          puntos.push({
            x: x + radio + columna * entrePuntos,
            y: y + radio + fila * entrePuntos,
            radio,
            punto: n + 1,
            linea: l,
            columna: k,
          });
        }
      });
    });
  });

  const hayAlgo = maxCeldas > 0;
  return {
    celdas,
    puntos,
    ancho: hayAlgo ? (maxCeldas - 1) * entreCeldas + anchoDeCelda(medidas) : 0,
    alto: hayAlgo ? (lineas.length - 1) * entreLineas + altoDeCelda(medidas) : 0,
  };
}

/** Centros de las seis posiciones de una celda, para dibujar la «guía» de la vista previa. */
export function posicionesDeCelda(celda, medidas) {
  const radio = medidas.diametro / 2;
  return POSICION_DEL_PUNTO.map(([columna, fila], n) => ({
    x: celda.x + radio + columna * medidas.entrePuntos,
    y: celda.y + radio + fila * medidas.entrePuntos,
    punto: n + 1,
    levantado: Boolean(celda.mascara & (1 << n)),
  }));
}
