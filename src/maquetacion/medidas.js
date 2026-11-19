// Medidas del braille según el Documento técnico B 1 de la CBE, «Parámetros dimensionales
// del braille», versión 2 (febrero de 2024, actualizado el 9 de agosto de 2024).
// Todas en milímetros y de centro a centro de punto, salvo el diámetro.

export const MEDIDAS_CBE = Object.freeze({
  entrePuntos: 2.5, // a y b: entre puntos contiguos de la misma celda
  entreCeldas: 6, // c: entre puntos iguales de celdas contiguas
  entreLineas: 10, // d: entre puntos iguales de líneas contiguas
  diametro: 1.5, // e: diámetro de la base del punto
});

export const anchoDeCelda = (m) => m.entrePuntos + m.diametro;
export const altoDeCelda = (m) => 2 * m.entrePuntos + m.diametro;

const NOMBRES = {
  entrePuntos: 'distancia entre puntos',
  entreCeldas: 'distancia entre celdas',
  entreLineas: 'distancia entre líneas',
  diametro: 'medida del diámetro del punto',
};

const mm = (n) => `${Number(n.toFixed(2)).toString().replace('.', ',')} mm`;

/**
 * Avisos cuando alguna medida se sale de los márgenes que admite el B 1 (apartados 3.3
 * y 3.4). No impiden generar el fichero: el B 1 pide probar con el material, y con
 * tintas en relieve el punto crece al depositarse.
 * @returns {string[]}
 */
export function comprobarMedidas(m) {
  const avisos = [];
  for (const [clave, nombre] of Object.entries(NOMBRES)) {
    const valor = m[clave];
    if (!(Number.isFinite(valor) && valor > 0)) avisos.push(`Falta la ${nombre}, o no es válida.`);
  }
  if (avisos.length) return avisos;

  const alto = altoDeCelda(m);
  const ancho = anchoDeCelda(m);
  if (alto < 6 || alto > 7) {
    avisos.push(`Alto de celda ${mm(alto)}: la CBE admite de 6 a 7 mm.`);
  }
  if (ancho < 4 || ancho > 4.5) {
    avisos.push(`Ancho de celda ${mm(ancho)}: la CBE admite de 4 a 4,5 mm.`);
  }
  if (m.entreCeldas < 6 || m.entreCeldas > 6.5) {
    avisos.push(`Distancia entre celdas ${mm(m.entreCeldas)}: la CBE admite de 6 a 6,5 mm.`);
  }
  if (m.entreLineas < 9.5 || m.entreLineas > 11) {
    avisos.push(`Distancia entre líneas ${mm(m.entreLineas)}: la CBE admite de 9,5 a 11 mm.`);
  }
  if (m.diametro > 1.8) {
    avisos.push(`Diámetro del punto ${mm(m.diametro)}: la CBE no pasa de 1,8 mm.`);
  }
  if (m.diametro >= m.entrePuntos) {
    avisos.push('Los puntos de una celda se tocan: el diámetro tiene que ser menor que la distancia entre puntos.');
  }
  // Con celdas demasiado juntas, «A» se confunde con «m» (B 1, 3.3).
  if (m.entreCeldas - ancho < m.entrePuntos - m.diametro) {
    avisos.push('Las celdas están tan juntas que los puntos de una celda se confunden con los de la siguiente.');
  }
  return avisos;
}
