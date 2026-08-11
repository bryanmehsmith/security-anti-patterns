import { CHARSET_SIZES, GUESS_RATES, HARDWARE_TIERS, DICTIONARY_SEARCH_SPACE } from "../data/crackSpeeds.js";
import { formatDuration, formatBigNumber } from "../utils/format.js";
import { verdictFor, renderVerdict } from "../utils/verdict.js";

const VERDICT_THRESHOLDS = [
  { max: 86400, level: "unsafe", label: "Unsafe" },
  { max: 31536000, level: "weak", label: "Weak" },
  { max: Infinity, level: "safe", label: "Safe" },
];

const TIER_ORDER = ["laptop", "gpu", "cluster"];
const TIER_COLOR = {
  laptop: { light: "#2a78d6", dark: "#3987e5" },
  gpu: { light: "#eb6834", dark: "#d95926" },
  cluster: { light: "#1baf7a", dark: "#199e70" },
};
const LENGTHS = Array.from({ length: 21 }, (_, i) => i + 4); // 4..24

function readState(root) {
  const lengthSlider = root.querySelector("#m2-length-slider");
  const charsets = {
    lowercase: root.querySelector("#m2-lowercase").checked,
    uppercase: root.querySelector("#m2-uppercase").checked,
    digits: root.querySelector("#m2-digits").checked,
    symbols: root.querySelector("#m2-symbols").checked,
  };
  return {
    length: Number(lengthSlider.value),
    charsets,
    scheme: root.querySelector("#m2-scheme").value,
    tier: root.querySelector("#m2-hardware").value,
    dictionary: root.querySelector("#m2-dictionary").checked,
  };
}

function charsetSize(charsets) {
  return Object.entries(charsets).reduce((sum, [key, on]) => (on ? sum + CHARSET_SIZES[key] : sum), 0);
}

function crackSecondsFor(length, charsetN, scheme, tier, dictionary) {
  const effectiveSpace = dictionary ? DICTIONARY_SEARCH_SPACE : Math.pow(charsetN, length);
  const guessRate = GUESS_RATES[scheme][tier];
  return effectiveSpace / guessRate / 2;
}

function niceLogTicks(minValue, maxValue) {
  const lo = Math.floor(Math.log10(Math.max(minValue, 1e-3)));
  const hi = Math.ceil(Math.log10(Math.max(maxValue, minValue * 10, 1)));
  const ticks = [];
  for (let exp = lo; exp <= hi; exp++) ticks.push(Math.pow(10, exp));
  return ticks;
}

// The full password-length sweep can span 30+ orders of magnitude (a few
// microseconds to far longer than the universe has existed), so most
// power-of-ten ticks would carry an identical humanized label (e.g. a dozen
// consecutive ticks all reading "longer than the age of the universe"). Only
// show a tick where the label actually changes, then cap the count so the
// axis stays readable even when the underlying range is huge.
function selectDisplayTicks(ticks, maxTicks = 9) {
  const deduped = [];
  let lastLabel = null;
  ticks.forEach((tick) => {
    const label = formatDuration(tick);
    if (label !== lastLabel) {
      deduped.push(tick);
      lastLabel = label;
    }
  });
  if (deduped.length <= maxTicks) return deduped;

  const step = (deduped.length - 1) / (maxTicks - 1);
  const thinned = new Set();
  for (let i = 0; i < maxTicks; i++) thinned.add(deduped[Math.round(i * step)]);
  return [...thinned];
}

