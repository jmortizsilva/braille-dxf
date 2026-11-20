// La fuente de la tinta: Atkinson Hyperlegible (SIL Open Font License), del Braille
// Institute, pensada para leerse bien con baja visión. Licencia en fuentes/atkinson-hyperlegible/.

import { parse } from '../../vendor/opentype.js-2.0.0/opentype.min.mjs';

export const RUTA_DE_LA_FUENTE = 'fuentes/atkinson-hyperlegible/AtkinsonHyperlegible-Regular.ttf';

/** @param {ArrayBuffer} datos */
export function leerFuente(datos) {
  return parse(datos);
}
