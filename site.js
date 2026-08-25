/* ============================================================
   viensdivi.lol — kopīgais skripts
   Sadaļas:
   1. Projektu fold/unfold
   2. Vācelītes kategoriju pārslēgšana + piekļuves kodi
   3. Kontaktformas modālais logs
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initFoldSections();
    initVaceleTabs();
    initContactModal();
});

/* ------------------------------------------------------------
   1. PROJEKTU FOLD / UNFOLD
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
   2. VĀCELĪTES KATEGORIJAS + PIEKĻUVES KODI
   ------------------------------------------------------------ */
function initVaceleTabs() {
    var tabs = document.querySelectorAll(".vacele-tab");
    var panels = document.querySelectorAll(".vacele-panel");
    if (!tabs.length || !panels.length) return;

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

    /* Piekļuves kodu pārbaude katram aizsargātam panelim */
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

/* ------------------------------------------------------------
   3. KONTAKTFORMAS MODĀLAIS LOGS
   ------------------------------------------------------------ */
function initContactModal() {
    var fab = document.getElementById("contact-fab");
    var overlay = document.getElementById("contact-modal");
    if (!fab || !overlay) return;

    var closeBtn = overlay.querySelector(".modal-close");
    var form = overlay.querySelector("#contact-form");
    var statusEl = overlay.querySelector(".modal-status");

    function openModal() {
        overlay.classList.add("open");
        statusEl.textContent = "";
    }

    function closeModal() {
        overlay.classList.remove("open");
    }

    fab.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay.classList.contains("open")) {
            closeModal();
        }
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        var nameField = form.querySelector("#contact-name");
        var emailField = form.querySelector("#contact-email");
        var messageField = form.querySelector("#contact-message");

        var name = nameField.value.trim();
        var email = emailField.value.trim();
        var message = messageField.value.trim();

        if (!name || !email || !message) {
            statusEl.textContent = "Lūdzu, aizpildi visus laukus.";
            return;
        }

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            statusEl.textContent = "Lūdzu, ievadi derīgu e-pasta adresi.";
            return;
        }

        statusEl.textContent = "Sūta...";

        /* Forma tiek nosūtīta uz contact@viensdivi.lol, izmantojot
           Formspree pakalpojumu. Nomaini FORM_ENDPOINT uz savu
           reālo Formspree formas adresi (skaties instrukciju atbildē). */
        var FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

        fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: new FormData(form)
        })
            .then(function (response) {
                if (response.ok) {
                    statusEl.textContent = "Ziņa nosūtīta!";
                    form.reset();
                } else {
                    statusEl.textContent = "Neizdevās nosūtīt ziņu. Mēģini vēlreiz vēlāk.";
                }
            })
            .catch(function () {
                statusEl.textContent = "Neizdevās nosūtīt ziņu. Mēģini vēlreiz vēlāk.";
            });
    });
}
