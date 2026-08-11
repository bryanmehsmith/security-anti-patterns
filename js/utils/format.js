const SECONDS_PER_YEAR = 31536000;
const AGE_OF_UNIVERSE_YEARS = 13.8e9;

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "effectively never";
  if (seconds < 1) return "under a second";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < SECONDS_PER_YEAR) return `${Math.round(seconds / 86400)} days`;

  const years = seconds / SECONDS_PER_YEAR;
  if (years >= AGE_OF_UNIVERSE_YEARS) {
    return "longer than the age of the universe (13.8 billion years)";
  }
  if (years < 1e3) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1e3)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  return `${Math.round(years / 1e9)} billion years`;
}

export function formatBits(bits) {
  return `${bits.toFixed(1)} bits`;
}

export function formatBigNumber(value) {
  if (value < 1e6) return Math.round(value).toLocaleString();
  return value.toExponential(2);
}
