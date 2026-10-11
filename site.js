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
   8. Fotoarhīvs (filmas strēmele + lightbox)
   9. Veikals (merch katalogs)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    initLoadingScreen();
    initFoldSections();
    initVaceleTabs();
    initTimeline();
    initDailyJoke();
    initCommingSoonBack();
    initPhotoArchive();
    initShop();
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
    "Kāds Dolāram kurss? Talsi-Dundaga",
    "Stulbs cilveks - maina apenes, gudrs - nutella maize",
    "Kas ir sarkans un kaitē zobiem? Ķieģelis.",
    "-Eu,Janka aizej pec alus. -Aj,nepatīk vienam iet pakaļ. -Nu tad ej pēc diviem!",
    "Kas notiek, ja sakrusto ASV+Krieviju+Vāciju un arābu = Obama bļa fon Ladens",
    "Kā Daunis kļuva gudrāks? Sākot mācīties.",
    "Vajag būt optimistam: Ja pat veiksme uzgriež muguru, vajag teikt - kāda smuka pakaļa!",
    "Vīrietis pateica - vīrietis izdarīja, ja neizdarīja - pateica vēlreiz.",
    "Ja gribi, lai meitene raksta pirmā, tad aizņemies no viņas naudu.",
    "Ja kaut kas nesanāk ar pirmo reizi, vienmēr ir iespēja padoties",
    "Daudzi sūdzās par savu izskatu, bet neviens nesūdzas par savām smadzenēm",
    "Dzīve ir bēdīga, bet vismaz alga ir smieklīga",
    "Sievietes ir ļoti jaukas. Viņas spēj piedot vīrietim, ja pat viņš ne pie kā nav vainīgs.",
    "Ja dzīve tev met ar ķieģeļiem, tad taisa sev māju no tiem",
    "Saka, ka skopais maksā divreiz, tāpēc es strādāju pie skopā.",
    "Ne viss, kas spīd ir zelts, dažreiz tas ir plikais pauris",
    "Tētis palūdza, lai sagriežu kartupeļus. Tā arī darīju, paņēmu lapu, uzrakstīju 'kartupeļi' un sagriezu to vairākās daļās."

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

/* ------------------------------------------------------------
   8. FOTOARHĪVS (fotoarhivs.html)
   Dati: photoArchive saraksts atrodas pašā fotoarhivs.html
   (sadaļa "FOTOARHĪVA DATI"). Šeit nekas nav jāmaina.
   Skripts darbojas tikai lapā, kurā ir #photo-archive.
   ------------------------------------------------------------ */

/* Izveido elementu ar tekstu (textContent — nekad raw HTML) */
function makeTextEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
}

/* Tukšs / nepastāvošs lauks → false, lai metadatu rindu var paslēpt */
function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
}

/* Vietturis, ja attēla fails vēl nav pievienots */
function makePhotoPlaceholder() {
    return makeTextEl("span", "photo-placeholder", "Pievieno foto");
}

/* Attēls ar rezerves variantu (nav lauzta attēla ikonas) */
function makePhotoImage(photo, altText) {
    if (!hasText(photo.src)) return makePhotoPlaceholder();

    var img = document.createElement("img");
    img.src = photo.src;
    img.alt = altText;
    img.loading = "lazy";
    img.addEventListener("error", function () {
        if (img.parentNode) img.parentNode.replaceChild(makePhotoPlaceholder(), img);
    });
    return img;
}

