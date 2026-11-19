// Los resultados esperados salen de los ejemplos del Documento técnico B 2 de la CBE
// (versión 4), traducidos de su notación braille a números de puntos. El apartado va en
// el nombre de cada prueba. «0» es una celda en blanco.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transcribir, celdasDeLinea, transcribirAUnicode } from '../transcriptor.js';
import { puntosDeCelda } from '../celda.js';

const aPuntos = (texto) =>
  transcribir(texto)
    .lineas.map((l) => celdasDeLinea(l).map((c) => puntosDeCelda(c).join('') || '0').join('-'))
    .join(' / ');

const casos = [
  // 4. Alfabeto
  ['ñandú', '12456-1-1345-145-23456'],
  ['pingüino', '1234-24-1345-1245-1256-24-1345-135'],
  ['canción', '14-1-1345-14-24-346-1345'],
  ['éxito', '2346-1346-24-2345-135'],
  // 7. Mayúsculas
  ['Toledo.', '46-2345-135-123-15-145-135-3'],
  ['A', '46-1'],
  ['McDonald', '46-134-14-46-145-135-1345-1-123-145'],
  // Siglas: un signo de mayúscula por letra y sin puntos (B 3-1, criterios generales;
  // B 2, 7.1). La abreviatura «EE. UU.» conserva los puntos (B 2, 14.3).
  ['ONCE', '46-135-46-1345-46-14-46-15'],
  ['la ONU', '123-1-0-46-135-46-1345-46-136'],
  ['O.N.U.', '46-135-46-1345-46-136'],
  ['S.A., 2005', '46-234-46-1-2-0-3456-12-245-245-15'],
  ['EE. UU.', '46-15-46-15-3-0-46-136-46-136-3'],
  ['J. García', '46-245-3-0-46-1245-1-1235-14-34-1'],
  ['ALEICan', '46-1-46-123-46-15-46-24-46-14-1-1345'],
  ['Unesco', '46-136-1345-15-234-14-135'],
  // B 3-1, 15.23: viñeta de lista
  ['• pan', '25-25-0-1234-1-1345'],
  // B 3-1: guion entre números repite el signo de número
  ['1710-1750', '3456-1-1245-1-245-36-3456-1-1245-15-245'],
  // 8.1. Números
  ['9', '3456-24'],
  ['315', '3456-14-1-15'],
  ['501.439.678', '3456-15-245-1-3-145-14-24-3-124-1245-125'],
  ['501439678', '3456-15-245-1-145-14-24-124-1245-125'],
  ['73,81', '3456-1245-14-2-125-1'],
  ["73'81", '3456-1245-14-2-125-1'],
  ['18:56', '3456-1-125-25-3456-15-124'],
  ['1:100', '3456-1-25-3456-1-245-245'],
  // Un punto que no va seguido de cifra cierra el número.
  ['Son 3.', '46-234-135-1345-0-3456-14-3'],
  // 8.2. Prefijo de latina minúscula
  ['8b', '3456-125-5-12'],
  ['234ae', '3456-12-14-145-5-1-5-15'],
  ['234a5', '3456-12-14-145-5-1-15'],
  // Una letra que no se confunde con cifra cierra el número.
  ['3x4', '3456-14-1346-3456-145'],
  ['3A', '3456-14-46-1'],
  // 8.3. Ordinales
  ['1.º', '3456-2-135'],
  ['1º', '3456-2-135'],
  ['2.ª', '3456-23-1'],
  ['1.er', '3456-2-1235'],
  ['3er', '3456-25-1235'],
  ['12.º', '3456-2-23-135'],
  // 8.4. Fracciones
  ['½', '3456-1-23'],
  ['¾', '3456-14-256'],
  // 6.1. Puntuación
  ['¿Qué?', '26-46-12345-136-2346-26'],
  ['¡Hola!', '235-46-125-135-123-1-235'],
  ['«sí»', '236-234-34-236'],
  ['“sí”', '236-234-34-236'],
  ['‘sí’', '6-236-234-34-6-236'],
  ['(a)', '126-1-345'],
  ['a; b: c', '1-23-0-12-25-0-14'],
  ['ya…', '13456-1-3-3-3'],
  // 6.2. Signos auxiliares
  ['[a]', '12356-1-23456'],
  ['{a}', '5-123-1-456-2'],
  ['<a>', '5-13-1-46-2'],
  ['—Hola', '36-36-46-125-135-123-1'],
  ['a-b', '1-36-12'],
  ['a*', '1-35'],
  ['a/b', '1-6-2-12'],
  ['a//b', '1-6-26-2-12'],
  ['a\\b', '1-5-3-12'],
  ["d'Artagnan", '145-3-46-1-1235-2345-1-1245-1345-1-1345'],
  // Barra vertical: semicajetín libre por la derecha.
  ['a|b', '1-456-0-12'],
  ['a|e', '1-456-0-15'],
  ['a|ñ', '1-456-0-12456'],
  ['a| b', '1-456-0-12'],
  ['a||b', '1-456-123-12'],
  // 5.1. Catalán
  ['l·l', '123-5-123'],
  ['ça', '12346-1'],
  // 9.2. Carácter especial
  ['Søren', '46-234-6-135-1235-15-1345'],
  ['Dvořák', '46-145-1236-135-6-1235-12356-13'],
  // 12. Otros signos
  ['5 + 3 = 8', '3456-15-0-235-0-3456-14-0-2356-0-3456-125'],
  ['4×100', '3456-145-236-3456-1-245-245'],
  ['50%', '3456-15-245-456-356'],
  ['©', '126-46-14-345'],
  ['®', '126-46-1235-345'],
  ['a&b', '1-6-12346-12'],
  ['cbes@once.es', '14-12-15-234-5-135-1345-14-15-3-15-234'],
  ['n.º', '1345-3-135'],
  ['§12', '346-3456-1-12'],
  ['¶a', '146-1'],
  // 13. Monedas
  ['£10', '5-2346-3456-1-245'],
  ['5$=4,23€', '3456-15-456-234-2356-3456-145-2-12-14-456-15'],
  ['10¢', '3456-1-245-45-14'],
  // 14. Medidas
  ['25 °C', '3456-12-15-0-356-46-14'],
  ['km/h', '13-134-6-2-125'],
  ['cm²', '14-134-16-3456-12'],
];

