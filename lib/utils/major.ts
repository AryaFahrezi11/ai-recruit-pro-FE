export function normalizeMajorName(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return 'Teknik Informatika (S1)';
  const cleaned = raw.trim();
  if (!cleaned) return 'Teknik Informatika (S1)';

  let degree = '';

  // 1. Detect Degree Level
  if (/\b(s3|doktor|doctor|phd)\b/i.test(cleaned)) {
    degree = 'S3';
  } else if (/\b(s2|magister|master|m\.t|m\.kom|m\.sc|m\.eng)\b/i.test(cleaned)) {
    degree = 'S2';
  } else if (/\b(s1|sarjana|bachelor|s\.t|s\.kom|s\.si)\b/i.test(cleaned)) {
    degree = 'S1';
  } else if (/\b(d4|d-4|diploma\s*4|diploma\s*iv|sarjana\s*terapan)\b/i.test(cleaned)) {
    degree = 'D4';
  } else if (/\b(d3|d-3|diploma\s*3|diploma\s*iii)\b/i.test(cleaned)) {
    degree = 'D3';
  } else if (/\b(d2|d-2|diploma\s*2|diploma\s*ii)\b/i.test(cleaned)) {
    degree = 'D2';
  } else if (/\b(d1|d-1|diploma\s*1|diploma\s*i)\b/i.test(cleaned)) {
    degree = 'D1';
  }

  // 2. Strip degree keywords, punctuation, and extra whitespace to extract clean field name
  let field = cleaned
    .replace(/\b(s1|s2|s3|d1|d2|d3|d4|d-1|d-2|d-3|d-4|diploma\s*[0-4iv]+|magister\s*of|magister|master\s*of|master|sarjana\s*terapan|sarjana|doktor|doctor|phd|bachelor|m\.t|m\.kom|s\.t|s\.kom|s\.si)\b/gi, '')
    .replace(/[\(\)\[\]\-\–\—\:\,\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. Title Case formatting
  if (field) {
    field = field
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    field = 'Teknik Informatika';
  }

  if (!degree) {
    degree = 'S1';
  }

  return `${field} (${degree})`;
}
