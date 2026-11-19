import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarDxf } from '../dxf.js';

/** Lee un DXF como lista de pares [código, valor]. */
const leerPares = (dxf) => {
  const lineas = dxf.split('\r\n');
  assert.equal(lineas.pop(), '', 'el fichero acaba en salto de línea');
  assert.equal(lineas.length % 2, 0, 'número par de líneas');
  const pares = [];
  for (let i = 0; i < lineas.length; i += 2) pares.push([Number(lineas[i]), lineas[i + 1]]);
  return pares;
};

const capas = [{ nombre: 'BRAILLE', color: 5 }];

test('estructura R12: cabecera, tablas, entidades y fin', () => {
  const pares = leerPares(generarDxf({ capas, entidades: [] }));
  const secciones = pares.filter(([c], i) => c === 2 && pares[i - 1]?.[1] === 'SECTION').map(([, v]) => v);
  assert.deepEqual(secciones, ['HEADER', 'TABLES', 'ENTITIES']);
  assert.deepEqual(pares.at(-1), [0, 'EOF']);
  assert.ok(pares.some(([c, v]) => c === 1 && v === 'AC1009'));
});

test('un círculo con su capa, centro y radio', () => {
  const pares = leerPares(
    generarDxf({ capas, entidades: [{ capa: 'BRAILLE', tipo: 'circulo', x: 0.75, y: 5.75, radio: 0.75 }] }),
  );
  const i = pares.findIndex(([c, v]) => c === 0 && v === 'CIRCLE');
  assert.deepEqual(pares.slice(i, i + 6), [
    [0, 'CIRCLE'], [8, 'BRAILLE'], [10, '0.75'], [20, '5.75'], [30, '0'], [40, '0.75'],
  ]);
});

test('la extensión del dibujo abarca los círculos enteros', () => {
  const pares = leerPares(
    generarDxf({ capas, entidades: [{ capa: 'BRAILLE', tipo: 'circulo', x: 1, y: 1, radio: 0.5 }] }),
  );
  const i = pares.findIndex(([, v]) => v === '$EXTMAX');
  assert.deepEqual(pares.slice(i + 1, i + 3), [[10, '1.5'], [20, '1.5']]);
});

test('polilínea cerrada', () => {
  const dxf = generarDxf({
    capas,
    entidades: [{ capa: 'BRAILLE', tipo: 'polilinea', vertices: [[0, 0], [1, 0], [1, 1]], cerrada: true }],
  });
  const pares = leerPares(dxf);
  assert.equal(pares.filter(([c, v]) => c === 0 && v === 'VERTEX').length, 3);
  assert.ok(pares.some(([c, v]) => c === 0 && v === 'SEQEND'));
});

test('los números no salen en notación exponencial', () => {
  const dxf = generarDxf({
    capas,
    entidades: [{ capa: 'BRAILLE', tipo: 'circulo', x: 1e-9, y: -1e-9, radio: 1 / 3 }],
  });
  assert.doesNotMatch(dxf, /e-/);
  assert.match(dxf, /\r\n10\r\n0\r\n20\r\n0\r\n/);
  assert.match(dxf, /\r\n40\r\n0\.3333\r\n/);
});

test('rechaza capas no declaradas, nombres de capa no válidos y coordenadas no numéricas', () => {
  assert.throws(() => generarDxf({ capas, entidades: [{ capa: 'OTRA', tipo: 'circulo', x: 0, y: 0, radio: 1 }] }));
  assert.throws(() => generarDxf({ capas: [{ nombre: 'con espacio', color: 1 }], entidades: [] }));
  assert.throws(() => generarDxf({ capas, entidades: [{ capa: 'BRAILLE', tipo: 'circulo', x: NaN, y: 0, radio: 1 }] }));
});
