/* ============================================================
   viensdivi.lol — kopīgais skripts
   Sadaļas:
   1. Fake loading screen
   2. Projektu fold/unfold
   3. Vācelītes piekļuves kodi
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initLoadingScreen();
    initFoldSections();
    initVaceleTabs();
});

/* ------------------------------------------------------------
   1. FAKE LOADING SCREEN
   ------------------------------------------------------------ */
function initLoadingScreen() {
    var loader = document.getElementById("loading-screen");
    if (!loader) return;

    setTimeout(function () {
        loader.classList.add("fade-out");
        setTimeout(function () {
            loader.style.display = "none";
        }, 600);
    }, 400);
}

/* ------------------------------------------------------------
   2. PROJEKTU FOLD / UNFOLD
   ------------------------------------------------------------ */
function initFoldSections() {
    var toggles = document.querySelectorAll(".fold-toggle");
    if (!toggles.length) return;

    toggles.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var section = btn.closest(".fold-section");
            var isOpen = section.classList.toggle("open");
            btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            var arrow = btn.querySelector(".fold-arrow");
            if (arrow) arrow.textContent = isOpen ? "▲" : "▼";
        });
    });
}

/* ------------------------------------------------------------
   3. VĀCELĪTES KATEGORIJAS + PIEKĻUVES KODI
   ------------------------------------------------------------ */
function initVaceleTabs() {
    var tabs = document.querySelectorAll(".vacele-tab");
    var panels = document.querySelectorAll(".vacele-panel");
    if (!panels.length) return;

    /* Kategoriju pogas (ja tādas ir) ļauj pārslēgties starp sadaļām */
    if (tabs.length) {
        tabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                tabs.forEach(function (t) { t.classList.remove("active"); });
                panels.forEach(function (p) { p.classList.remove("active"); });

                tab.classList.add("active");
                var targetId = tab.getAttribute("data-target");
                var targetPanel = document.getElementById(targetId);
                if (targetPanel) targetPanel.classList.add("active");
            });
        });
    }

    /* Piekļuves kodu pārbaude katram aizsargātam panelim.
       Šī daļa darbojas neatkarīgi no tā, vai kategoriju pogas eksistē. */
    panels.forEach(function (panel) {
        var code = panel.getAttribute("data-code");
        if (!code) return; // šai kategorijai nav piekļuves koda

        var overlay = panel.querySelector(".vacele-lock-overlay");
        var content = panel.querySelector(".vacele-panel-content");
        var input = panel.querySelector(".vacele-code-input");
        var submitBtn = panel.querySelector(".vacele-code-submit");
        var errorEl = panel.querySelector(".vacele-error");
        if (!overlay || !content || !input || !submitBtn) return;

        function tryUnlock() {
            if (input.value === code) {
                overlay.style.display = "none";
                content.classList.remove("blurred");
            } else {
                errorEl.textContent = "Nepareizs kods, mēģini vēlreiz.";
            }
        }

        submitBtn.addEventListener("click", tryUnlock);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") tryUnlock();
        });
    });
}