function renderChart(container, { charsetN, scheme, dictionary, currentLength, isDark }) {
  const width = 640;
  const height = 300;
  const padding = { top: 16, right: 20, bottom: 34, left: 100 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const series = TIER_ORDER.map((tier) => ({
    tier,
    label: HARDWARE_TIERS[tier].label,
    color: isDark ? TIER_COLOR[tier].dark : TIER_COLOR[tier].light,
    values: LENGTHS.map((length) => crackSecondsFor(length, charsetN, scheme, tier, dictionary)),
  }));

  const allValues = series.flatMap((s) => s.values);
  const ticks = niceLogTicks(Math.min(...allValues), Math.max(...allValues));
  const logMin = Math.log10(ticks[0]);
  const logMax = Math.log10(ticks[ticks.length - 1]);

  const xFor = (length) => padding.left + ((length - LENGTHS[0]) / (LENGTHS[LENGTHS.length - 1] - LENGTHS[0])) * plotWidth;
  const yFor = (seconds) => {
    const clamped = Math.max(seconds, ticks[0]);
    const t = (Math.log10(clamped) - logMin) / (logMax - logMin || 1);
    return padding.top + plotHeight - t * plotHeight;
  };

  const gridlines = selectDisplayTicks(ticks)
    .map((tick) => {
      const y = yFor(tick);
      const label = formatDuration(tick);
      const axisLabel = label.startsWith("longer than") ? "13.8B+ years" : label;
      return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="viz-grid" />
        <text x="${padding.left - 4}" y="${y + 3}" text-anchor="end" class="viz-tick">${axisLabel}</text>`;
    })
    .join("");

  const endLabelYs = series.map((s) => yFor(s.values[s.values.length - 1]));
  const labelsCollide = endLabelYs.some((y, i) => endLabelYs.some((y2, j) => i !== j && Math.abs(y - y2) < 14));

  const paths = series
    .map((s) => {
      const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(LENGTHS[i])},${yFor(v)}`).join(" ");
      const endX = xFor(LENGTHS[LENGTHS.length - 1]);
      const endY = yFor(s.values[s.values.length - 1]);
      const endLabel = labelsCollide
        ? ""
        : `<text x="${endX + 6}" y="${endY + 3}" class="viz-endlabel" style="fill:${s.color}">${s.label.split(" (")[0]}</text>`;
      return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" data-tier="${s.tier}" />${endLabel}`;
    })
    .join("");

  const markerX = xFor(currentLength);
  const markerDots = series
    .map((s) => {
      const idx = currentLength - LENGTHS[0];
      const y = yFor(s.values[idx]);
      return `<circle cx="${markerX}" cy="${y}" r="4" fill="${s.color}" stroke="var(--viz-surface)" stroke-width="2" data-tier="${s.tier}" data-y="${y}" />`;
    })
    .join("");

  const legend = series
    .map((s) => `<span class="viz-legend-item"><span class="viz-legend-swatch" style="background:${s.color}"></span>${s.label}</span>`)
    .join("");

  const tableRows = LENGTHS.map((length, i) => {
    const cells = series.map((s) => `<td>${formatDuration(s.values[i])}</td>`).join("");
    return `<tr><th scope="row">${length}</th>${cells}</tr>`;
  }).join("");

  container.innerHTML = `
    <div class="viz-root">
      <div class="viz-legend">${legend}</div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Estimated crack time by password length, one line per attacker hardware tier">
        ${gridlines}
        <line x1="${markerX}" y1="${padding.top}" x2="${markerX}" y2="${padding.top + plotHeight}" class="viz-crosshair" />
        ${paths}
        ${markerDots}
        <text x="${markerX}" y="${height - 4}" text-anchor="middle" class="viz-tick viz-tick-strong">length ${currentLength}</text>
      </svg>
      <details class="viz-table-toggle">
        <summary>View as table</summary>
        <div class="viz-table-wrap">
          <table>
            <caption>Estimated average crack time by password length and attacker hardware</caption>
            <thead><tr><th scope="col">Length</th>${series.map((s) => `<th scope="col">${s.label}</th>`).join("")}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </details>
    </div>`;
}

