export const PHISHING_FLAGS = [
  {
    id: "sender",
    label: "Sender mismatch",
    whyPlain: "The display name says \"IT Support Desk\", but the actual email address is a lookalike domain (\"it-support-helpdesk.com\"), not your company's real domain.",
    whyTechnical: "Display names are arbitrary text the sender controls; only the address after the @ is authenticated (and even that only weakly, via SPF/DKIM/DMARC checks the receiving server performs). Always check the actual address, not the friendly name your mail client shows by default.",
  },
  {
    id: "urgency",
    label: "Urgency / pressure language",
    whyPlain: "\"Act within 24 hours or your account will be suspended\" is designed to make you act before you think.",
    whyTechnical: "Urgency and scarcity are classic social-engineering pressure tactics: they short-circuit the deliberate, skeptical thinking that would otherwise catch the other red flags on this page.",
  },
  {
    id: "link",
    label: "Lookalike link",
    whyPlain: "The link text reads \"Verify your account now\", but the actual destination it points to is a different, unrelated domain.",
    whyTechnical: "Hovering (or long-pressing on mobile) shows the real target URL in the status bar before you click. Display text in an <code>&lt;a&gt;</code> tag is arbitrary; it can say anything regardless of where the href actually points.",
  },
  {
    id: "greeting",
    label: "Generic greeting",
    whyPlain: "\"Dear Customer\" instead of your actual name: a legitimate provider that emails you about your account almost always already knows who you are.",
    whyTechnical: "Mass-phishing campaigns are sent to harvested address lists with no per-recipient personalization data, so a generic greeting is the default; targeted \"spear phishing\" campaigns do personalize this, so its absence is a signal, not a guarantee.",
  },
  {
    id: "attachment",
    label: "Unexpected attachment",
    whyPlain: "An attachment you didn't ask for, on a message that didn't need one: invoices, \"voicemails\", and scan-to-email PDFs are common disguises.",
    whyTechnical: "Attachments are a common initial-access vector for malware (macro-enabled Office documents, executables renamed with double extensions like <code>invoice.pdf.exe</code>). Treat any unsolicited attachment as suspicious until verified through a separate channel.",
  },
  {
    id: "qr",
    label: "Embedded QR code",
    whyPlain: "A QR code in the email body, asking you to scan it with your phone to \"verify\" something.",
    whyTechnical: "\"Quishing\" (QR phishing) specifically targets the habit of hovering over links before clicking: a QR code hides the destination URL from that habit entirely, and scanning it on a phone often bypasses the same email security filtering the link itself would have triggered.",
  },
  {
    id: "footer",
    label: "Mismatched footer / legal text",
    whyPlain: "The footer references a different company name, a broken unsubscribe link, or copyright text that doesn't match who the email claims to be from.",
    whyTechnical: "Phishing templates are frequently repurposed from one brand to another with an incomplete find-and-replace, leaving footer boilerplate, physical addresses, or legal text from the original template.",
  },
];
