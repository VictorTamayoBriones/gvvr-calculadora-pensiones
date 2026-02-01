export function addComa(text: string): string {
  if (text == null) return '';
  let s = String(text).trim();
  if (s === '') return s;

  let sign = '';
  if (s.startsWith('-')) {
    sign = '-';
    s = s.slice(1);
  }

  s = s.replace(/,/g, '').replace(/\s+/g, '');
  if (!/[0-9]/.test(s)) return sign + s;

  const parts = s.split('.');
  let intPart = parts[0].replace(/\D/g, '');
  if (intPart === '') intPart = '0';
  const fracPart = parts[1] ? parts[1].replace(/\D/g, '') : '';

  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + formattedInt + (fracPart ? '.' + fracPart : '');
}