/**
 * Formatea un precio al formato chileno (CLP)
 * Ejemplo: 99990 -> $99.990
 * @param price - Precio numérico
 * @returns String formateado con separador de miles
 */
export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  // Redondear a entero (en Chile no se usan decimales en precios)
  const rounded = Math.round(numericPrice);

  // Formatear con separador de miles (punto)
  const formatted = rounded.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `$${formatted}`;
}
