/**
 * SMART HRM - Payroll Formatters & Indonesian Utilities
 */

export function formatRupiah(value) {
  const num = Number(value) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function formatDateIndo(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function terbilang(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convert(x) {
    if (x < 12) return satuan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh' + (x % 10 !== 0 ? ' ' + satuan[x % 10] : '');
    if (x < 200) return 'Seratus' + (x - 100 !== 0 ? ' ' + convert(x - 100) : '');
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus' + (x % 100 !== 0 ? ' ' + convert(x % 100) : '');
    if (x < 2000) return 'Seribu' + (x - 1000 !== 0 ? ' ' + convert(x - 1000) : '');
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 !== 0 ? ' ' + convert(x % 1000) : '');
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta' + (x % 1000000 !== 0 ? ' ' + convert(x % 1000000) : '');
    if (x < 1000000000000) return convert(Math.floor(x / 1000000000)) + ' Miliar' + (x % 1000000000 !== 0 ? ' ' + convert(x % 1000000000) : '');
    return convert(Math.floor(x / 1000000000000)) + ' Triliun' + (x % 1000000000000 !== 0 ? ' ' + convert(x % 1000000000000) : '');
  }

  return convert(n).trim() + ' Rupiah';
}
