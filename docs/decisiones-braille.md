# Transcripción braille: fuente y decisiones

## Fuentes

Documentos técnicos de la Comisión Braille Española, en la página «Documentos técnicos
relacionados con el braille» de once.es:

- **B 2: Signografía básica de las lenguas cooficiales españolas**, versión 4 (mayo de 2025,
  actualizado el 22 de enero de 2026). La tabla de signos sale de aquí.
- **B 3-1: Normas para la transcripción y adaptación de textos en sistema braille**,
  versión 3 (septiembre de 2023, actualizado el 22 de enero de 2026). Fija cómo van las
  siglas y las viñetas.
- **B 17: Señalización en braille de botoneras de ascensor**, versión 2 (junio de 2024).
  Recomienda escribir sin signos de mayúscula; de ahí la opción `mayusculas: false`.
- **B 13: Etiquetado en braille de productos de consumo** (octubre de 2024) y **B 1:
  Parámetros dimensionales del braille**, versión 2 (agosto de 2024): afectan a las
  medidas y la colocación, no a la transcripción.

Las pruebas de `src/braille/pruebas/transcriptor.test.js` usan los ejemplos de esos
documentos, con el apartado.

## Siglas

El B 2 (7.1) admite dos formas para las siglas: un signo de mayúscula por letra
(`{o{n{c{e`) o dos signos al principio (`{{once`). El B 3-1 elige la primera «con el fin
de homologar las transcripciones», así que aquí **cada mayúscula lleva su signo**, sea
sigla, palabra con mayúsculas mezcladas («ALEICan») o inicial.

Las siglas se escriben sin puntos: «O.N.U.» → `{o{n{u`. Se reconocen como dos o más
mayúsculas sueltas, cada una seguida de punto, sin espacios. «EE. UU.» no entra: es una
abreviatura y conserva los puntos, como en el ejemplo del B 2 (14.3).

## Por qué no se usa la tabla de liblouis

La tabla `es-g1.ctb` de liblouis es de 2010 y no coincide con la versión vigente de la CBE
en varios signos, por ejemplo:

| Signo | liblouis   | CBE (B 2 v4) |
|-------|------------|--------------|
| ½     | 3456-2-12  | 3456-1-23    |
| ¼     | 3456-2-145 | 3456-1-256   |
| ¾     | 3456-25-145| 3456-14-256  |
| ÷     | 256        | 5-2          |
| <     | 246        | 5-13         |
| >     | 135        | 46-2         |
| ‒     | 36         | 25-25 (raya de enumeración) |
| '     | 3 siempre  | 3 entre letras; 6-236 como comilla simple |

Tampoco aplica el prefijo de latina minúscula (punto 5) tras una cifra, ni los ordinales.

## Reglas de la CBE que dependen del significado

El transcriptor no sabe qué quiere decir el texto, así que estas reglas no se aplican
solas. Quien escribe el texto tiene que escribirlo ya de la forma adecuada.

- **Punto entre cifras**: siempre es separador de millares (punto 3). La CBE pide coma
  decimal (punto 2) también cuando el original usa punto decimal, pero `1.234` y `73.81`
  no se pueden distinguir. Hay que escribir los decimales con coma.
- **Apóstrofo entre cifras**: se toma como coma decimal (8.1: «73’81»). Para minutos y
  segundos de ángulo hay que usar los signos `′` y `″`, no el apóstrofo ni las comillas.
- **Teléfonos**: la CBE los quiere sin espacios, puntos ni guiones; aquí se transcribe lo
  escrito.
- **Mayúsculas como resalte** («estas NORMAS»): la CBE usa el signo de cambio tipográfico
  (35); aquí se trata como sigla (un 46 por letra).
- **Números romanos** («VIII»): el B 2 (8.5) pone un solo signo de mayúscula al principio,
  pero «CD», «MIX» o «CV» no se distinguen de una sigla. Salen como sigla.
- **Barra entre cifras como división** (B 3-1): va con 256; aquí la barra es siempre 6-2,
  porque «1/2/2024» o «volumen 1/2» no son divisiones.
- **Asterisco de «incorrecto o supuesto»** delante de una palabra (B 3-1): va con 256;
  aquí el asterisco es siempre 35, el de llamada a nota.
- **Operaciones** (B 3-1, 15.21.5): los signos van pegados a los números; aquí se respetan
  los espacios que haya en el texto.
- **Palabras catalanas o francesas en texto castellano** (B 3-1, 14.10.1): su «é» pasa a
  123456 y su «ó» a «ö». El transcriptor no sabe en qué idioma está cada palabra y usa
  siempre los signos castellanos.
- **Griego** (B 3-1, 15.19): necesita la tabla del B 12-1; las letras griegas salen como
  caracteres sin signo.
- **Viñetas de segundo nivel** (B 3-1, 15.23: punto 25): no se distinguen niveles; toda
  viñeta a principio de línea es 25-25.
- **Recordatorio de comillas** (356) en citas de varios párrafos: no se usa.
- **Expresiones que empiezan por letra** («b1d4» → `#@ba@dd`): no se detectan.
- **Direcciones de correo con números y URL** (capítulo 15): no se aplica el braille
  computarizado.

## Casos que el documento no resuelve

- **Mayúscula tras cifra** («3A»): se escribe el signo de mayúscula y el número se cierra.
  El signo de mayúscula ya impide leer la letra como cifra.
- **Letra de la k a la z tras cifra** («3x4»): no lleva prefijo, porque no se confunde con
  una cifra, y cierra el número. La cifra siguiente vuelve a llevar signo de número.
- **Catalán**: se aceptan à, è, ò, ï y ç porque no chocan con la tabla española.
- **Letras con diacríticos ajenos** (ø, ř, ì…): punto 6 delante de la letra base (B 2, 9.2).
  Las letras de otros idiomas con signo propio (por ejemplo la «ö» alemana) están en el
  B 3-2, que no se ha consultado; de momento siguen esta regla.
- **Caracteres sin signo**: no se inventan. El transcriptor los devuelve en `desconocidos`
  para avisar.
