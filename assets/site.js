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
