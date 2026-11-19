# Texto a braille en DXF

Escribe un texto y descarga un fichero DXF con su transcripción a braille español, lista
para imprimir en relieve.

- La transcripción sigue los documentos técnicos de la Comisión Braille Española (B 2 y
  B 3-1). Lo que no se puede aplicar de forma automática está en
  [docs/decisiones-braille.md](docs/decisiones-braille.md).
- Las medidas de los puntos y las celdas son las del documento técnico B 1 de la CBE, y se
  pueden cambiar en la página.
- En el DXF, cada punto braille es un círculo en la capa `BRAILLE`, en milímetros. El texto
  en tinta irá en la capa `TINTA`; todavía no está hecho.

Funciona entero en el navegador, sin servidor. Para probarlo en local hay que servir la
carpeta con cualquier servidor estático, por ejemplo `python3 -m http.server`, porque los
módulos de JavaScript no se cargan desde `file://`.

Las pruebas y la comprobación del DXF están en [docs/desarrollo.md](docs/desarrollo.md).
