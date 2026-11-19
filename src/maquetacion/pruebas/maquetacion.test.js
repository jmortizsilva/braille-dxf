import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MEDIDAS_CBE, anchoDeCelda, altoDeCelda, comprobarMedidas } from '../medidas.js';
import { maquetarBraille, posicionesDeCelda } from '../braille.js';
import { celdaDesdePuntos } from '../../braille/celda.js';

const cerca = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test('celda de 4 × 6,5 mm con las medidas de la CBE (B 1, 3.1)', () => {
  cerca(anchoDeCelda(MEDIDAS_CBE), 4);
  cerca(altoDeCelda(MEDIDAS_CBE), 6.5);
});

test('diez caracteres ocupan 58 mm (B 17, apartado 4)', () => {
  const lleno = celdaDesdePuntos('123456');
  const { ancho } = maquetarBraille([new Array(10).fill(lleno)], MEDIDAS_CBE);
  cerca(ancho, 58);
});

test('posición de los seis puntos de la primera celda', () => {
  const { puntos } = maquetarBraille([[celdaDesdePuntos('123456')]], MEDIDAS_CBE);
  const centros = Object.fromEntries(puntos.map((p) => [p.punto, [p.x, p.y]]));
  assert.deepEqual(centros, {
    1: [0.75, 0.75], 2: [0.75, 3.25], 3: [0.75, 5.75],
    4: [3.25, 0.75], 5: [3.25, 3.25], 6: [3.25, 5.75],
  });
  assert.ok(puntos.every((p) => p.radio === 0.75));
});

test('la segunda celda va 6 mm a la derecha y la segunda línea 10 mm más abajo', () => {
  const a = celdaDesdePuntos('1');
  const { puntos, alto } = maquetarBraille([[a, a], [a]], MEDIDAS_CBE);
  assert.deepEqual(puntos.map((p) => [p.x, p.y]), [[0.75, 0.75], [6.75, 0.75], [0.75, 10.75]]);
  cerca(alto, 16.5);
});

test('las celdas en blanco del final no cuentan para el ancho', () => {
  const a = celdaDesdePuntos('1');
  cerca(maquetarBraille([[a, 0, 0]], MEDIDAS_CBE).ancho, 4);
  cerca(maquetarBraille([[a, 0, a]], MEDIDAS_CBE).ancho, 16);
});

test('sin puntos, el bloque no ocupa nada', () => {
  assert.deepEqual(maquetarBraille([[0]], MEDIDAS_CBE), { celdas: [], puntos: [], ancho: 0, alto: 0 });
});

test('posiciones de la guía: las seis, marcando las levantadas', () => {
  const { celdas } = maquetarBraille([[celdaDesdePuntos('125')]], MEDIDAS_CBE);
  const pos = posicionesDeCelda(celdas[0], MEDIDAS_CBE);
  assert.deepEqual(pos.filter((p) => p.levantado).map((p) => p.punto), [1, 2, 5]);
  assert.equal(pos.length, 6);
});

test('las medidas de la CBE no dan avisos', () => {
  assert.deepEqual(comprobarMedidas(MEDIDAS_CBE), []);
});

test('avisos fuera de márgenes (B 1, 3.3)', () => {
  assert.deepEqual(comprobarMedidas({ ...MEDIDAS_CBE, entreCeldas: 5.5 }), [
    'Distancia entre celdas 5,5 mm: la CBE admite de 6 a 6,5 mm.',
  ]);
  assert.deepEqual(comprobarMedidas({ ...MEDIDAS_CBE, entreLineas: 12 }), [
    'Distancia entre líneas 12 mm: la CBE admite de 9,5 a 11 mm.',
  ]);
  assert.deepEqual(comprobarMedidas({ ...MEDIDAS_CBE, entrePuntos: 3 }), [
    'Alto de celda 7,5 mm: la CBE admite de 6 a 7 mm.',
  ]);
  assert.ok(comprobarMedidas({ ...MEDIDAS_CBE, diametro: 2.6 }).some((a) => a.startsWith('Los puntos de una celda se tocan')));
  assert.deepEqual(comprobarMedidas({ ...MEDIDAS_CBE, diametro: -1 }), [
    'Falta la medida del diámetro del punto, o no es válida.',
  ]);
});
