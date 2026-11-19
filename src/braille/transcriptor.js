// Transcripción de texto en tinta a braille español (CBE, sin contracciones).
//
// El resultado conserva qué celdas corresponden a cada carácter de tinta («segmentos»).
// Así se puede describir carácter a carácter y comprobar la transcripción, y no solo la
// secuencia de puntos. Los prefijos (mayúscula, número, latina minúscula) van dentro del
// segmento del carácter al que afectan.

import {
  LETRAS,
  CIFRAS,
  CIFRAS_BAJAS,
  PREFIJOS,
  SECUENCIAS,
  SIGNOS,
  LIBRE_POR_LA_DERECHA,
  BASE_DE_LETRAS_ESPECIALES,
} from './tabla.js';
import { celdasAUnicode } from './celda.js';

const ESPACIO = 0;
const PUNTOS_IZQUIERDA = 0b000111; // puntos 1, 2 y 3
const PRIMERAS_DIEZ = new Set('abcdefghij');

const esCifra = (c) => c !== undefined && c >= '0' && c <= '9';
// º y ª son letras para Unicode, pero tienen su propio signo en la tabla.
const esLetra = (c) => c !== undefined && c !== 'º' && c !== 'ª' && /^\p{L}$/u.test(c);
const esMayuscula = (c) => c !== c.toLowerCase() && c === c.toUpperCase();
const esEspacio = (c) => /^\s$/u.test(c);

/**
 * @typedef {{ tinta: string, celdas: number[], desconocido?: boolean }} Segmento
 * @typedef {{ segmentos: Segmento[] }} Linea
 * @param {string} texto
 * @param {{ mayusculas?: boolean }} [opciones]
 *   mayusculas: false omite los signos de mayúscula, como recomiendan la CBE para
 *   botoneras de ascensor (B 17, directriz 5) y para envases (B 2, 7.2).
 * @returns {{ lineas: Linea[], desconocidos: string[] }}
 */
export function transcribir(texto, { mayusculas = true } = {}) {
  const desconocidos = new Set();
  const lineas = texto
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((linea) => ({ segmentos: transcribirLinea(linea, desconocidos, mayusculas) }));
  return { lineas, desconocidos: [...desconocidos] };
}

/** Todas las celdas de una línea, en orden. */
export function celdasDeLinea(linea) {
  return linea.segmentos.flatMap((s) => s.celdas);
}

/** Atajo para pruebas y para la vista en línea braille: una línea de texto por línea braille. */
export function transcribirAUnicode(texto, opciones) {
  return transcribir(texto, opciones)
    .lineas.map((l) => celdasAUnicode(celdasDeLinea(l)))
    .join('\n');
}

function transcribirLinea(linea, desconocidos, mayusculas) {
  const c = Array.from(linea);
  const puntosDeSigla = marcarPuntosDeSiglas(c);
  const segmentos = [];
  let modoNumero = false;
  let i = 0;

  const anadir = (tinta, celdas, extra = {}) => segmentos.push({ tinta, celdas, ...extra });

  while (i < c.length) {
    const actual = c[i];
    const anterior = c[i - 1];
    const siguiente = c[i + 1];

    if (esEspacio(actual)) {
      anadir(actual, [ESPACIO]);
      modoNumero = false;
      i++;
      continue;
    }

    if (esCifra(actual)) {
      if (!modoNumero) {
        const ordinal = leerOrdinal(c, i);
        if (ordinal) {
          ordinal.segmentos.forEach((s) => segmentos.push(s));
          i = ordinal.fin;
          continue;
        }
        anadir(actual, [...PREFIJOS.get('numero'), ...CIFRAS.get(actual)]);
        modoNumero = true;
      } else {
        anadir(actual, CIFRAS.get(actual));
      }
      i++;
      continue;
    }

    // Separadores dentro de un número: no cortan el número ni repiten el signo (8.1).
    // El apóstrofo entre cifras es coma decimal, como dice el propio apartado 8.1.
    if (modoNumero && esCifra(siguiente)) {
      const separador = { '.': '.', ',': ',', "'": ',', '’': ',' }[actual];
      if (separador) {
        anadir(actual, SIGNOS.get(separador));
        i++;
        continue;
      }
    }

    if (esLetra(actual)) {
      const celdas = celdasDeLetra(actual);
      if (!celdas) {
        anadir(actual, [], { desconocido: true });
        desconocidos.add(actual);
        modoNumero = false;
        i++;
        continue;
      }
      // Una mayúscula, un signo, también en las siglas: el B 2 (7.1) admite además
      // el doble signo, pero el B 3-1 fija esta forma «con el fin de homologar».
      const prefijo = [];
      if (mayusculas && esMayuscula(actual)) prefijo.push(...PREFIJOS.get('mayuscula'));
      // Tras una cifra, de la «a» a la «j» se leerían como cifras: prefijo de latina
      // minúscula y el número sigue abierto (8.2: «234a5» es #bcd@ae).
      if (modoNumero && !esMayuscula(actual) && PRIMERAS_DIEZ.has(actual)) {
        prefijo.push(...PREFIJOS.get('latinaMinuscula'));
      } else {
        modoNumero = false;
      }
      anadir(actual, [...prefijo, ...celdas]);
      i++;
      continue;
    }

    modoNumero = false;

    if (puntosDeSigla.has(i)) {
      // Las siglas se escriben sin punto abreviativo (B 2, 7.1; B 3-1): «O.N.U.» es {o{n{u.
      i++;
      continue;
    }

    if ((actual === '•' || actual === '▪' || actual === '◦' || actual === '‣') && esInicioDeLinea(c, i)) {
      anadir(actual, SIGNOS.get('‒'));
      i++;
      continue;
    }

    const secuencia = [...SECUENCIAS.keys()].find((s) => c.slice(i, i + s.length).join('') === s);
    if (secuencia) {
      anadir(secuencia, SECUENCIAS.get(secuencia));
      i += Array.from(secuencia).length;
      continue;
    }

    if (actual === "'" || actual === '’') {
      // Entre letras es apóstrofo (punto 3); si no, comilla simple.
      const celdas = esLetra(anterior) && esLetra(siguiente) ? SIGNOS.get('.') : SIGNOS.get('‘');
      anadir(actual, celdas);
      i++;
      continue;
    }

    if (actual === '·') {
      // Entre letras es la ele geminada catalana (punto 5); si no, signo de multiplicar.
      if (esLetra(anterior) && esLetra(siguiente)) anadir(actual, PREFIJOS.get('latinaMinuscula'));
      else anadir(actual, PREFIJOS.get('caracterEspecial'), { libreDerecha: true });
      i++;
      continue;
    }

    const signo = SIGNOS.get(actual);
    if (signo) {
      anadir(actual, signo, LIBRE_POR_LA_DERECHA.has(actual) ? { libreDerecha: true } : {});
    } else {
      anadir(actual, [], { desconocido: true });
      desconocidos.add(actual);
    }
    i++;
  }

  return dejarSemicajetinesLibres(segmentos);
}

