const ACCOUNTS = [
  { id: "email", label: "Email" },
  { id: "banking", label: "Banking" },
  { id: "shopping", label: "Shopping" },
  { id: "social", label: "Social" },
  { id: "work", label: "Work login" },
];

export function init(root) {
  const grid = root.querySelector("#m3-accounts");
  const counterEl = root.querySelector("#m3-counter");
  const reuseToggle = root.querySelector("#m3-reuse");
  const mfaToggle = root.querySelector("#m3-mfa");
  const breachBtn = root.querySelector("#m3-breach");
  const resetBtn = root.querySelector("#m3-reset");

  grid.innerHTML = ACCOUNTS.map((a) => `<div class="account-node" data-id="${a.id}">${a.label}</div>`).join("");
  const nodeEls = Object.fromEntries(ACCOUNTS.map((a) => [a.id, grid.querySelector(`[data-id="${a.id}"]`)]));

  function updateCounter() {
    const compromised = ACCOUNTS.filter((a) => nodeEls[a.id].classList.contains("state-breached")).length;
    counterEl.textContent = `Accounts compromised: ${compromised}/${ACCOUNTS.length}`;
  }

  function resetAccounts() {
    ACCOUNTS.forEach((a) => { nodeEls[a.id].className = "account-node"; });
    updateCounter();
    breachBtn.disabled = false;
  }

  function breach() {
    const reuse = reuseToggle.checked;
    const mfa = mfaToggle.checked;
    const targets = reuse ? ACCOUNTS.map((a) => a.id) : ["shopping"];

    targets.forEach((id, i) => {
      setTimeout(() => {
        const el = nodeEls[id];
        el.classList.add(mfa ? "state-shielded" : "state-breached");
        el.title = mfa ? "Password known, but login blocked by MFA" : "Password known and login succeeded";
        updateCounter();
      }, i * 180);
    });

    breachBtn.disabled = true;
  }

  reuseToggle.addEventListener("change", resetAccounts);
  mfaToggle.addEventListener("change", resetAccounts);
  breachBtn.addEventListener("click", breach);
  resetBtn.addEventListener("click", resetAccounts);

  resetAccounts();
}
