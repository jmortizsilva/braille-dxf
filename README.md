# Texto a braille en DXF

Escribe un texto y descarga un fichero DXF con su transcripción a braille español, lista
para imprimir en relieve.

- La transcripción sigue los documentos técnicos de la Comisión Braille Española (B 2 y
  B 3-1). Lo que no se puede aplicar de forma automática está en
  [docs/decisiones-braille.md](docs/decisiones-braille.md).
- Las medidas de los puntos y las celdas son las del documento técnico B 1 de la CBE, y se
  pueden cambiar en la página.
- En el DXF, en milímetros, el texto en tinta va arriba como contornos vectoriales en la
  capa `TINTA`, y el braille debajo, un círculo por punto, en la capa `BRAILLE`.
- Los puntos pueden ir solo con contorno (DXF R12) o con relleno sólido (DXF R2000, porque
  R12 no admite rellenos).

## Lo que viene de fuera

- [opentype.js](https://github.com/opentypejs/opentype.js) 2.0.0, licencia MIT, en
  `vendor/`: lee la fuente para sacar el contorno de las letras.
- [Atkinson Hyperlegible](https://github.com/googlefonts/atkinson-hyperlegible), del
  Braille Institute, licencia SIL Open Font License 1.1, en `fuentes/`.

Funciona entero en el navegador, sin servidor. Para probarlo en local hay que servir la
carpeta con cualquier servidor estático, por ejemplo `python3 -m http.server`, porque los
módulos de JavaScript no se cargan desde `file://`.

Las pruebas y la comprobación del DXF están en [docs/desarrollo.md](docs/desarrollo.md).
