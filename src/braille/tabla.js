// Signografía básica de la Comisión Braille Española.
// Fuente: Documento técnico B 2, versión 4 (mayo de 2025, actualizado el 22 de enero de 2026).
// Las decisiones sobre casos que el documento no resuelve están en docs/decisiones-braille.md.

import { celdasDesdePuntos } from './celda.js';

const tabla = (pares) =>
  new Map(Object.entries(pares).map(([tinta, puntos]) => [tinta, celdasDesdePuntos(puntos)]));

// Apartados 4 y 5.1. à, è, ò, ï y ç son del catalán; se incluyen porque no chocan
// con ningún signo español. ó y é catalanas (246, 123456) no se usan: manda la tabla española.
export const LETRAS = tabla({
  a: '1', b: '12', c: '14', d: '145', e: '15', f: '124', g: '1245', h: '125', i: '24', j: '245',
  k: '13', l: '123', m: '134', n: '1345', o: '135', p: '1234', q: '12345', r: '1235', s: '234',
  t: '2345', u: '136', v: '1236', w: '2456', x: '1346', y: '13456', z: '1356',
  ñ: '12456', á: '12356', é: '2346', í: '34', ó: '346', ú: '23456', ü: '1256',
  à: '12356', è: '2346', ò: '346', ï: '12456', ç: '12346',
});

// Apartado 8.1: las cifras son las diez primeras letras.
export const CIFRAS = tabla({
  1: '1', 2: '12', 3: '14', 4: '145', 5: '15', 6: '124', 7: '1245', 8: '125', 9: '24', 0: '245',
});

// Cifras en posición baja (5.ª serie), para ordinales y denominadores (8.3 y 8.4).
export const CIFRAS_BAJAS = tabla({
  1: '2', 2: '23', 3: '25', 4: '256', 5: '26', 6: '235', 7: '2356', 8: '236', 9: '35', 0: '356',
});

export const PREFIJOS = tabla({
  mayuscula: '46',
  numero: '3456',
  latinaMinuscula: '5',
  caracterEspecial: '6',
  superindice: '16',
});

// Secuencias de más de un carácter en tinta. Se buscan antes que los signos sueltos.
export const SECUENCIAS = tabla({
  '//': '6-26-2',
  '\\\\': '5-35-3',
  '||': '456-123',
});

// Signos de puntuación (6.1), auxiliares (6.2), otros (12), monedas (13) y medidas (14).
// Los que dependen del contexto (apóstrofo, punto medio) se resuelven en el transcriptor.
export const SIGNOS = tabla({
  '.': '3', ',': '2', ';': '23', ':': '25', '…': '3-3-3',
  '¿': '26', '?': '26', '¡': '235', '!': '235',
  '"': '236', '“': '236', '”': '236', '„': '236', '«': '236', '»': '236',
  '‘': '6-236', '‹': '6-236', '›': '6-236',
  '(': '126', ')': '345', '[': '12356', ']': '23456', '{': '5-123', '}': '456-2',
  '<': '5-13', '>': '46-2',
  '-': '36', '‐': '36', '‑': '36', '–': '36', '−': '36', '—': '36-36', '―': '36-36', '‒': '25-25',
  '*': '35', '/': '6-2', '\\': '5-3', '‖': '456-123',
  '+': '235', '±': '235-25-36', '×': '236', '÷': '5-2', '=': '2356',
  '%': '456-356', '‰': '456-356-356',
  '©': '126-46-14-345', '℗': '126-46-1234-345', '®': '126-46-1235-345',
  '™': '126-46-2345-46-134-345', '℠': '126-46-234-46-134-345',
  '&': '6-12346', '@': '5', '§': '346', '¶': '146', '†': '5-1235',
  '€': '456-15', '$': '456-234', '₡': '456-14', '¥': '456-13456', '₿': '456-12',
  '¢': '45-14', '£': '5-2346',
  '°': '356', '′': '1256', '″': '1256-1256',
  'º': '135', 'ª': '1',
  '¹': '16-3456-1', '²': '16-3456-12', '³': '16-3456-14',
  '½': '3456-1-23', '¼': '3456-1-256', '¾': '3456-14-256',
});

// Signos que necesitan «semicajetín libre por la derecha» (apartado 2): si la celda
// siguiente lleva alguno de los puntos 1, 2 o 3, hay que dejar un espacio en medio.
export const LIBRE_POR_LA_DERECHA = new Set(['|']);
SIGNOS.set('|', celdasDesdePuntos('456'));

// Letras con diacríticos ajenos que Unicode no descompone en letra base + marca.
export const BASE_DE_LETRAS_ESPECIALES = new Map([
  ['ø', 'o'], ['ł', 'l'], ['đ', 'd'], ['ħ', 'h'], ['ı', 'i'],
]);
