// Vista previa en SVG, a partir de la misma composición que el DXF: lo que se ve es lo que
// se descarga. Un milímetro del dibujo es una unidad del SVG.
//
// Con «guia», las posiciones vacías de cada celda se dibujan pequeñas y claras, como la
// fuente «guía» de la CBE (B 15, apartado 3). Solo en la vista previa; el DXF nunca las lleva.

import { posicionesDeCelda } from '../maquetacion/braille.js';

const MARGEN = 3;
const num = (n) => String(Number(n.toFixed(3)));

const escapar = (texto) =>
  texto.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/**
 * @param {ReturnType<typeof import('../composicion/rotulo.js').componerRotulo>} rotulo
 * @param {{ guia?: boolean, titulo?: string }} [opciones]
 */
export function generarSvg(rotulo, { guia = false, titulo } = {}) {
  const { medidas } = rotulo;
  const ancho = rotulo.ancho + 2 * MARGEN;
  const alto = rotulo.alto + 2 * MARGEN;
  const partes = [];

  if (rotulo.contornosTinta.length) {
    const d = rotulo.contornosTinta
      .map((c) => `M${c.map(([x, y]) => `${num(x)} ${num(y)}`).join('L')}Z`)
      .join('');
    partes.push(`<path d="${d}" class="tinta"/>`);
  }

  if (guia) {
    const radioGuia = medidas.diametro / 6;
    for (const celda of rotulo.celdas) {
      for (const p of posicionesDeCelda(celda, medidas)) {
        if (!p.levantado) {
          partes.push(`<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${num(radioGuia)}" class="guia"/>`);
        }
      }
    }
  }
  for (const p of rotulo.puntos) {
    partes.push(`<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${num(p.radio)}" class="punto"/>`);
  }

  const atributos = titulo ? ' role="img" aria-labelledby="titulo-braille"' : ' aria-hidden="true"';
  const elementoTitulo = titulo ? `<title id="titulo-braille">${escapar(titulo)}</title>` : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${num(-MARGEN)} ${num(-MARGEN)} ${num(ancho)} ${num(alto)}"`,
    ` width="${num(ancho)}mm" height="${num(alto)}mm"${atributos}>`,
    elementoTitulo,
    '<style>.punto{fill:#000}.guia{fill:#bbb}.tinta{fill:#000;fill-rule:evenodd}</style>',
    ...partes,
    '</svg>',
  ].join('');
}
