// Una celda braille se guarda como máscara de 6 bits: el punto n ocupa el bit n-1.
// Es el mismo orden que usa Unicode (U+2800 + máscara), así que la conversión es directa.

const BASE_UNICODE = 0x2800;

/** Convierte "1235" en la máscara de bits. */
export function celdaDesdePuntos(puntos) {
  let mascara = 0;
  for (const digito of String(puntos)) {
    const n = Number(digito);
    if (!Number.isInteger(n) || n < 1 || n > 6) {
      throw new Error(`Punto braille no válido: "${digito}" en "${puntos}"`);
    }
    mascara |= 1 << (n - 1);
  }
  return mascara;
}

/** Convierte "46-1" en una lista de celdas. */
export function celdasDesdePuntos(secuencia) {
  return secuencia.split('-').map(celdaDesdePuntos);
}

/** Lista ordenada de los puntos levantados: 0b10011 → [1, 2, 5]. */
export function puntosDeCelda(celda) {
  const puntos = [];
  for (let n = 1; n <= 6; n++) {
    if (celda & (1 << (n - 1))) puntos.push(n);
  }
  return puntos;
}

export function celdaAUnicode(celda) {
  return String.fromCodePoint(BASE_UNICODE + celda);
}

export function celdasAUnicode(celdas) {
  return celdas.map(celdaAUnicode).join('');
}
