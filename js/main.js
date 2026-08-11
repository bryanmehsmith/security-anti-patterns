import { initTabs } from "./utils/tabs.js";
import { wireDisclosureControls } from "./utils/disclosure.js";
import { init as initPasswordCrack } from "./modules/passwordCrack.js";
import { init as initCredentialReuse } from "./modules/credentialReuse.js";
import { init as initPhishing } from "./modules/phishing.js";
import { init as initDataAtRest } from "./modules/dataAtRest.js";

initTabs();

document.querySelectorAll(".tabpanel").forEach((panel) => wireDisclosureControls(panel));

initPasswordCrack(document.getElementById("module-2"));
initCredentialReuse(document.getElementById("module-3"));
initPhishing(document.getElementById("module-4"));
initDataAtRest(document.getElementById("module-5"));
