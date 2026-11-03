(function () {
  // Menu
  var hb = document.getElementById("hamburger"), nl = document.getElementById("navLinks");
  if (hb && nl) {
    hb.addEventListener("click", function () { var o = nl.classList.toggle("open"); hb.setAttribute("aria-expanded", o ? "true" : "false"); });
    nl.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { nl.classList.remove("open"); hb.setAttribute("aria-expanded", "false"); }); });
  }

  // FAQ
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.parentElement, open = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (el) { el.classList.remove("open"); var b = el.querySelector(".faq-question"); if (b) b.setAttribute("aria-expanded", "false"); });
      if (!open) { item.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
    });
  });

  // Reveal: visível por defeito; só esconde por JS, IO revela, 3,5 s força tudo visível
  var els = [].slice.call(document.querySelectorAll(".reveal"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (els.length && "IntersectionObserver" in window && !reduce) {
    var show = function (el) { el.setAttribute("data-revealed", "true"); };
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // já à vista: não esconder
      el.setAttribute("data-revealed", "false"); io.observe(el);
    });
    setTimeout(function () { els.forEach(show); }, 3500);
  }

  // Copiar e-mail
  var cp = document.getElementById("copyEmail");
  if (cp) cp.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText("luapaiva022@gmail.com").then(function () { cp.textContent = "Copiado"; setTimeout(function () { cp.textContent = "Copiar"; }, 2000); });
  });

  // Formulário → WhatsApp (window.open síncrono no submit: Safari bloqueia se atrasar)
  var f = document.getElementById("contactForm");
  if (f) f.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = f.name.value.trim();
    if (!name) { f.name.focus(); return; }
    var lines = ["Olá, Luã! Vim pelo site.", "Nome: " + name];
    if (f.city.value.trim()) lines.push("Cidade: " + f.city.value.trim());
    if (f.subject.value) lines.push("Assunto: " + f.subject.value);
    if (f.message.value.trim()) lines.push("", f.message.value.trim());
    var url = "https://wa.me/5522997778942?text=" + encodeURIComponent(lines.join("\n"));
    var w = window.open(url, "_blank", "noopener");
    if (!w) location.href = url;
    try { if (window.hlmTrack) hlmTrack.track("whatsapp", { cta_location: "form" }); } catch (err) {}
  });
})();

// WhatsApp flutuante: aparece depois de 220 px; tooltip 1,2 s depois, some aos 4 s
(function () {
  var b = document.getElementById("wa-float"); if (!b) return;
  var tipped = false;
  function on() {
    if (window.scrollY > 220) {
      b.classList.add("show");
      if (!tipped) { tipped = true; setTimeout(function () { b.classList.add("tip"); setTimeout(function () { b.classList.remove("tip"); }, 4000); }, 1200); }
    } else b.classList.remove("show");
  }
  window.addEventListener("scroll", on, { passive: true }); on();
})();

// Aviso de cookies (LGPD) — Consent Mode v2 avançado; o default negado está no <head>.
(function () {
  var KEY = "lp_consent", banner = document.getElementById("cookies"), saved = null;
  function update(v) {
    if (typeof gtag !== "function") return;
    var g = v ? "granted" : "denied";
    gtag("consent", "update", { ad_storage: g, analytics_storage: g, ad_user_data: g, ad_personalization: g });
  }
  function clearCookies() {
    var names = ["_gcl_au", "_gcl_aw", "_gcl_dc", "_gcl_gb", "_gcl_gs", "_gcl_ag"];
    document.cookie.split(";").forEach(function (c) { var n = c.split("=")[0].trim(); if (/^_ga(_|$)/.test(n)) names.push(n); });
    var labels = location.hostname.split("."), domains = [""];
    for (var i = 0; i < labels.length - 1; i++) { var d = labels.slice(i).join("."); domains.push("; domain=" + d, "; domain=." + d); }
    names.forEach(function (n) { domains.forEach(function (d) { document.cookie = n + "=; Max-Age=0; path=/" + d; }); });
    try { localStorage.removeItem("_gcl_ls"); localStorage.removeItem("hlm_first"); } catch (e) {}
  }
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!banner) return;
  if (saved !== "sim" && saved !== "nao") {
    // 1,5 s depois do LCP (tecto 4 s), para não ser o LCP nem tapar o hero
    var shown = false, show = function () { if (!shown) { shown = true; banner.classList.add("show"); } };
    var cap = setTimeout(show, 4000), t = 0;
    try {
      new PerformanceObserver(function (list) {
        var e = list.getEntries(), last = e[e.length - 1]; if (!last) return;
        clearTimeout(t); t = setTimeout(function () { clearTimeout(cap); show(); }, Math.max(0, last.startTime + 1500 - performance.now()));
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (e) { t = setTimeout(show, 1500); }
  }
  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    banner.classList.remove("show");
    update(v === "sim");
    if (v !== "sim") clearCookies();
  }
  document.getElementById("cookiesAceitar").addEventListener("click", function () { choose("sim"); });
  document.getElementById("cookiesRecusar").addEventListener("click", function () { choose("nao"); });
  document.querySelectorAll("[data-cookie-prefs]").forEach(function (b) { b.addEventListener("click", function () { banner.classList.add("show"); }); });
})();
