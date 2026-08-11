const MODULE_IDS = ["module-1", "module-2", "module-3", "module-4", "module-5"];

export function initTabs() {
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tabpanel"));

  function activate(id, { focus = false } = {}) {
    if (!MODULE_IDS.includes(id)) id = MODULE_IDS[0];

    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });

    panels.forEach((panel) => {
      panel.dataset.active = String(panel.id === id);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activate(tab.dataset.tab);
      history.replaceState(null, "", `#${tab.dataset.tab}`);
    });

    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") targetIndex = 0;
      if (event.key === "End") targetIndex = tabs.length - 1;
      if (targetIndex === null) return;

      event.preventDefault();
      const targetTab = tabs[targetIndex];
      activate(targetTab.dataset.tab, { focus: true });
      history.replaceState(null, "", `#${targetTab.dataset.tab}`);
    });
  });

  window.addEventListener("hashchange", () => {
    activate(location.hash.slice(1));
  });

  activate(location.hash.slice(1));
}
