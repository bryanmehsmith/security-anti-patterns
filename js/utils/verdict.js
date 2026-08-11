export function verdictFor(value, thresholds) {
  return thresholds.find((t) => value < t.max) ?? thresholds[thresholds.length - 1];
}

export function renderVerdict(calloutEl, verdict) {
  calloutEl.className = `callout callout-${verdict.level}`;
  calloutEl.innerHTML = `<span class="callout-label">${verdict.label}</span><span>${verdict.message}</span>`;
}
