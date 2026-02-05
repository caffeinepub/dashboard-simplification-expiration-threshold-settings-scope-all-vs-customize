/**
 * Client-side heuristic rewrite function for bench descriptions
 * Applies deterministic text improvements without external API calls
 */
export function rewriteDescription(text: string): string {
  if (!text || !text.trim()) {
    return text;
  }

  let result = text.trim();

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ');

  // Ensure sentences start with capital letters
  result = result.replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => {
    return prefix + letter.toUpperCase();
  });

  // Add period at end if missing
  if (result.length > 0 && !/[.!?]$/.test(result)) {
    result += '.';
  }

  // Normalize common abbreviations
  const abbreviations: Record<string, string> = {
    'hw': 'HW',
    'sw': 'SW',
    'rf': 'RF',
    'plm': 'PLM',
    'agile': 'AGILE',
    'pcb': 'PCB',
    'cpu': 'CPU',
    'gpu': 'GPU',
    'ram': 'RAM',
    'rom': 'ROM',
    'usb': 'USB',
    'api': 'API',
    'sdk': 'SDK',
  };

  Object.entries(abbreviations).forEach(([lower, upper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    result = result.replace(regex, upper);
  });

  // Remove duplicate spaces after punctuation
  result = result.replace(/([.!?,;:])\s+/g, '$1 ');

  // Ensure space after commas
  result = result.replace(/,([^\s])/g, ', $1');

  return result;
}
