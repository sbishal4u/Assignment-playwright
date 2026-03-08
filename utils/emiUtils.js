export function cleanNumber(text) {
  if (!text) return 0;

  const cleanedText = String(text)
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/%/g, '')
    .replace(/\s+/g, '')
    .trim();

  const number = Number(cleanedText);

  return Number.isNaN(number) ? 0 : number;
}

export function calculateEMI(principal, annualRate, tenureYears) {
  const monthlyRate = annualRate / 12 / 100;
  const months = tenureYears * 12;

  if (!principal || !annualRate || !tenureYears) {
    throw new Error(
      `Invalid EMI inputs -> principal: ${principal}, annualRate: ${annualRate}, tenureYears: ${tenureYears}`
    );
  }

  if (monthlyRate === 0) {
    return Math.round(principal / months);
  }

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return Math.round(emi);
}