// Une la transcripción, la maquetación y el dibujo: la tinta arriba y el braille debajo,
// cada uno en su capa para poder moverlos por separado en el programa de diseño.

import { transcribir, celdasDeLinea } from '../braille/transcriptor.js';
import { maquetarBraille } from '../maquetacion/braille.js';
import { MEDIDAS_CBE, comprobarMedidas } from '../maquetacion/medidas.js';
import { contornosDeTexto } from '../tinta/contornos.js';

export const CAPA_BRAILLE = { nombre: 'BRAILLE', color: 5 }; // azul
export const CAPA_TINTA = { nombre: 'TINTA', color: 7 }; // blanco o negro según el fondo

export const TINTA_POR_DEFECTO = Object.freeze({
  alturaMayusculas: 10,
  // El B 13 de la CBE pide al menos 6 mm entre el braille y cualquier otro relieve.
  separacion: 6,
});

/** Avisos si las medidas de la tinta no se pueden usar. Vacío si están bien. */
export function comprobarTinta({ alturaMayusculas, separacion }) {
  const avisos = [];
  if (!(Number.isFinite(alturaMayusculas) && alturaMayusculas > 0)) {
    avisos.push('Falta la altura de las mayúsculas, o no es válida.');
  }
  if (!(Number.isFinite(separacion) && separacion >= 0)) {
    avisos.push('Falta la separación con el braille, o no es válida.');
  }
  return avisos;
}

/**
 * Todo en milímetros. Las coordenadas de `puntos`, `celdas` y `contornosTinta` tienen el
 * origen arriba a la izquierda y el eje Y hacia abajo; el dibujo para el DXF lo invierte.
 *
 * @param {string} texto
 * @param {{
 *   medidas?: typeof MEDIDAS_CBE,
 *   mayusculas?: boolean,
 *   fuente?: object,  fuente de opentype.js; sin ella no se genera la tinta
 *   tinta?: typeof TINTA_POR_DEFECTO,
 *   rellenoPuntos?: boolean,  puntos con relleno sólido; obliga a escribir el DXF en R2000
 * }} [opciones]
 */
export function componerRotulo(
  texto,
  {
    medidas = MEDIDAS_CBE,
    mayusculas = true,
    fuente = null,
    tinta = TINTA_POR_DEFECTO,
    rellenoPuntos = false,
  } = {},
) {
  const transcripcion = transcribir(texto, { mayusculas });
  const braille = maquetarBraille(transcripcion.lineas.map(celdasDeLinea), medidas);
  const textoEnTinta = fuente
    ? contornosDeTexto(fuente, texto.replace(/\r\n?/g, '\n').split('\n'), tinta)
    : { contornos: [], ancho: 0, alto: 0, sinLetra: [] };

  const hayTinta = textoEnTinta.contornos.length > 0;
  const hayBraille = braille.puntos.length > 0;
  const desplazamiento = hayTinta && hayBraille ? textoEnTinta.alto + tinta.separacion : hayTinta ? textoEnTinta.alto : 0;

  const puntos = braille.puntos.map((p) => ({ ...p, y: p.y + desplazamiento }));
  const celdas = braille.celdas.map((c) => ({ ...c, y: c.y + desplazamiento }));
  const ancho = Math.max(textoEnTinta.ancho, braille.ancho);
  const alto = hayBraille ? desplazamiento + braille.alto : textoEnTinta.alto;

  // En el DXF el eje Y va hacia arriba: la esquina inferior izquierda queda en (0, 0).
  const entidades = [
    ...textoEnTinta.contornos.map((contorno) => ({
      capa: CAPA_TINTA.nombre,
      tipo: 'polilinea',
      cerrada: true,
      vertices: contorno.map(([x, y]) => [x, alto - y]),
    })),
    ...puntos.map((p) => ({
      capa: CAPA_BRAILLE.nombre,
      tipo: 'circulo',
      x: p.x,
      y: alto - p.y,
      radio: p.radio,
      ...(rellenoPuntos ? { relleno: true } : {}),
    })),
  ];

  return {
    transcripcion,
    medidas,
    avisos: comprobarMedidas(medidas),
    sinLetra: textoEnTinta.sinLetra,
    puntos,
    celdas,
    contornosTinta: textoEnTinta.contornos,
    ancho,
    alto,
    dibujo: { capas: [CAPA_TINTA, CAPA_BRAILLE], entidades, formato: rellenoPuntos ? 'R2000' : 'R12' },
  };
}
