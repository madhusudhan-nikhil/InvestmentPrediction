/**
 * Format a number into Indian Rupee format with commas (e.g. 1500000 -> 15,00,000)
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return Number(val).toLocaleString('en-IN');
}

/**
 * Convert numeric INR value to words / short denomination (e.g., 500000 -> "₹5.00 Lakhs")
 */
export function formatINRDenomination(val) {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Crore`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2)} Lakhs`;
  }
  if (num >= 1000) {
    const th = num / 1000;
    return `₹${th % 1 === 0 ? th.toFixed(0) : th.toFixed(1)}k`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}
