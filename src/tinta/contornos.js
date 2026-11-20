// Texto en tinta como contornos vectoriales, en milímetros, con el eje Y hacia abajo y el
// origen en la esquina superior izquierda de lo que ocupa realmente el texto.
//
// Cada contorno es una lista de puntos cerrada (sin repetir el primero al final). Las
// curvas de la letra se convierten en tramos rectos: el DXF R12 no tiene curvas Bézier,
// y las polilíneas de tramos rectos las lee cualquier programa.

// Longitud máxima de cada tramo recto al aproximar una curva.
const TRAMO_MAXIMO = 0.25;

/**
 * @param {import('../../vendor/opentype.js-2.0.0/opentype.min.mjs').Font} fuente
 * @param {string[]} lineas
 * @param {{ alturaMayusculas: number }} opciones  altura de la «H» en milímetros
 * @returns {{ contornos: [number, number][][], ancho: number, alto: number, sinLetra: string[] }}
 */
export function contornosDeTexto(fuente, lineas, { alturaMayusculas }) {
  const alturaDeMayusculaEnUnidades = fuente.tables.os2?.sCapHeight || 0.7 * fuente.unitsPerEm;
  const tamano = (alturaMayusculas * fuente.unitsPerEm) / alturaDeMayusculaEnUnidades;
  const escala = tamano / fuente.unitsPerEm;
  const entreLineas = (fuente.ascender - fuente.descender) * escala;

  const sinLetra = new Set();
  const contornos = [];

  lineas.forEach((linea, n) => {
    // Lo que no tiene letra en la fuente se deja como espacio: si no, la fuente dibuja
    // un rectángulo en su lugar y saldría impreso.
    const texto = Array.from(linea)
      .map((c) => {
        if (/\s/u.test(c) || fuente.charToGlyphIndex(c) !== 0) return c;
        sinLetra.add(c);
        return ' ';
      })
      .join('');
    const lineaBase = fuente.ascender * escala + n * entreLineas;
    const trazado = fuente.getPath(texto, 0, lineaBase, tamano);
    contornos.push(...aplanar(trazado.commands));
  });

  return { ...normalizar(contornos), sinLetra: [...sinLetra] };
}

/** Convierte las órdenes de trazado (M, L, Q, C, Z) en contornos de tramos rectos. */
export function aplanar(ordenes) {
  const contornos = [];
  let actual = null;
  let x = 0;
  let y = 0;

  const cerrar = () => {
    if (actual && actual.length >= 3) {
      const [px, py] = actual[0];
      const [ux, uy] = actual[actual.length - 1];
      if (Math.abs(px - ux) < 1e-9 && Math.abs(py - uy) < 1e-9) actual.pop();
      if (actual.length >= 3) contornos.push(actual);
    }
    actual = null;
  };

  for (const o of ordenes) {
    if (o.type === 'M') {
      cerrar();
      actual = [[o.x, o.y]];
    } else if (o.type === 'L') {
      actual.push([o.x, o.y]);
    } else if (o.type === 'Q') {
      const n = tramos([[x, y], [o.x1, o.y1], [o.x, o.y]]);
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        actual.push([u * u * x + 2 * u * t * o.x1 + t * t * o.x, u * u * y + 2 * u * t * o.y1 + t * t * o.y]);
      }
    } else if (o.type === 'C') {
      const n = tramos([[x, y], [o.x1, o.y1], [o.x2, o.y2], [o.x, o.y]]);
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        actual.push([
          u * u * u * x + 3 * u * u * t * o.x1 + 3 * u * t * t * o.x2 + t * t * t * o.x,
          u * u * u * y + 3 * u * u * t * o.y1 + 3 * u * t * t * o.y2 + t * t * t * o.y,
        ]);
      }
    } else if (o.type === 'Z') {
      cerrar();
      continue;
    }
    if (o.type !== 'Z') {
      x = o.x;
      y = o.y;
    }
  }
  cerrar();
  return contornos;
}

/** Número de tramos para una curva: según la longitud del polígono de control. */
function tramos(control) {
  let longitud = 0;
  for (let i = 1; i < control.length; i++) {
    longitud += Math.hypot(control[i][0] - control[i - 1][0], control[i][1] - control[i - 1][1]);
  }
  return Math.min(64, Math.max(2, Math.ceil(longitud / TRAMO_MAXIMO)));
}

/** Mueve los contornos para que lo que ocupan empiece en (0, 0). */
function normalizar(contornos) {
  if (contornos.length === 0) return { contornos, ancho: 0, alto: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const contorno of contornos) {
    for (const [x, y] of contorno) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return {
    contornos: contornos.map((c) => c.map(([x, y]) => [x - minX, y - minY])),
    ancho: maxX - minX,
    alto: maxY - minY,
  };
}
