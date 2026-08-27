/* ============================================================
   viensdivi.lol — kopīgais skripts
   Sadaļas:
   1. Fake loading screen
   2. Projektu fold/unfold
   3. Vācelītes piekļuves kodi
   4. TIMELINE DATA (vienīgais datu avots "12" notikumiem)
   5. Timeline renderēšana (Vēsture & Arhīvs)
   6. DAILY JOKE
   7. "Drīzumā" pogas back-navigācija
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initLoadingScreen();
    initFoldSections();
    initVaceleTabs();
    initTimeline();
    initDailyJoke();
    initCommingSoonBack();
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

/* ------------------------------------------------------------
   4. TIMELINE DATA
   Vienīgais datu avots "12" notikumiem. No šejienes tiek
   automātiski ģenerēts Vēsture & Arhīvs timeline.

   Katram ierakstam:
   - title: notikuma nosaukums
   - date:  "GGGG-MM-DD" formātā
   - time:  (nav obligāts) "HH:MM", ja notikumam ir precīzs laiks

   Lai pievienotu jaunu notikumu, pievieno jaunu objektu šim
   sarakstam — nekas cits kodā nav jāmaina.
   ------------------------------------------------------------ */
var TIMELINE_DATA = [
    { title: "Lil Ziema × DJ Ricka — “Freaky Phonk” publicēšana", date: "2024-07-17" },
    { title: "“12” Discord servera dibināšana", date: "2024-09-02", time: "20:12" },
    { title: "Roblox spēle \"Baranki Gnu Obby\"", date: "2024-12-30" },
    { title: "Roblox spēle “Berry Picking”", date: "2025-10-10" },
    { title: "Mr Choppedos ierakstīšanas sesija", date: "2026-07-26" },
    { title: "Čipsi Džinsi - \"Strīda dziesmiņa\" publicēšana", date: "2026-08-20" },
    { title: "“12” kopienas mājaslapas izveide", date: "2026-08-22" }
];

function formatTimelineDisplayDate(item) {
    var parts = item.date.split("-");
    var displayDate = parts[2] + "." + parts[1] + "." + parts[0];
    if (item.time) {
        displayDate += " · " + item.time;
    }
    return displayDate;
}

/* ------------------------------------------------------------
   5. TIMELINE RENDERĒŠANA (Vēsture & Arhīvs)
   ------------------------------------------------------------ */
function initTimeline() {
    var container = document.getElementById("timeline-container");
    if (!container) return;

    var sorted = TIMELINE_DATA.slice().sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });

    sorted.forEach(function (item) {
        var itemEl = document.createElement("div");
        itemEl.className = "timeline-item";

        var titleEl = document.createElement("p");
        titleEl.className = "timeline-title";
        titleEl.textContent = item.title;

        var dateEl = document.createElement("p");
        dateEl.className = "timeline-date";
        dateEl.textContent = formatTimelineDisplayDate(item);

        itemEl.appendChild(titleEl);
        itemEl.appendChild(dateEl);
        container.appendChild(itemEl);
    });
}

/* ------------------------------------------------------------
   Palīgfunkcija — pašreizējais laiks pēc Latvijas laika joslas
   ------------------------------------------------------------ */
function getRigaNow() {
    var rigaString = new Date().toLocaleString("en-US", { timeZone: "Europe/Riga" });
    return new Date(rigaString);
}

function pad2(n) {
    return n < 10 ? "0" + n : String(n);
}

/* ------------------------------------------------------------
   6. DAILY JOKE
   Katru dienu (pēc Latvijas laika) automātiski parāda vienu
   no jokiem, izvēlēts pēc datuma — mainās katru dienu, bet
   nemainās vairākas reizes tās pašas dienas laikā.
   Jokus vēlāk var brīvi nomainīt šajā sarakstā.
   ------------------------------------------------------------ */
var DAILY_JOKES = [
    "Joks 1",
    "Joks 2",
    "Joks 3"
];

function getRigaDateKey(rigaDate) {
    var y = rigaDate.getFullYear();
    var m = pad2(rigaDate.getMonth() + 1);
    var d = pad2(rigaDate.getDate());
    return y + "-" + m + "-" + d;
}

function pickDailyJoke(rigaDate) {
    if (!DAILY_JOKES.length) return "";
    var dateKey = getRigaDateKey(rigaDate);
    var hash = 0;
    for (var i = 0; i < dateKey.length; i++) {
        hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }
    var index = hash % DAILY_JOKES.length;
    return DAILY_JOKES[index];
}

function getSecondsUntilNextRigaDay(rigaDate) {
    var nextMidnight = new Date(
        rigaDate.getFullYear(),
        rigaDate.getMonth(),
        rigaDate.getDate() + 1,
        0, 0, 0
    );
    return Math.max(0, Math.round((nextMidnight - rigaDate) / 1000));
}

function formatJokeCountdown(totalSeconds) {
    var totalMinutes = Math.ceil(totalSeconds / 60);
    var h = Math.floor(totalMinutes / 60);
    var m = totalMinutes % 60;
    if (h > 0) {
        return h + "h " + m + "min";
    }
    return m + "min";
}

function initDailyJoke() {
    var jokeEl = document.getElementById("daily-joke-text");
    var countdownEl = document.getElementById("daily-joke-countdown");
    if (!jokeEl || !countdownEl) return;

    function render() {
        var rigaNow = getRigaNow();
        jokeEl.textContent = pickDailyJoke(rigaNow);
        var secondsLeft = getSecondsUntilNextRigaDay(rigaNow);
        countdownEl.textContent = "Nākamais joks pēc " + formatJokeCountdown(secondsLeft);
    }

    render();
    setInterval(render, 30000);
}

/* ------------------------------------------------------------
   7. "DRĪZUMĀ" POGAS BACK-NAVIGĀCIJA
   Izmanto pārlūka vēsturi, lai lietotājs nonāktu tieši tajā
   vietā, no kurienes atnāca. Ja vēstures nav, atgriežas uz
   index.html.
   ------------------------------------------------------------ */
function initCommingSoonBack() {
    var backLink = document.getElementById("back-link");
    if (!backLink) return;

    backLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "index.html";
        }
    });
}
