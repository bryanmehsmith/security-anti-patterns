import { PHISHING_FLAGS } from "../data/phishingFlags.js";

const QR_MOCK_SVG = `<svg aria-hidden="true" width="46" height="46" viewBox="0 0 10 10" style="vertical-align:middle;margin-right:6px;">
  <rect width="10" height="10" fill="var(--card-background)" />
  ${[[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[4,0],[5,1],[7,0],[8,0],[9,0],[7,1],[9,1],[7,2],[8,2],[9,2],[0,7],[1,7],[2,7],[0,8],[2,8],[0,9],[1,9],[2,9],[5,5],[6,6],[4,7],[8,8],[9,9],[7,7]]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="currentColor" />`).join("")}
</svg>`;

function hotspot(flagId, innerHtml) {
  return `<button type="button" class="hotspot" data-flag-id="${flagId}" aria-describedby="m4-explain-${flagId}">${innerHtml}</button><span class="flag-explanation" id="m4-explain-${flagId}"></span>`;
}

function emailMarkup() {
  return `
    <div class="mail-field"><strong>From:</strong> ${hotspot("sender", '"IT Support Desk" &lt;alerts@it-support-helpdesk.com&gt;')}</div>
    <div class="mail-field"><strong>To:</strong> you@yourcompany.com</div>
    <div class="mail-field"><strong>Subject:</strong> [Action Required] Verify your account</div>
    <div class="mail-body">
      <p>${hotspot("greeting", "Dear Customer,")}</p>
      <p>We detected unusual activity on your account. You must verify your identity ${hotspot("urgency", "within 24 hours or your account will be suspended.")}</p>
      <p>${hotspot("link", '<a href="#" onclick="return false;" title="Actual destination differs from this text">Click here to verify your account now</a>')}</p>
      <p>Alternatively, scan the code below to verify from your mobile device:</p>
      <p>${hotspot("qr", QR_MOCK_SVG + "Scan to verify")}</p>
      <p>Attached: ${hotspot("attachment", "Account_Statement_Invoice.pdf.exe")}</p>
      <p>Thank you,<br>IT Support Team</p>
    </div>
    <div class="mail-field" style="margin-top:14px;border-top:1px solid var(--border-color);padding-top:10px;font-size:0.78rem;">
      ${hotspot("footer", "&copy; 2019 Contoso Ltd. All rights reserved. &nbsp; Unsubscribe")}
    </div>`;
}

function explanationHtml(flag) {
  return `<strong>${flag.label}:</strong> ${flag.whyPlain} <details class="tech" style="margin-top:6px;"><summary>Technical detail</summary><p>${flag.whyTechnical}</p></details>`;
}

export function init(root) {
  const emailEl = root.querySelector("#m4-email");
  const counterEl = root.querySelector("#m4-counter");
  const revealBtn = root.querySelector("#m4-reveal");
  const summaryEl = root.querySelector("#m4-summary");

  emailEl.innerHTML = emailMarkup();

  const found = new Set();

  function updateCounter() {
    counterEl.textContent = `Red flags found: ${found.size} / ${PHISHING_FLAGS.length}`;
  }

  function revealFlag(flagId) {
    const flag = PHISHING_FLAGS.find((f) => f.id === flagId);
    if (!flag || found.has(flagId)) return;
    found.add(flagId);

    const btn = emailEl.querySelector(`.hotspot[data-flag-id="${flagId}"]`);
    const explanation = emailEl.querySelector(`#m4-explain-${flagId}`);
    btn.classList.add("found");
    explanation.innerHTML = explanationHtml(flag);
    explanation.classList.add("visible");

    updateCounter();
    if (found.size === PHISHING_FLAGS.length) renderSummary();
  }

  function renderSummary() {
    summaryEl.innerHTML = `<h3>All red flags in this email</h3>` + PHISHING_FLAGS.map((f) => `<div class="module-section">${explanationHtml(f)}</div>`).join("");
  }

  emailEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".hotspot");
    if (btn) revealFlag(btn.dataset.flagId);
  });

  revealBtn.addEventListener("click", () => {
    PHISHING_FLAGS.forEach((f) => revealFlag(f.id));
  });

  updateCounter();
}
