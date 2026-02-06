/**
 * Parse various "hot" value formats into a number
 * Handles Chinese units: 亿 (100M), 千万 (10M), 万 (10K), kw
 * Ported from frontend geminiService.ts
 */
export function parseScore(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;

  let str = String(val).trim();
  let multiplier = 1;

  // Handle various Chinese units
  if (str.includes('亿')) {
    multiplier = 100000000;
    str = str.replace('亿', '');
  } else if (str.includes('千万')) {
    multiplier = 10000000;
    str = str.replace('千万', '');
  } else if (str.includes('kw')) {
    multiplier = 10000000;
    str = str.replace(/kw/gi, '');
  } else if (str.includes('万') || str.includes('w')) {
    multiplier = 10000;
    str = str.replace(/万|w/gi, '');
  }

  // Remove non-numeric chars except dots (e.g., "523.1" -> 523.1)
  const numericPart = str.replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericPart);

  return isNaN(parsed) ? 0 : Math.floor(parsed * multiplier);
}