function ensureChartStyles() {
  if (document.getElementById("m2-chart-styles")) return;
  const style = document.createElement("style");
  style.id = "m2-chart-styles";
  style.textContent = `
    .viz-root { --viz-surface: var(--card-background); color-scheme: light dark; }
    .viz-legend { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 8px; font-size: 0.82rem; color: var(--muted-text); }
    .viz-legend-item { display: inline-flex; align-items: center; gap: 6px; }
    .viz-legend-swatch { width: 14px; height: 2px; border-radius: 1px; display: inline-block; }
    .viz-grid { stroke: var(--border-color); stroke-width: 1; }
    .viz-crosshair { stroke: var(--muted-text); stroke-width: 1; stroke-dasharray: 0; opacity: 0.5; }
    .viz-tick { font-size: 10px; fill: var(--muted-text); font-family: inherit; }
    .viz-tick-strong { font-size: 11px; font-weight: 700; fill: var(--accent-color); }
    .viz-endlabel { font-size: 11px; font-weight: 600; font-family: inherit; }
    .viz-table-toggle { margin-top: 10px; font-size: 0.82rem; }
    .viz-table-toggle summary { cursor: pointer; color: var(--link-color); font-weight: 600; }
    .viz-table-wrap { overflow-x: auto; margin-top: 8px; }
    .viz-table-wrap table { border-collapse: collapse; width: 100%; font-size: 0.82rem; }
    .viz-table-wrap th, .viz-table-wrap td { border: 1px solid var(--border-color); padding: 5px 8px; text-align: left; }
  `;
  document.head.appendChild(style);
}

export function init(root) {
  ensureChartStyles();

  const lengthSlider = root.querySelector("#m2-length-slider");
  const lengthOutput = root.querySelector("#m2-length-output");
  const entropyEl = root.querySelector("#m2-entropy");
  const searchspaceEl = root.querySelector("#m2-searchspace");
  const cracktimeEl = root.querySelector("#m2-cracktime");
  const verdictEl = root.querySelector("#m2-verdict");
  const chartEl = root.querySelector("#m2-chart");

  const inputs = [
    lengthSlider,
    "#m2-lowercase", "#m2-uppercase", "#m2-digits", "#m2-symbols",
    "#m2-scheme", "#m2-hardware", "#m2-dictionary",
  ].map((el) => (typeof el === "string" ? root.querySelector(el) : el));

  const checkboxIds = ["#m2-lowercase", "#m2-uppercase", "#m2-digits", "#m2-symbols"];

  function enforceAtLeastOneCharset(changedEl) {
    const boxes = checkboxIds.map((id) => root.querySelector(id));
    const checkedCount = boxes.filter((b) => b.checked).length;
    if (checkedCount === 0 && changedEl) {
      changedEl.checked = true;
    }
  }

  function render() {
    const state = readState(root);
    const N = charsetSize(state.charsets);
    const bits = state.length * Math.log2(N);
    const searchSpace = Math.pow(N, state.length);
    const crackSecondsAvg = crackSecondsFor(state.length, N, state.scheme, state.tier, state.dictionary);

    lengthOutput.textContent = String(state.length);
    entropyEl.textContent = `${bits.toFixed(1)} bits`;
    searchspaceEl.textContent = state.dictionary ? "~10 million (breach list)" : formatBigNumber(searchSpace);
    cracktimeEl.textContent = formatDuration(crackSecondsAvg);

    const verdict = verdictFor(crackSecondsAvg, VERDICT_THRESHOLDS);
    renderVerdict(verdictEl, {
      ...verdict,
      message: `Estimated average crack time: ${formatDuration(crackSecondsAvg)} on a ${HARDWARE_TIERS[state.tier].label.toLowerCase()}.`,
    });

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    renderChart(chartEl, { charsetN: N, scheme: state.scheme, dictionary: state.dictionary, currentLength: state.length, isDark });
  }

  inputs.forEach((el) => {
    el.addEventListener("input", () => {
      if (checkboxIds.includes(`#${el.id}`)) enforceAtLeastOneCharset(el);
      render();
    });
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);

  render();
}