function initPhotoArchive() {
    var root = document.getElementById("photo-archive");
    if (!root) return;

    var archive = (typeof photoArchive !== "undefined" && Array.isArray(photoArchive)) ? photoArchive : [];

    if (!archive.length) {
        root.appendChild(makeTextEl("p", "photo-empty", "Fotoarhīvs pagaidām ir tukšs."));
        return;
    }

    /* Plakans saraksts ar visiem kadriem lightbox pārslēgšanai */
    var allFrames = [];

    archive.forEach(function (event, eventIndex) {
        var eventTitle = hasText(event.title) ? event.title : "Pasākums";
        var photos = Array.isArray(event.photos) ? event.photos : [];

        var section = document.createElement("section");
        section.className = "photo-event";
        section.setAttribute("aria-labelledby", "photo-event-" + eventIndex);

        var head = document.createElement("div");
        head.className = "photo-event-head";
        var heading = makeTextEl("h2", "", eventTitle);
        heading.id = "photo-event-" + eventIndex;
        head.appendChild(heading);
        if (hasText(event.date)) {
            head.appendChild(makeTextEl("p", "photo-event-date", event.date));
        }
        section.appendChild(head);

        var strip = document.createElement("div");
        strip.className = "film-strip";
        /* ļauj ritināt strēmeli ar tastatūru */
        strip.tabIndex = 0;
        strip.setAttribute("role", "group");
        strip.setAttribute("aria-label", eventTitle + " — fotogrāfijas");

        var track = document.createElement("div");
        track.className = "film-track";

        photos.forEach(function (photo, photoIndex) {
            var altText = hasText(photo.alt)
                ? photo.alt
                : eventTitle + " — foto " + (photoIndex + 1);

            var frame = document.createElement("button");
            frame.type = "button";
            frame.className = "film-frame";
            frame.setAttribute("aria-label", "Atvērt: " + altText);
            frame.appendChild(makePhotoImage(photo, altText));

            var frameData = { event: event, eventTitle: eventTitle, photo: photo, alt: altText, button: frame };
            allFrames.push(frameData);
            frame.addEventListener("click", function () {
                openLightbox(allFrames.indexOf(frameData));
            });

            track.appendChild(frame);
        });

        if (!photos.length) {
            track.appendChild(makeTextEl("p", "photo-empty", "Foto drīz tiks pievienoti."));
        }

        strip.appendChild(track);
        section.appendChild(strip);
        root.appendChild(section);
    });

    /* ---------- Lightbox ---------- */
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Fotogrāfijas apskate");

    var figure = document.createElement("figure");
    figure.className = "lightbox-figure";
    var imageSlot = document.createElement("div");
    var meta = document.createElement("figcaption");
    meta.className = "lightbox-meta";
    figure.appendChild(imageSlot);
    figure.appendChild(meta);

    var closeBtn = makeTextEl("button", "lightbox-btn lightbox-close", "✕");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Aizvērt");
    var prevBtn = makeTextEl("button", "lightbox-btn lightbox-prev", "←");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Iepriekšējais foto");
    var nextBtn = makeTextEl("button", "lightbox-btn lightbox-next", "→");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Nākamais foto");

    lightbox.appendChild(figure);
    lightbox.appendChild(closeBtn);
    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);
    document.body.appendChild(lightbox);

    var currentIndex = -1;

    function renderLightbox() {
        var item = allFrames[currentIndex];
        var photo = item.photo;

        imageSlot.innerHTML = "";
        imageSlot.appendChild(makePhotoImage(photo, item.alt));

        meta.innerHTML = "";
        meta.appendChild(makeTextEl("p", "lightbox-event", item.eventTitle));
        if (hasText(photo.photographer)) {
            meta.appendChild(makeTextEl("p", "", "Autors: " + photo.photographer));
        }
        if (hasText(photo.people)) {
            meta.appendChild(makeTextEl("p", "", "Foto redzami: " + photo.people));
        }
        if (hasText(photo.caption)) {
            meta.appendChild(makeTextEl("p", "", photo.caption));
        }

        prevBtn.hidden = currentIndex <= 0;
        nextBtn.hidden = currentIndex >= allFrames.length - 1;
    }

    function openLightbox(index) {
        currentIndex = index;
        renderLightbox();
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        document.body.style.overflow = "";
        var item = allFrames[currentIndex];
        if (item && item.button) item.button.focus();
    }

    function step(delta) {
        var next = currentIndex + delta;
        if (next < 0 || next >= allFrames.length) return;
        currentIndex = next;
        renderLightbox();
    }

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });

    /* klikšķis uz tumšā fona (ne uz attēla/pogām) aizver */
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
    });
}

/* ------------------------------------------------------------
   9. VEIKALS (veikals.html)
   Dati: merchProducts saraksts atrodas pašā veikals.html
   (sadaļa "PRODUKTU DATI"). Šeit nekas nav jāmaina.
   Skripts darbojas tikai lapā, kurā ir #shop-grid.
   ------------------------------------------------------------ */
function initShop() {
    var grid = document.getElementById("shop-grid");
    if (!grid) return;

    var products = (typeof merchProducts !== "undefined" && Array.isArray(merchProducts)) ? merchProducts : [];

    products.forEach(function (product) {
        var item = document.createElement("article");
        item.className = "shop-item";

        var visual = document.createElement("div");
        visual.className = "shop-item-visual";
        if (hasText(product.image)) {
            var img = document.createElement("img");
            img.src = product.image;
            img.alt = hasText(product.alt) ? product.alt : product.name;
            img.loading = "lazy";
            img.addEventListener("error", function () {
                visual.textContent = product.name;
            });
            visual.appendChild(img);
        } else {
            /* nav attēla — tīrs tipogrāfisks vietturis */
            visual.textContent = product.name;
        }
        item.appendChild(visual);

        var body = document.createElement("div");
        body.className = "shop-item-body";
        body.appendChild(makeTextEl("h3", "", product.name));
        if (hasText(product.description)) {
            body.appendChild(makeTextEl("p", "", product.description));
        }
        body.appendChild(makeTextEl("p", "shop-status", product.available ? "PIEEJAMS" : "NAV PIEEJAMS"));

        /* saite parādās tikai tad, ja produkts ir pieejams un ievadīta saite */
        if (product.available && hasText(product.link)) {
            var p = document.createElement("p");
            var a = makeTextEl("a", "", "Skatīt →");
            a.href = product.link;
            a.target = "_blank";
            a.rel = "noopener";
            p.appendChild(a);
            body.appendChild(p);
        }

        item.appendChild(body);
        grid.appendChild(item);
    });
}
