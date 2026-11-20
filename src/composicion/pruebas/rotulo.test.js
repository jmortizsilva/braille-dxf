import { test } from 'node:test';
import assert from 'node:assert/strict';
import { componerRotulo } from '../rotulo.js';
import { MEDIDAS_CBE } from '../../maquetacion/medidas.js';

test('«a» es un círculo de 0,75 mm de radio en la capa BRAILLE, arriba a la izquierda', () => {
  const { dibujo, alto } = componerRotulo('a');
  assert.deepEqual(dibujo.entidades, [{ capa: 'BRAILLE', tipo: 'circulo', x: 0.75, y: 5.75, radio: 0.75 }]);
  assert.equal(alto, 6.5);
});

test('un círculo por punto levantado', () => {
  // «Hola»: 46 + 125 + 135 + 123 + 1 = 2 + 3 + 3 + 3 + 1 puntos
  assert.equal(componerRotulo('Hola').dibujo.entidades.length, 12);
});

test('el eje Y del DXF va hacia arriba: la primera línea queda encima', () => {
  const { dibujo } = componerRotulo('a\na');
  const [primera, segunda] = dibujo.entidades;
  assert.ok(primera.y > segunda.y);
  assert.equal(primera.y - segunda.y, 10);
});

test('las capas TINTA y BRAILLE se declaran siempre', () => {
  assert.deepEqual(componerRotulo('a').dibujo.capas.map((c) => c.nombre), ['TINTA', 'BRAILLE']);
});

test('pasa las opciones al transcriptor y avisa de medidas fuera de norma', () => {
  assert.equal(componerRotulo('A', { mayusculas: false }).dibujo.entidades.length, 1);
  assert.equal(componerRotulo('a', { medidas: { ...MEDIDAS_CBE, entreCeldas: 5 } }).avisos.length, 1);
});

// Con tinta
import { readFileSync } from 'node:fs';
import { leerFuente, RUTA_DE_LA_FUENTE } from '../../tinta/fuente.js';

const datos = readFileSync(new URL(`../../../${RUTA_DE_LA_FUENTE}`, import.meta.url));
const fuente = leerFuente(datos.buffer.slice(datos.byteOffset, datos.byteOffset + datos.byteLength));

test('la tinta va arriba y el braille debajo, a la separación pedida', () => {
  const r = componerRotulo('Hola', { fuente, tinta: { alturaMayusculas: 10, separacion: 6 } });
  const yTinta = Math.max(...r.contornosTinta.flat().map(([, y]) => y));
  const yBraille = Math.min(...r.puntos.map((p) => p.y - p.radio));
  assert.ok(Math.abs(yBraille - yTinta - 6) < 1e-9);
});

test('en el DXF, la tinta son polilíneas cerradas en TINTA y el braille círculos en BRAILLE', () => {
  const { dibujo } = componerRotulo('Hola', { fuente });
  const tipos = new Set(dibujo.entidades.map((e) => `${e.capa}:${e.tipo}`));
  assert.deepEqual([...tipos].sort(), ['BRAILLE:circulo', 'TINTA:polilinea']);
  assert.ok(dibujo.entidades.filter((e) => e.tipo === 'polilinea').every((e) => e.cerrada));
});

test('en el DXF, todo queda en coordenadas positivas con el braille abajo', () => {
  const { dibujo, alto } = componerRotulo('Hola', { fuente });
  const ys = dibujo.entidades.flatMap((e) => (e.tipo === 'circulo' ? [e.y - e.radio, e.y + e.radio] : e.vertices.map(([, y]) => y)));
  assert.ok(Math.abs(Math.min(...ys)) < 1e-9);
  assert.ok(Math.abs(Math.max(...ys) - alto) < 1e-9);
  const circulos = dibujo.entidades.filter((e) => e.tipo === 'circulo');
  const tinta = dibujo.entidades.filter((e) => e.tipo === 'polilinea');
  assert.ok(Math.max(...circulos.map((c) => c.y)) < Math.min(...tinta.flatMap((t) => t.vertices.map(([, y]) => y))));
});

test('avisa de los caracteres sin letra en la fuente', () => {
  assert.deepEqual(componerRotulo('a☃', { fuente }).sinLetra, ['☃']);
});

import { comprobarTinta } from '../rotulo.js';

test('comprobar las medidas de la tinta', () => {
  assert.deepEqual(comprobarTinta({ alturaMayusculas: 10, separacion: 0 }), []);
  assert.deepEqual(comprobarTinta({ alturaMayusculas: NaN, separacion: -1 }), [
    'Falta la altura de las mayúsculas, o no es válida.',
    'Falta la separación con el braille, o no es válida.',
  ]);
});

test('con relleno, los círculos lo llevan y el DXF pasa a R2000', () => {
  const sin = componerRotulo('a');
  const con = componerRotulo('a', { rellenoPuntos: true });
  assert.equal(sin.dibujo.formato, 'R12');
  assert.equal(con.dibujo.formato, 'R2000');
  assert.equal(con.dibujo.entidades[0].relleno, true);
  assert.equal(sin.dibujo.entidades[0].relleno, undefined);
});
