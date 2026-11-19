import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXTOS, describirPuntos, describirTinta, nombreDeFichero } from '../textos.js';
import { transcribir } from '../../braille/transcriptor.js';

const segmentos = (texto) => transcribir(texto).lineas[0].segmentos;

test('puntos de cada celda separados por comas', () => {
  const [h] = segmentos('H');
  assert.equal(describirPuntos(h), '4 6, 1 2 5');
});

test('espacio, separación añadida y caracteres sin signo', () => {
  const [a, espacio] = segmentos('a b');
  assert.equal(describirTinta(a), 'a');
  assert.equal(describirTinta(espacio), 'espacio');
  assert.equal(describirPuntos(espacio), 'en blanco');

  const separacion = segmentos('a|b')[2];
  assert.equal(describirTinta(separacion), 'separación');

  const [desconocido] = segmentos('☃');
  assert.equal(describirPuntos(desconocido), 'sin signo');
});

test('textos de aviso', () => {
  assert.equal(TEXTOS.sinSigno(['☃', '✓']), 'Sin signo braille: ☃, ✓.');
  assert.equal(TEXTOS.linea(2), 'Línea 2');
});

test('nombre del fichero', () => {
  assert.equal(nombreDeFichero('Planta 2.ª'), 'braille-planta-2.dxf');
  assert.equal(nombreDeFichero('¡Salida de emergencia por la escalera norte!'), 'braille-salida-de-emergencia-por-la.dxf');
  assert.equal(nombreDeFichero('☃'), 'braille.dxf');
  assert.equal(nombreDeFichero('Señalización'), 'braille-señalización.dxf');
  assert.equal(nombreDeFichero('Año\nPB'), 'braille-año-pb.dxf');
});
