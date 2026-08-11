import { EMAIL_AUTOMATIC_EVENTS, EMAIL_ACTIONS, SFTP_NODE } from "../data/transferEvents.js";

export function init(root) {
  const daySlider = root.querySelector("#m1-day-slider");
  const dayOutput = root.querySelector("#m1-day-output");
  const emailCountEl = root.querySelector("#m1-email-count");
  const sftpCountEl = root.querySelector("#m1-sftp-count");
  const emailNodesEl = root.querySelector("#m1-email-nodes");
  const sftpNodesEl = root.querySelector("#m1-sftp-nodes");
  const forwardBtn = root.querySelector("#m1-forward");
  const ccBtn = root.querySelector("#m1-cc");
  const downloadBtn = root.querySelector("#m1-download");
  const recallBtn = root.querySelector("#m1-recall");
  const revokeBtn = root.querySelector("#m1-revoke");
  const recallResultEl = root.querySelector("#m1-recall-result");
  const revokeResultEl = root.querySelector("#m1-revoke-result");

  const state = {
    day: 0,
    actions: {}, // actionKey -> day clicked
    recallClicked: false,
    removedNodeIds: new Set(),
    revoked: false,
  };

  [forwardBtn, ccBtn, downloadBtn, recallBtn, revokeBtn].forEach((btn) => { btn.disabled = false; });

  function opened() {
    return Object.keys(state.actions).length > 0;
  }

  function presentEmailAutoNodes() {
    return EMAIL_AUTOMATIC_EVENTS.filter((e) => e.day <= state.day);
  }

  function presentActionNodes() {
    return Object.entries(state.actions)
      .filter(([, day]) => day <= state.day)
      .flatMap(([key]) => EMAIL_ACTIONS[key].nodeLabels.map((label, i) => ({ id: `${key}-${i}`, label, recallable: false })));
  }

  function render() {
    dayOutput.textContent = String(state.day);

    const autoNodes = presentEmailAutoNodes();
    const actionNodes = presentActionNodes();
    const allEmailNodes = [...autoNodes, ...actionNodes];

    emailNodesEl.innerHTML = allEmailNodes
      .map((n) => {
        const removed = state.removedNodeIds.has(n.id);
        const cls = ["node-item", !n.recallable ? "node-permanent" : "", removed ? "node-revoked" : ""].filter(Boolean).join(" ");
        return `<li class="${cls}">${n.label}${removed ? " (removed)" : ""}</li>`;
      })
      .join("") || `<li class="node-item">Nothing sent yet</li>`;

    const emailOutsideControl = allEmailNodes.filter((n) => !state.removedNodeIds.has(n.id)).length;
    emailCountEl.textContent = String(emailOutsideControl);

    const sftpPresent = state.day >= 0 && !state.revoked;
    sftpNodesEl.innerHTML = sftpPresent
      ? `<li class="node-item">${SFTP_NODE.label}</li>`
      : `<li class="node-item node-revoked">${SFTP_NODE.label} (revoked)</li>`;
    sftpCountEl.textContent = sftpPresent ? "1" : "0";

    forwardBtn.disabled = "forward" in state.actions;
    ccBtn.disabled = "cc" in state.actions;
    downloadBtn.disabled = "download" in state.actions;
    recallBtn.disabled = state.recallClicked;
    revokeBtn.disabled = state.revoked;
  }

  daySlider.addEventListener("input", () => {
    state.day = Number(daySlider.value);
    render();
  });

  function wireAction(button, key) {
    button.addEventListener("click", () => {
      state.actions[key] = state.day;
      render();
    });
  }

  wireAction(forwardBtn, "forward");
  wireAction(ccBtn, "cc");
  wireAction(downloadBtn, "download");

  recallBtn.addEventListener("click", () => {
    state.recallClicked = true;
    const present = presentEmailAutoNodes();
    const removable = opened() ? [] : present.filter((n) => n.recallable);
    removable.forEach((n) => state.removedNodeIds.add(n.id));

    const totalPresent = present.length + presentActionNodes().length;
    const remaining = totalPresent - removable.length;

    recallResultEl.textContent = removable.length > 0
      ? `Recall attempted — ${removable.length} of ${totalPresent} copies removed (recipient hadn't opened it yet); ${remaining} remain out of your control.`
      : `Recall attempted — 0 of ${totalPresent} copies removed (the recipient had already opened or acted on it); ${remaining} remain out of your control.`;

    render();
  });

  revokeBtn.addEventListener("click", () => {
    state.revoked = true;
    revokeResultEl.textContent = "Access revoked — the recipient can no longer reach the file. Effective immediately.";
    render();
  });

  render();
}
