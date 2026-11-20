import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contornosDeTexto, aplanar } from '../contornos.js';
import { leerFuente, RUTA_DE_LA_FUENTE } from '../fuente.js';

const datos = readFileSync(new URL(`../../../${RUTA_DE_LA_FUENTE}`, import.meta.url));
const fuente = leerFuente(datos.buffer.slice(datos.byteOffset, datos.byteOffset + datos.byteLength));
const cerca = (a, b, margen = 0.01) => assert.ok(Math.abs(a - b) < margen, `${a} ≠ ${b}`);

test('la «H» mide la altura de mayúsculas pedida', () => {
  cerca(contornosDeTexto(fuente, ['H'], { alturaMayusculas: 10 }).alto, 10);
  cerca(contornosDeTexto(fuente, ['H'], { alturaMayusculas: 15 }).alto, 15);
});

test('lo que ocupa el texto empieza en (0, 0)', () => {
  const { contornos, ancho, alto } = contornosDeTexto(fuente, ['Hola'], { alturaMayusculas: 10 });
  const xs = contornos.flat().map(([x]) => x);
  const ys = contornos.flat().map(([, y]) => y);
  cerca(Math.min(...xs), 0, 1e-9);
  cerca(Math.min(...ys), 0, 1e-9);
  cerca(Math.max(...xs), ancho, 1e-9);
  cerca(Math.max(...ys), alto, 1e-9);
});

test('la «o» tiene dos contornos: el de fuera y el hueco', () => {
  assert.equal(contornosDeTexto(fuente, ['o'], { alturaMayusculas: 10 }).contornos.length, 2);
});

test('cada contorno está cerrado sin repetir el primer punto', () => {
  const { contornos } = contornosDeTexto(fuente, ['Señal'], { alturaMayusculas: 10 });
  for (const c of contornos) {
    assert.ok(c.length >= 3);
    assert.notDeepEqual(c[0], c[c.length - 1]);
  }
});

test('las curvas se aproximan con tramos de un cuarto de milímetro como mucho', () => {
  // Solo las curvas: los tramos que ya son rectos en la letra (orden L) no se parten.
  const tramosDe = (ordenes) => {
    const [c] = aplanar(ordenes);
    return c.slice(1).map((p, i) => Math.hypot(p[0] - c[i][0], p[1] - c[i][1]));
  };
  const cuadratica = tramosDe([{ type: 'M', x: 0, y: 0 }, { type: 'Q', x1: 4, y1: 6, x: 8, y: 0 }, { type: 'Z' }]);
  const cubica = tramosDe([
    { type: 'M', x: 0, y: 0 }, { type: 'C', x1: 0, y1: 5, x2: 8, y2: 5, x: 8, y: 0 }, { type: 'Z' },
  ]);
  for (const largo of [...cuadratica, ...cubica]) assert.ok(largo <= 0.25, `${largo}`);
});

test('dos líneas: la segunda va debajo de la primera', () => {
  const una = contornosDeTexto(fuente, ['H'], { alturaMayusculas: 10 });
  const dos = contornosDeTexto(fuente, ['H', 'H'], { alturaMayusculas: 10 });
  const entreLineas = ((fuente.ascender - fuente.descender) * 10) / fuente.tables.os2.sCapHeight;
  cerca(dos.alto, una.alto + entreLineas);
});

test('lo que no tiene letra en la fuente se avisa y no se dibuja', () => {
  const con = contornosDeTexto(fuente, ['a☃b'], { alturaMayusculas: 10 });
  const sin = contornosDeTexto(fuente, ['a b'], { alturaMayusculas: 10 });
  assert.deepEqual(con.sinLetra, ['☃']);
  assert.equal(con.contornos.length, sin.contornos.length);
});

test('texto vacío o solo espacios: nada', () => {
  assert.deepEqual(contornosDeTexto(fuente, ['  '], { alturaMayusculas: 10 }), { contornos: [], ancho: 0, alto: 0, sinLetra: [] });
});

test('aplanar: rectas tal cual y curva cuadrática en varios tramos', () => {
  const cuadrado = aplanar([
    { type: 'M', x: 0, y: 0 }, { type: 'L', x: 1, y: 0 }, { type: 'L', x: 1, y: 1 },
    { type: 'L', x: 0, y: 1 }, { type: 'L', x: 0, y: 0 }, { type: 'Z' },
  ]);
  assert.deepEqual(cuadrado, [[[0, 0], [1, 0], [1, 1], [0, 1]]]);

  const [curva] = aplanar([
    { type: 'M', x: 0, y: 0 }, { type: 'Q', x1: 5, y1: 10, x: 10, y: 0 }, { type: 'Z' },
  ]);
  assert.ok(curva.length > 20);
  assert.deepEqual(curva.at(-1), [10, 0]);
  cerca(curva[Math.floor(curva.length / 2)][1], 5, 0.5); // el vértice de la parábola
});