/**
 * Posiciones de los puntos que forman parte de una sigla con puntos: dos o más
 * mayúsculas sueltas seguidas cada una de punto y sin espacios («O.N.U.», «S.A.»).
 * «EE. UU.» no entra: son abreviaturas y conservan el punto (B 2, 14.3).
 */
function marcarPuntosDeSiglas(c) {
  const posiciones = new Set();
  const texto = c.join('');
  // Índices por carácter (no por unidad UTF-16) para casar con el array c.
  const indice = [];
  c.forEach((caracter, n) => {
    for (let k = 0; k < caracter.length; k++) indice.push(n);
  });
  for (const m of texto.matchAll(/(?<!\p{L})(?:\p{Lu}\.){2,}/gu)) {
    for (let k = 1; k < m[0].length; k += 2) posiciones.add(indice[m.index + k]);
  }
  return posiciones;
}

function esInicioDeLinea(c, i) {
  return c.slice(0, i).every(esEspacio);
}

function celdasDeLetra(letra) {
  const minuscula = letra.toLowerCase();
  if (LETRAS.has(minuscula)) return LETRAS.get(minuscula);
  // Letra con un diacrítico que no existe en la signografía española: punto 6 delante
  // de la letra base (9.2: «Søren» es {s_oren).
  const base =
    BASE_DE_LETRAS_ESPECIALES.get(minuscula) ?? minuscula.normalize('NFD').replace(/\p{M}/gu, '');
  if (base !== minuscula && LETRAS.has(base) && base.length === 1) {
    return [...PREFIJOS.get('caracterEspecial'), ...LETRAS.get(base)];
  }
  return null;
}

/**
 * Ordinales (8.3): «1.º», «2ª», «1.er», «3er». Las cifras van en posición baja y el punto
 * abreviativo no se escribe.
 */
function leerOrdinal(c, inicio) {
  let fin = inicio;
  while (esCifra(c[fin])) fin++;
  const cifras = c.slice(inicio, fin);
  let marca = fin;
  if (c[marca] === '.') marca++;

  let terminacion = null;
  let finOrdinal = marca;
  if (c[marca] === 'º' || c[marca] === 'ª') {
    terminacion = { celdas: SIGNOS.get(c[marca]) };
    finOrdinal = marca + 1;
  } else if (c[marca] === 'e' && c[marca + 1] === 'r' && !esLetra(c[marca + 2])) {
    terminacion = { celdas: LETRAS.get('r') };
    finOrdinal = marca + 2;
  }
  if (!terminacion) return null;

  const segmentos = cifras.map((cifra, n) => ({
    tinta: cifra,
    celdas: n === 0 ? [...PREFIJOS.get('numero'), ...CIFRAS_BAJAS.get(cifra)] : CIFRAS_BAJAS.get(cifra),
  }));
  segmentos.push({ tinta: c.slice(fin, finOrdinal).join(''), celdas: terminacion.celdas });
  return { segmentos, fin: finOrdinal };
}

function dejarSemicajetinesLibres(segmentos) {
  const resultado = [];
  segmentos.forEach((segmento, n) => {
    const { libreDerecha, ...limpio } = segmento;
    resultado.push(limpio);
    const primeraSiguiente = segmentos[n + 1]?.celdas[0];
    if (libreDerecha && primeraSiguiente !== undefined && primeraSiguiente & PUNTOS_IZQUIERDA) {
      resultado.push({ tinta: '', celdas: [ESPACIO] });
    }
  });
  return resultado;
}
