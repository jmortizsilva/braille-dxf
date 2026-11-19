// Une la transcripción, la maquetación y el dibujo. De momento solo el braille: el texto
// en tinta se añadirá cuando se decida si va como contornos o como entidad de texto.

import { transcribir, celdasDeLinea } from '../braille/transcriptor.js';
import { maquetarBraille } from '../maquetacion/braille.js';
import { MEDIDAS_CBE, comprobarMedidas } from '../maquetacion/medidas.js';

export const CAPA_BRAILLE = { nombre: 'BRAILLE', color: 5 }; // azul
export const CAPA_TINTA = { nombre: 'TINTA', color: 7 }; // blanco o negro según el fondo

/**
 * @param {string} texto
 * @param {{ medidas?: typeof MEDIDAS_CBE, mayusculas?: boolean }} [opciones]
 */
export function componerRotulo(texto, { medidas = MEDIDAS_CBE, mayusculas = true } = {}) {
  const transcripcion = transcribir(texto, { mayusculas });
  const maquetacion = maquetarBraille(transcripcion.lineas.map(celdasDeLinea), medidas);

  // El DXF tiene el eje Y hacia arriba: la esquina inferior izquierda del braille queda en (0, 0).
  const entidades = maquetacion.puntos.map((p) => ({
    capa: CAPA_BRAILLE.nombre,
    tipo: 'circulo',
    x: p.x,
    y: maquetacion.alto - p.y,
    radio: p.radio,
  }));

  return {
    transcripcion,
    maquetacion,
    medidas,
    avisos: comprobarMedidas(medidas),
    dibujo: { capas: [CAPA_TINTA, CAPA_BRAILLE], entidades },
  };
}
