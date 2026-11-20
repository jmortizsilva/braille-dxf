// Genera un DXF y un SVG de muestra: node herramientas/generar-muestra.mjs "texto" carpeta
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { componerRotulo } from '../src/composicion/rotulo.js';
import { generarDxf } from '../src/dxf/dxf.js';
import { generarSvg } from '../src/vista/svg.js';

const [texto = 'Planta 2.ª\nSalida de emergencia', carpeta = '.'] = process.argv.slice(2);
const rotulo = componerRotulo(texto); // solo braille: la tinta necesita cargar la fuente
writeFileSync(join(carpeta, 'muestra.dxf'), generarDxf(rotulo.dibujo));
writeFileSync(join(carpeta, 'muestra.svg'), generarSvg(rotulo, { guia: true }));
console.log(`${rotulo.dibujo.entidades.length} entidades, ${rotulo.ancho} × ${rotulo.alto} mm`);
