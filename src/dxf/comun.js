// Lo que comparten los escritores R12 y R2000.

/** Número sin notación exponencial y con cuatro decimales como mucho. */
export const num = (n) => {
  if (!Number.isFinite(n)) throw new Error(`Coordenada no válida en el DXF: ${n}`);
  const texto = String(Number(n.toFixed(4)));
  return texto === '-0' ? '0' : texto;
};

export function extension(entidades) {
  const min = [Infinity, Infinity];
  const max = [-Infinity, -Infinity];
  const incluir = (x, y) => {
    min[0] = Math.min(min[0], x);
    min[1] = Math.min(min[1], y);
    max[0] = Math.max(max[0], x);
    max[1] = Math.max(max[1], y);
  };
  for (const e of entidades) {
    if (e.tipo === 'circulo') {
      incluir(e.x - e.radio, e.y - e.radio);
      incluir(e.x + e.radio, e.y + e.radio);
    } else {
      e.vertices.forEach(([x, y]) => incluir(x, y));
    }
  }
  if (min[0] === Infinity) return { min: [0, 0], max: [0, 0] };
  return { min, max };
}
