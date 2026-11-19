import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  celdaDesdePuntos,
  celdasDesdePuntos,
  puntosDeCelda,
  celdaAUnicode,
  celdasAUnicode,
} from '../celda.js';

test('los puntos se convierten en máscara y vuelven igual', () => {
  assert.equal(celdaDesdePuntos('1'), 0b000001);
  assert.equal(celdaDesdePuntos('3456'), 0b111100);
  assert.deepEqual(puntosDeCelda(celdaDesdePuntos('125')), [1, 2, 5]);
  assert.deepEqual(puntosDeCelda(0), []);
});

test('el orden de los dígitos no importa', () => {
  assert.equal(celdaDesdePuntos('521'), celdaDesdePuntos('125'));
});

test('rechaza puntos fuera de 1 a 6', () => {
  assert.throws(() => celdaDesdePuntos('7'));
  assert.throws(() => celdaDesdePuntos('0'));
});

test('secuencias con guion', () => {
  assert.deepEqual(celdasDesdePuntos('46-1'), [0b101000, 0b000001]);
});

test('Unicode: h es ⠓ y el signo de número es ⠼', () => {
  assert.equal(celdaAUnicode(celdaDesdePuntos('125')), '⠓');
  assert.equal(celdaAUnicode(celdaDesdePuntos('3456')), '⠼');
  assert.equal(celdasAUnicode(celdasDesdePuntos('125-135-123-1')), '⠓⠕⠇⠁');
});
