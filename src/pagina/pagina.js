// Conecta la página con la transcripción, el DXF y la vista previa. Aquí no se decide
// nada: los textos y las descripciones están en textos.js, con sus pruebas.

import { componerRotulo } from '../composicion/rotulo.js';
import { celdasDeLinea } from '../braille/transcriptor.js';
import { celdasAUnicode } from '../braille/celda.js';
import { MEDIDAS_CBE, comprobarMedidas } from '../maquetacion/medidas.js';
import { generarDxf } from '../dxf/dxf.js';
import { generarSvg } from '../vista/svg.js';
import { TEXTOS, describirPuntos, describirTinta, nombreDeFichero } from './textos.js';

const $ = (id) => document.getElementById(id);
const CAMPOS_DE_MEDIDA = Object.keys(MEDIDAS_CBE);
const ESPERA_AL_ESCRIBIR = 250;
const AMPLIACION_DE_LA_VISTA = 3;

let rotuloActual = null;
let avisosActuales = '';

function leerMedidas() {
  return Object.fromEntries(CAMPOS_DE_MEDIDA.map((campo) => [campo, $(campo).valueAsNumber]));
}

function escribirMedidas(medidas) {
  for (const campo of CAMPOS_DE_MEDIDA) $(campo).value = medidas[campo];
}

const sonValidas = (medidas) => Object.values(medidas).every((v) => Number.isFinite(v) && v > 0);

/**
 * La región de avisos solo cambia cuando cambia lo que dice: así el lector no repite
 * los mismos avisos con cada tecla.
 */
function mostrarAvisos(avisos, { repetir = false } = {}) {
  const texto = avisos.join('\n');
  if (texto === avisosActuales && !repetir) return;
  avisosActuales = texto;
  const region = $('avisos');
  region.replaceChildren();
  // Con «repetir», se vacía y se vuelve a llenar en el siguiente ciclo para que el lector
  // anuncie otra vez un aviso que ya estaba escrito.
  const escribir = () => region.replaceChildren(...avisos.map((a) => Object.assign(document.createElement('p'), { textContent: a })));
  if (repetir) setTimeout(escribir, 50);
  else escribir();
}

function tablaDeLinea(linea, numero) {
  const tabla = document.createElement('table');
  tabla.createCaption().textContent = TEXTOS.linea(numero);
  const cabecera = tabla.createTHead().insertRow();
  for (const titulo of ['Tinta', 'Puntos']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = titulo;
    cabecera.append(th);
  }
  const cuerpo = tabla.createTBody();
  for (const segmento of linea.segmentos) {
    const fila = cuerpo.insertRow();
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = describirTinta(segmento);
    fila.append(th);
    fila.insertCell().textContent = describirPuntos(segmento);
  }
  return tabla;
}

function actualizar() {
  const medidas = leerMedidas();
  if (!sonValidas(medidas)) {
    rotuloActual = null;
    $('braille').textContent = '';
    $('caracteres').replaceChildren();
    $('vista').replaceChildren();
    mostrarAvisos(comprobarMedidas(medidas));
    return;
  }

  const rotulo = componerRotulo($('texto').value, { medidas, mayusculas: $('mayusculas').checked });
  rotuloActual = rotulo;
  const { lineas, desconocidos } = rotulo.transcripcion;

  $('braille').textContent = lineas.map((l) => celdasAUnicode(celdasDeLinea(l))).join('\n');
  $('caracteres').replaceChildren(
    ...lineas.filter((l) => l.segmentos.length).map((l, n) => tablaDeLinea(l, n + 1)),
  );
  $('vista').innerHTML = generarSvg(rotulo, { guia: true });
  // A tamaño real se ve demasiado pequeño para revisarlo en pantalla.
  const svg = $('vista').querySelector('svg');
  for (const lado of ['width', 'height']) {
    svg.style[lado] = `${parseFloat(svg.getAttribute(lado)) * AMPLIACION_DE_LA_VISTA}mm`;
  }

  const avisos = [...rotulo.avisos];
  if (desconocidos.length) avisos.push(TEXTOS.sinSigno(desconocidos));
  mostrarAvisos(avisos);
}

function descargar() {
  if (!rotuloActual || rotuloActual.maquetacion.puntos.length === 0) {
    mostrarAvisos([TEXTOS.sinNadaQueDescargar], { repetir: true });
    return;
  }
  const blob = new Blob([generarDxf(rotuloActual.dibujo)], { type: 'application/dxf' });
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreDeFichero($('texto').value);
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
}

/**
 * Copia el braille Unicode tal como se ve, con un salto por línea. Las celdas en blanco
 * son U+2800, no espacios: así se conservan al pegarlo en otro sitio.
 */
async function copiar() {
  const braille = $('braille').textContent;
  let mensaje;
  if (!braille.replace(/[\u2800\n]/g, '')) {
    mensaje = TEXTOS.sinNadaQueCopiar;
  } else {
    try {
      await navigator.clipboard.writeText(braille);
      mensaje = TEXTOS.brailleCopiado;
    } catch {
      // El portapapeles solo funciona en https o en localhost, y el navegador puede negarlo.
      mensaje = TEXTOS.noSePudoCopiar;
    }
  }
  // Se vacía antes de escribir para que el lector lo anuncie aunque se repita el mensaje.
  const estado = $('estado-copia');
  estado.textContent = '';
  setTimeout(() => {
    estado.textContent = mensaje;
  }, 50);
}

let espera;
const actualizarEnUnMomento = () => {
  clearTimeout(espera);
  espera = setTimeout(actualizar, ESPERA_AL_ESCRIBIR);
};

escribirMedidas(MEDIDAS_CBE);
$('formulario').addEventListener('submit', (evento) => evento.preventDefault());
$('formulario').addEventListener('input', actualizarEnUnMomento);
$('mayusculas').addEventListener('change', actualizar);
$('restablecer').addEventListener('click', () => {
  escribirMedidas(MEDIDAS_CBE);
  actualizar();
});
$('descargar').addEventListener('click', descargar);
$('copiar').addEventListener('click', copiar);
actualizar();
