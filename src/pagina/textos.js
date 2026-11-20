// Textos que la página enseña y que el lector de pantalla lee. Son contrato: las pruebas
// de pruebas/textos.test.js fijan cómo se dicen.

import { puntosDeCelda } from '../braille/celda.js';

export const TEXTOS = {
  sinNadaQueDescargar: 'No hay braille que descargar.',
  sinNadaQueCopiar: 'No hay braille que copiar.',
  brailleCopiado: 'Braille copiado.',
  noSePudoCopiar: 'No se ha podido copiar el braille.',
  fuenteNoCargada: 'No se ha podido cargar la fuente: el DXF solo lleva el braille.',
  sinLetra: (caracteres) => `Sin letra en la fuente: ${caracteres.join(', ')}.`,
  sinSigno: (caracteres) => `Sin signo braille: ${caracteres.join(', ')}.`,
  linea: (n) => `Línea ${n}`,
};

/** «4 6, 1 2 5»: los puntos de cada celda, separados por comas. */
export function describirPuntos(segmento) {
  if (segmento.desconocido) return 'sin signo';
  return segmento.celdas
    .map((celda) => puntosDeCelda(celda).join(' ') || 'en blanco')
    .join(', ');
}

/** Lo que va en la columna «Tinta». Los espacios no se ven ni se oyen: se nombran. */
export function describirTinta(segmento) {
  if (segmento.tinta === '') return 'separación';
  if (/^\s+$/u.test(segmento.tinta)) return 'espacio';
  return segmento.tinta;
}

/**
 * «braille-planta-2.dxf»: el principio del texto, sin signos. Las tildes y las eñes se
 * quedan: quitarlas convierte «Año» en otra palabra.
 */
export function nombreDeFichero(texto, { relleno = false } = {}) {
  const palabras = texto
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+|[ºª]/u)
    .filter(Boolean);
  let base = '';
  for (const palabra of palabras) {
    const siguiente = base ? `${base}-${palabra}` : palabra;
    if (Array.from(siguiente).length > 30) break;
    base = siguiente;
  }
  // Con relleno el nombre cambia, para que al bajar las dos versiones no se pisen.
  return `braille${base ? `-${base}` : ''}${relleno ? '-relleno' : ''}.dxf`;
}
