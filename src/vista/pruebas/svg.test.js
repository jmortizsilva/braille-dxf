import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarSvg } from '../svg.js';
import { componerRotulo } from '../../composicion/rotulo.js';

const contar = (texto, patron) => (texto.match(patron) ?? []).length;

test('un círculo por punto, con las mismas coordenadas que la maquetación', () => {
  const svg = generarSvg(componerRotulo('h'));
  assert.equal(contar(svg, /class="punto"/g), 3);
  assert.match(svg, /<circle cx="0.75" cy="0.75" r="0.75" class="punto"\/>/);
  assert.equal(contar(svg, /class="guia"/g), 0);
});

test('con guía, las posiciones vacías también se dibujan', () => {
  const svg = generarSvg(componerRotulo('h'), { guia: true });
  assert.equal(contar(svg, /class="guia"/g), 3);
});

test('tamaño real en milímetros, con margen', () => {
  const svg = generarSvg(componerRotulo('a'));
  assert.match(svg, /width="10mm" height="12.5mm"/);
});

test('sin título es decorativo; con título se anuncia como imagen y se escapa', () => {
  assert.match(generarSvg(componerRotulo('a')), /aria-hidden="true"/);
  const svg = generarSvg(componerRotulo('a'), { titulo: 'Braille de <a & b>' });
  assert.match(svg, /role="img" aria-labelledby="titulo-braille"/);
  assert.match(svg, /<title id="titulo-braille">Braille de &lt;a &amp; b&gt;<\/title>/);
});
