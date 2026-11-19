import { test } from 'node:test';
import assert from 'node:assert/strict';
import { componerRotulo } from '../rotulo.js';
import { MEDIDAS_CBE } from '../../maquetacion/medidas.js';

test('«a» es un círculo de 0,75 mm de radio en la capa BRAILLE, arriba a la izquierda', () => {
  const { dibujo, maquetacion } = componerRotulo('a');
  assert.deepEqual(dibujo.entidades, [{ capa: 'BRAILLE', tipo: 'circulo', x: 0.75, y: 5.75, radio: 0.75 }]);
  assert.equal(maquetacion.alto, 6.5);
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