for (const [tinta, esperado] of casos) {
  test(`«${tinta}»`, () => assert.equal(aPuntos(tinta), esperado));
}

test('cada salto de línea abre una línea braille', () => {
  assert.equal(aPuntos('a\nb'), '1 / 12');
  assert.equal(aPuntos('a\r\nb'), '1 / 12');
  assert.equal(aPuntos('a\n\nb'), '1 /  / 12');
});

test('el espacio cierra el número', () => {
  assert.equal(aPuntos('1 a'), '3456-1-0-1');
});

test('los caracteres sin signo se avisan y no se inventan', () => {
  const { lineas, desconocidos } = transcribir('a☃b☃');
  assert.deepEqual(desconocidos, ['☃']);
  assert.equal(celdasDeLinea(lineas[0]).length, 2);
});

test('cada segmento conserva su carácter de tinta y sus prefijos', () => {
  const { segmentos } = transcribir('Año 3b').lineas[0];
  assert.deepEqual(
    segmentos.map((s) => [s.tinta, s.celdas.map((c) => puntosDeCelda(c).join('')).join('-')]),
    [
      ['A', '46-1'],
      ['ñ', '12456'],
      ['o', '135'],
      [' ', ''],
      ['3', '3456-14'],
      ['b', '5-12'],
    ],
  );
});

test('salida en caracteres braille Unicode', () => {
  assert.equal(transcribirAUnicode('Hola'), '⠨⠓⠕⠇⠁');
  assert.equal(transcribirAUnicode('12'), '⠼⠁⠃');
});

// B 17 (botoneras de ascensor), directriz 5 y apartados 3.3 y 3.4: sin signos de mayúscula.
const sinMayusculas = (texto) =>
  transcribir(texto, { mayusculas: false })
    .lineas.map((l) => celdasDeLinea(l).map((c) => puntosDeCelda(c).join('') || '0').join('-'))
    .join(' / ');

test('sin mayúsculas: PB', () => assert.equal(sinMayusculas('PB'), '1234-12'));
test('sin mayúsculas: S1', () => assert.equal(sinMayusculas('S1'), '234-3456-1'));
test('sin mayúsculas: LL', () => assert.equal(sinMayusculas('LL'), '123-123'));
test('sótano -1', () => assert.equal(aPuntos('-1'), '36-3456-1'));
test('planta 12', () => assert.equal(aPuntos('12'), '3456-1-12'));
test('sin mayúsculas: Abr.', () => assert.equal(sinMayusculas('Abr.'), '1-12-1235-3'));
