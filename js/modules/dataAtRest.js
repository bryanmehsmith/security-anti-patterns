const SCENARIOS = [
  {
    id: "laptop",
    title: "Lost or stolen laptop",
    onLabel: "Disk encryption: On",
    offLabel: "Disk encryption: Off",
    onCopy: "The drive is unreadable without your credentials. Recovering the data without them is computationally infeasible.",
    offCopy: "Whoever has the laptop has every file on it, instantly, no login needed: just pull the drive or boot from a USB stick.",
    tech: "Full-disk encryption (BitLocker, FileVault, LUKS) encrypts the drive with a key protected by your login credentials/TPM. Without it, an attacker can remove the drive, mount it on another machine, and read the filesystem directly. The OS login screen was never actually protecting the data, only the running session.",
  },
  {
    id: "bucket",
    title: "Cloud storage bucket",
    onLabel: "Access: Private + authenticated",
    offLabel: "Access: Public",
    onCopy: "Anonymous requests are rejected. Only authenticated, authorized identities can list or download anything.",
    offCopy: "Anyone with the URL, or a bucket-scanning bot, can list and download every file. No login required.",
    tech: "Public buckets are one of the most common real-world breach causes: automated scanners continuously enumerate common bucket-name patterns across providers. A publicly listable bucket can be read with a single unauthenticated request, e.g. <code>curl https://example-bucket.s3.amazonaws.com/</code>, with no credentials and no exploit, just a misconfigured permission.",
  },
  {
    id: "browser",
    title: "Browser-saved passwords",
    onLabel: "Autofill: Password manager",
    offLabel: "Autofill: Browser-saved",
    onCopy: "Reading the vault still requires the separate master password or biometric, even on an unlocked device.",
    offCopy: "Anyone with the unlocked device can open the browser's saved-passwords page and read every password in plain text.",
    tech: "Most browsers gate their saved-password view behind the OS login, not a separate secret, so once a device is unlocked (shoulder surf, unattended session, stolen unlocked phone), every saved credential is one settings page away. A dedicated password manager adds a second, independent secret that an unlocked device alone doesn't satisfy.",
  },
];

function cardMarkup(s) {
  return `
    <div class="scenario-card" data-id="${s.id}">
      <span class="status-pill exposed" data-role="pill">Unprotected</span>
      <h4>${s.title}</h4>
      <label class="toggle-row">
        <span class="toggle-switch">
          <input type="checkbox" data-role="toggle">
          <span class="toggle-slider"></span>
        </span>
        <span data-role="toggle-label">${s.offLabel}</span>
      </label>
      <p data-role="copy">${s.offCopy}</p>
      <details class="tech">
        <summary>Technical detail</summary>
        <p>${s.tech}</p>
      </details>
    </div>`;
}

export function init(root) {
  const container = root.querySelector("#m5-cards");
  container.innerHTML = SCENARIOS.map(cardMarkup).join("");

  SCENARIOS.forEach((s) => {
    const card = container.querySelector(`[data-id="${s.id}"]`);
    const toggle = card.querySelector('[data-role="toggle"]');
    const pill = card.querySelector('[data-role="pill"]');
    const label = card.querySelector('[data-role="toggle-label"]');
    const copy = card.querySelector('[data-role="copy"]');

    toggle.addEventListener("change", () => {
      const protectedState = toggle.checked;
      pill.textContent = protectedState ? "Protected" : "Unprotected";
      pill.className = `status-pill ${protectedState ? "protected" : "exposed"}`;
      label.textContent = protectedState ? s.onLabel : s.offLabel;
      copy.textContent = protectedState ? s.onCopy : s.offCopy;
    });
  });
}
