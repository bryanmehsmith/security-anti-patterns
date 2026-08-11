// Automatic email copies that exist purely from sending the message, before
// the recipient does anything with it. `recallable` marks copies that a
// best-effort recall (e.g. Outlook message recall) could plausibly remove --
// only if the recipient hasn't opened the message yet.
export const EMAIL_AUTOMATIC_EVENTS = [
  { id: "sent-outbox", day: 0, label: "Your Sent folder", recallable: false },
  { id: "recipient-inbox", day: 0, label: "Recipient's inbox (unopened)", recallable: true },
  { id: "recipient-mailserver", day: 0, label: "Recipient's mail server", recallable: true },
  { id: "backup-1", day: 1, label: "Day-1 backup snapshot", recallable: false },
  { id: "backup-30", day: 30, label: "Day-30 backup snapshot", recallable: false },
  { id: "backup-90", day: 90, label: "Day-90 backup snapshot", recallable: false },
];

// User-triggered, one-shot actions. Clicking any of these implies the
// recipient has opened the message, which is why they retroactively make the
// two "unopened" automatic nodes unrecallable.
export const EMAIL_ACTIONS = {
  forward: { label: "Recipient forwards it", nodeLabels: ["Forwarded copy (recipient 1)", "Forwarded copy (recipient 2)"] },
  cc: { label: "Recipient CCs a colleague", nodeLabels: ["CC'd colleague's inbox"] },
  download: { label: "Recipient downloads it to a personal device", nodeLabels: ["Recipient's personal device"] },
};

export const SFTP_NODE = { id: "sftp-access", label: "Recipient's authenticated access" };
