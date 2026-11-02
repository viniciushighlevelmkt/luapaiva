// Gera as páginas estáticas do site (GitHub Pages). Correr: node _build/build.mjs
// Fonte única: SITE (dados da empresa) + PAGES (conteúdo). O HTML gerado é commitado.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LASTMOD = "2026-11-02";

const SITE = {
  url: "https://luapaivadespachantenautico.com.br",
  name: "Luã Paiva – Despachante Náutico",
  phone: "+5522997778942",
  phoneLabel: "(22) 99777-8942",
  wa: "5522997778942",
  email: "luapaiva022@gmail.com",
  years: "4",
  // Painel HLM: chave pública por site (vale só para luapaiva, só em /api/collect).
  collect: { url: "https://hlm-painel.vercel.app/api/collect", slug: "luapaiva", key: "b4fd1f63ea2d72cfa16f4d6bcf88b5bce018b3c850833c18" },
};

const wa = (msg) => `https://wa.me/${SITE.wa}?text=${encodeURIComponent(msg)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => s.replace(/<[^>]+>/g, "");

const SERVICES = [
  { path: "/transferencia-de-embarcacao/", nav: "Transferência", cat: "Embarcações", title: "Transferência de embarcação" },
  { path: "/inscricao-de-embarcacao/", nav: "Inscrição / TIE", cat: "Embarcações", title: "Inscrição de embarcação e TIE" },
  { path: "/habilitacao-nautica-arrais-amador/", nav: "Arrais-Amador", cat: "Habilitação", title: "Habilitação náutica (CHA)" },
  { path: "/documentacao-jet-ski/", nav: "Jet ski", cat: "Moto aquática", title: "Documentação de jet ski" },
  { path: "/aquaviario/", nav: "Aquaviário", cat: "Profissional", title: "Documentação de aquaviário" },
];
const REGIONS = [
  { path: "/despachante-nautico-rj/", nav: "Rio de Janeiro", title: "Despachante náutico no RJ" },
  { path: "/despachante-nautico-regiao-dos-lagos/", nav: "Região dos Lagos", title: "Região dos Lagos" },
  { path: "/despachante-nautico-online-brasil/", nav: "Todo o Brasil", title: "Atendimento em todo o Brasil" },
];

const ORG_ID = `${SITE.url}/#empresa`;
const org = {
  "@type": "ProfessionalService",
  "@id": ORG_ID,
  name: SITE.name,
  url: `${SITE.url}/`,
  image: `${SITE.url}/assets/og.jpg`,
  logo: `${SITE.url}/assets/favicon.svg`,
  description: `Despachante náutico com mais de ${SITE.years} anos de experiência: transferência e inscrição de embarcações, habilitação náutica (Arrais-Amador, Motonauta, Mestre-Amador), jet ski e aquaviário. Base na Região dos Lagos (RJ), atendimento em todo o Brasil.`,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "$$",
  address: { "@type": "PostalAddress", addressLocality: "Cabo Frio", addressRegion: "RJ", addressCountry: "BR" },
  areaServed: [
    { "@type": "State", name: "Rio de Janeiro" },
    { "@type": "Country", name: "Brasil" },
  ],
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" }],
  knowsAbout: ["Despachante náutico", "NORMAM-211/DPC", "Transferência de embarcação", "Título de Inscrição de Embarcação (TIE)", "Carteira de Habilitação de Amador (CHA)", "Arrais-Amador", "Motonauta", "Jet ski", "Capitania dos Portos"],
};

// ───────────────────────────── layout ─────────────────────────────
function head(p) {
  const url = `${SITE.url}${p.path}`;
  const graph = [org, ...(p.schema || [])];
  if (p.crumbs) graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...p.crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE.url}${c.path}` })),
  });
  if (p.faq?.length) graph.push({
    "@type": "FAQPage",
    mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: strip(a) } })),
  });
  if (p.path === "/") graph.push({ "@type": "WebSite", "@id": `${SITE.url}/#site`, url: `${SITE.url}/`, name: SITE.name, inLanguage: "pt-BR", publisher: { "@id": ORG_ID } });
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <link rel="canonical" href="${url}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#0B1220" />
  <meta name="geo.region" content="BR-RJ" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />

  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="${esc(SITE.name)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(p.ogTitle || p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:image" content="${SITE.url}/assets/og.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />

  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/site.css?v=${LASTMOD}" />
</head>
<body>
  <a class="skip" href="#conteudo">Pular para o conteúdo</a>
`;
}

function nav(isHome) {
  const h = (a) => (isHome ? a : `/${a}`);
  return `
  <nav aria-label="Principal">
    <a href="/" class="nav-logo">Luã <span>Paiva</span></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="${h("#servicos")}">Serviços</a></li>
      <li><a href="/despachante-nautico-rj/">RJ</a></li>
      <li><a href="/despachante-nautico-online-brasil/">Todo o Brasil</a></li>
      <li><a href="${h("#faq")}">Dúvidas</a></li>
      <li><a href="${h("#contato")}">Contato</a></li>
      <li><a href="${wa("Olá, Luã! Vim pelo site e gostaria de uma assessoria náutica.")}" class="nav-cta" target="_blank" rel="noopener" data-cta="nav">WhatsApp</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="Abrir menu" aria-expanded="false" aria-controls="navLinks">
      <span></span><span></span><span></span>
    </button>
  </nav>
`;
}

const WA_SVG = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg width="12" height="12" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function footer() {
  return `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand">
        <p class="footer-title">Luã Paiva</p>
        <p>Despachante náutico há mais de ${SITE.years} anos. Documentação de embarcações, jet ski e habilitação náutica, com base na Região dos Lagos (RJ) e atendimento em todo o Brasil.</p>
      </div>
      <div class="footer-col">
        <p class="footer-h">Serviços</p>
        <ul>
${SERVICES.map((s) => `          <li><a href="${s.path}">${s.title}</a></li>`).join("\n")}
        </ul>
      </div>
      <div class="footer-col">
        <p class="footer-h">Atendimento</p>
        <ul>
${REGIONS.map((s) => `          <li><a href="${s.path}">${s.title}</a></li>`).join("\n")}
          <li><a href="tel:${SITE.phone}">${SITE.phoneLabel}</a></li>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 ${SITE.name}. Todos os direitos reservados. · <a href="/privacidade/" style="color:inherit">Privacidade</a></p>
      <p>Região dos Lagos, RJ · Atendimento em todo o Brasil · ${SITE.phoneLabel}</p>
    </div>
  </footer>

  <a id="wa-float" href="${wa("Olá, Luã! Vim pelo site e gostaria de uma assessoria náutica.")}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" data-cta="float">
    <svg class="wa-icon" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span class="wa-text">Dúvidas? Fale no WhatsApp</span>
  </a>

  <script src="/assets/hlm-track.js" defer></script>
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      if (window.hlmTrack) hlmTrack.init({ legacy: {}, ref: false, collect: ${JSON.stringify(SITE.collect)}, anon: true, visits: true });
    });
  </script>
  <script src="/assets/site.js?v=${LASTMOD}" defer></script>
</body>
</html>
`;
}

function related(exclude) {
  const items = [...SERVICES, ...REGIONS].filter((s) => s.path !== exclude).slice(0, 6);
  return `
        <div class="related">
          <div class="section-label">Veja também</div>
          <div class="related-grid">
${items.map((s) => `            <a href="${s.path}"><span>${s.cat || "Atendimento"}</span>${s.title}</a>`).join("\n")}
          </div>
        </div>`;
}

function faqBlock(faq, heading = "Perguntas frequentes") {
  return `
    <section id="faq">
      <div class="container container-sm">
        <div class="reveal">
          <div class="section-label">Dúvidas</div>
          <h2>${heading}</h2>
          <div class="section-divider"></div>
        </div>
        <div class="faq-list reveal">
${faq.map(([q, a]) => `          <div class="faq-item">
            <button class="faq-question" type="button" aria-expanded="false">
              <span>${q}</span>
              <svg class="faq-arrow" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="faq-answer"><div class="faq-answer-inner">${a}</div></div>
          </div>`).join("\n")}
        </div>
      </div>
    </section>`;
}

function inner(p) {
  return head(p) + nav(false) + `
  <main id="conteudo">
    <header class="page-hero">
      <div class="container">
        <ol class="crumbs" aria-label="Você está em">
          <li><a href="/">Início</a></li>
${p.crumbs.map((c, i) => (i === p.crumbs.length - 1 ? `          <li aria-current="page">${c.name}</li>` : `          <li><a href="${c.path}">${c.name}</a></li>`)).join("\n")}
        </ol>
        <p class="hero-eyebrow">${p.eyebrow}</p>
        <h1>${p.h1}</h1>
        <p class="hero-sub">${p.lead}</p>
        <div class="hero-actions">
          <a href="${wa(p.waMsg)}" class="btn-primary" target="_blank" rel="noopener" data-cta="hero">${WA_SVG} Falar no WhatsApp</a>
          <a href="tel:${SITE.phone}" class="btn-secondary" data-cta="hero">Ligar ${SITE.phoneLabel}</a>
        </div>
      </div>
    </header>

    <section>
      <div class="container">
        <article class="prose">
${p.body}
          <div class="cta-box reveal">
            <h2>${p.ctaTitle || "Fale com o Luã e resolva sem sair de casa"}</h2>
            <p>Mande uma mensagem com o seu caso (tipo de embarcação, cidade e o que precisa). A resposta vem com a lista de documentos e os próximos passos.</p>
            <div class="hero-actions">
              <a href="${wa(p.waMsg)}" class="btn-primary" target="_blank" rel="noopener" data-cta="cta">${WA_SVG} Enviar mensagem no WhatsApp</a>
              <a href="/#contato" class="btn-secondary">Outras formas de contato ${ARROW}</a>
            </div>
          </div>
${related(p.path)}
        </article>
      </div>
    </section>
${p.faq?.length ? faqBlock(p.faq) : ""}
  </main>
` + footer();
}

// ───────────────────────────── home ─────────────────────────────
const HOME_FAQ = [
  ["O que faz um despachante náutico?", "O despachante náutico cuida da papelada da sua embarcação e da sua habilitação junto à Marinha do Brasil (Capitanias, Delegacias e Agências): confere os documentos, preenche os requerimentos, agenda o atendimento, protocola e acompanha até a entrega do TIE ou da CHA. Você evita idas e voltas e processos devolvidos por erro."],
  ["Vocês atendem fora do Rio de Janeiro?", "Sim. A base é a Região dos Lagos (RJ), mas o atendimento é para todo o Brasil. A maior parte dos processos é feita à distância: você envia os documentos pelo WhatsApp ou e-mail e recebe orientação em cada etapa. Quando o órgão exige presença ou documento original, você recebe o passo a passo exato para a Capitania mais próxima de você. <a href=\"/despachante-nautico-online-brasil/\">Ver como funciona o atendimento a distância</a>."],
  ["Quanto tempo leva para transferir ou inscrever uma embarcação?", "Depende da Capitania e de a documentação estar completa. Com tudo certo desde o início, o processo anda mais rápido; os atrasos vêm quase sempre de documentos faltando ou com dados errados. Depois do diagnóstico do seu caso, você recebe uma estimativa realista."],
  ["Quais documentos preciso para transferir uma embarcação?", "Em geral: documento de identidade e CPF de comprador e vendedor, comprovante de residência, o TIE original, o documento de compra e venda com firma reconhecida e o comprovante de pagamento das taxas. A lista muda conforme o tamanho da embarcação e a situação do registro. <a href=\"/transferencia-de-embarcacao/\">Ver a lista completa da transferência</a>."],
  ["Como tirar a habilitação de Arrais-Amador ou Motonauta?", "É preciso fazer o treinamento numa escola náutica credenciada (que emite o atestado), ser aprovado na prova da Marinha e entregar a documentação na Capitania. O despachante orienta a categoria certa e cuida da parte documental. <a href=\"/habilitacao-nautica-arrais-amador/\">Ver como funciona a habilitação</a>."],
  ["Quanto custa o serviço?", "O valor depende do serviço e da situação dos documentos. Envie uma mensagem com o seu caso pelo WhatsApp e receba o orçamento antes de começar, sem compromisso."],
];

function home() {
  const p = {
    path: "/",
    title: "Despachante Náutico no RJ e em todo o Brasil | Luã Paiva",
    ogTitle: "Luã Paiva – Despachante Náutico | RJ e todo o Brasil",
    description: `Despachante náutico há mais de ${SITE.years} anos: transferência e inscrição de embarcação, TIE, habilitação Arrais-Amador e Motonauta, jet ski. Base na Região dos Lagos (RJ), atendimento em todo o Brasil.`,
    faq: HOME_FAQ,
  };
  return head(p) + nav(true) + `
  <main id="conteudo">
    <section id="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <p class="hero-eyebrow">Rio de Janeiro · Atendimento em todo o Brasil</p>
        <h1>Despachante Náutico no <em>RJ</em> e em todo o Brasil</h1>
        <p class="hero-sub">Transferência e inscrição de embarcações, TIE, habilitação náutica e jet ski. Mais de ${SITE.years} anos resolvendo documentação junto à Marinha, com acompanhamento do início ao fim.</p>
        <div class="hero-actions">
          <a href="${wa("Olá, Luã! Vim pelo site e gostaria de uma assessoria náutica.")}" class="btn-primary" target="_blank" rel="noopener" data-cta="hero">${WA_SVG} Falar no WhatsApp</a>
          <a href="#contato" class="btn-secondary">Pedir orçamento ${ARROW}</a>
        </div>
        <div class="hero-stats">
          <div><strong>+${SITE.years} anos</strong><span>de experiência</span></div>
          <div><strong>27 estados</strong><span>atendimento a distância</span></div>
          <div><strong>1 contato</strong><span>do início ao protocolo</span></div>
        </div>
      </div>
    </section>

    <section id="sobre">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Por que contratar</div>
          <h2>Documentação náutica sem idas e voltas à Capitania</h2>
          <div class="section-divider"></div>
        </div>
        <div class="value-grid reveal">
          <div class="value-item">
            <svg class="value-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="17" stroke="#C8B079" stroke-width="0.8"/><path d="M10 18h16M18 10l8 8-8 8" stroke="#C8B079" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <h3>Mais de ${SITE.years} anos de experiência</h3>
            <p>Conhecimento prático das exigências da NORMAM-211 e da rotina das Capitanias. Os documentos vão certos na primeira vez.</p>
          </div>
          <div class="value-item">
            <svg class="value-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="17" stroke="#C8B079" stroke-width="0.8"/><path d="M12 18c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#C8B079" stroke-width="0.8" stroke-linecap="round"/><circle cx="18" cy="18" r="2" fill="#C8B079"/></svg>
            <h3>Acompanhamento do início ao fim</h3>
            <p>Do diagnóstico ao documento pronto. Você sabe em que etapa está o seu processo, sem precisar ligar para ninguém.</p>
          </div>
          <div class="value-item">
            <svg class="value-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true"><circle cx="18" cy="18" r="17" stroke="#C8B079" stroke-width="0.8"/><path d="M9 26s1-4 9-4 9 4 9 4" stroke="#C8B079" stroke-width="0.8" stroke-linecap="round"/><circle cx="18" cy="16" r="4" stroke="#C8B079" stroke-width="0.8"/></svg>
            <h3>RJ presencial, Brasil a distância</h3>
            <p>Presencial na Região dos Lagos e no Rio de Janeiro. Para os outros estados, tudo pelo WhatsApp e e-mail.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="servicos">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Serviços</div>
          <h2>Serviços de despachante náutico</h2>
          <div class="section-divider"></div>
          <p style="font-size:0.9rem;color:var(--text-muted);max-width:560px;line-height:1.8;font-weight:300;">Lanchas, veleiros, barcos de pesca, jet skis e profissionais aquaviários. Processos junto às Capitanias, Delegacias e Agências da Marinha do Brasil.</p>
        </div>
        <div class="services-grid reveal">
          <div class="service-card">
            <div class="service-cat">Embarcações</div>
            <h3>Transferência de embarcação</h3>
            <p>Comprou ou vendeu um barco ou lancha? Passamos o TIE para o nome do novo dono dentro do prazo, sem multa.</p>
            <ul class="service-list"><li>Transferência de propriedade</li><li>Mudança de jurisdição</li><li>Embarcações até e acima de 12 m</li></ul>
            <a class="service-more" href="/transferencia-de-embarcacao/">Saiba mais ${ARROW}</a>
          </div>
          <div class="service-card">
            <div class="service-cat">Embarcações</div>
            <h3>Inscrição e TIE</h3>
            <p>Primeira inscrição de embarcação nova ou usada sem registro, renovação, 2ª via e alteração de dados do TIE.</p>
            <ul class="service-list"><li>Inscrição de embarcação</li><li>Renovação e 2ª via do TIE</li><li>Alteração de dados e motor</li></ul>
            <a class="service-more" href="/inscricao-de-embarcacao/">Saiba mais ${ARROW}</a>
          </div>
          <div class="service-card">
            <div class="service-cat">Habilitação</div>
            <h3>Habilitação náutica (CHA)</h3>
            <p>Arrais-Amador, Motonauta, Mestre-Amador e Veleiro: orientação da categoria, inscrição na prova e emissão da carteira.</p>
            <ul class="service-list"><li>Arrais-Amador e Motonauta</li><li>Renovação e 2ª via da CHA</li><li>Agregação de categoria</li></ul>
            <a class="service-more" href="/habilitacao-nautica-arrais-amador/">Saiba mais ${ARROW}</a>
          </div>
          <div class="service-card">
            <div class="service-cat">Moto aquática</div>
            <h3>Documentação de jet ski</h3>
            <p>Inscrição, transferência e regularização de jet ski, mais a habilitação de Motonauta para quem vai pilotar.</p>
            <ul class="service-list"><li>Inscrição de jet ski</li><li>Transferência de jet ski</li><li>Jet ski sem documento</li></ul>
            <a class="service-more" href="/documentacao-jet-ski/">Saiba mais ${ARROW}</a>
          </div>
          <div class="service-card">
            <div class="service-cat">Profissional</div>
            <h3>Aquaviário</h3>
            <p>Apoio documental para profissionais aquaviários: inscrição, renovação e atualização de documentos junto à Marinha.</p>
            <ul class="service-list"><li>Caderneta (CIR)</li><li>Renovações e 2ª via</li><li>Orientação de carreira</li></ul>
            <a class="service-more" href="/aquaviario/">Saiba mais ${ARROW}</a>
          </div>
          <div class="service-card">
            <div class="service-cat">Regularização</div>
            <h3>Embarcação irregular</h3>
            <p>Barco comprado sem transferência, TIE vencido, dono anterior sumido ou dados errados: analisamos e indicamos o caminho.</p>
            <ul class="service-list"><li>Diagnóstico do caso</li><li>Pendências e multas</li><li>Plano de regularização</li></ul>
            <a class="service-more" href="${wa("Olá, Luã! Preciso regularizar uma embarcação com pendência.")}" target="_blank" rel="noopener" data-cta="servicos">Falar sobre o meu caso ${ARROW}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="como-funciona">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Como funciona</div>
          <h2>Três passos, de qualquer lugar do Brasil</h2>
          <div class="section-divider"></div>
        </div>
        <div class="steps-grid reveal">
          <div class="step"><div class="step-num">01</div><h3>Diagnóstico do caso</h3><p>Você conta o que precisa pelo WhatsApp. Analisamos os documentos que já tem, as pendências e o caminho mais rápido. Orçamento antes de começar.</p></div>
          <div class="step"><div class="step-num">02</div><h3>Documentação certa</h3><p>Lista exata do que falta, modelos preenchidos e conferência de cada documento antes de ir para a Marinha. Nada de processo devolvido.</p></div>
          <div class="step"><div class="step-num">03</div><h3>Protocolo e acompanhamento</h3><p>Agendamento, protocolo e acompanhamento na Capitania até o TIE ou a CHA ficarem prontos. Você é avisado em cada etapa.</p></div>
        </div>
      </div>
    </section>

    <section id="depoimentos">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Clientes</div>
          <h2>Experiências de quem confiou</h2>
          <div class="section-divider"></div>
        </div>
        <div class="testimonials-grid reveal">
          <div class="testimonial">
            <p>O processo de transferência da minha lancha, que eu imaginava ser algo complicado, foi resolvido com agilidade e total transparência. Fui orientado em cada passo.</p>
            <div class="testimonial-author"><div class="author-avatar">R.M</div><div><div class="author-name">R. Mendes</div><div class="author-role">Proprietário · Cabo Frio, RJ</div></div></div>
          </div>
          <div class="testimonial">
            <p>Precisava regularizar minha habilitação náutica e não sabia por onde começar. Atendimento claro, direto e sem enrolação. Processo concluído sem complicações.</p>
            <div class="testimonial-author"><div class="author-avatar">A.C</div><div><div class="author-name">A. Costa</div><div class="author-role">Navegador amador · São Paulo, SP</div></div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="atendimento">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Onde atendemos</div>
          <h2>Rio de Janeiro e atendimento em todo o Brasil</h2>
          <div class="section-divider"></div>
        </div>
        <div class="region-grid reveal">
          <div class="region-left">
            <p style="font-size:0.9rem;color:var(--text-muted);line-height:1.8;font-weight:300;margin-bottom:1.5rem;">Atendimento presencial e prioritário na Região dos Lagos e no Rio de Janeiro, com conhecimento da rotina da Capitania dos Portos do RJ e da Delegacia de Cabo Frio.</p>
            <div class="region-cities">
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">Cabo Frio</a>
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">Arraial do Cabo</a>
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">Búzios</a>
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">São Pedro da Aldeia</a>
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">Araruama</a>
              <a class="city-tag" href="/despachante-nautico-regiao-dos-lagos/">Saquarema</a>
              <a class="city-tag" href="/despachante-nautico-rj/">Rio de Janeiro</a>
              <a class="city-tag" href="/despachante-nautico-rj/">Niterói</a>
              <a class="city-tag" href="/despachante-nautico-rj/">Angra dos Reis</a>
              <a class="city-tag" href="/despachante-nautico-rj/">Paraty</a>
              <a class="city-tag" href="/despachante-nautico-rj/">Macaé</a>
            </div>
          </div>
          <div class="region-right">
            <p><strong>Atendimento em todo o Brasil</strong> para transferência e inscrição de embarcações, jet ski e habilitação náutica. A maior parte do processo é feita a distância, com envio digital dos documentos e contato direto pelo WhatsApp.</p>
            <p>Atendemos proprietários em São Paulo, Santa Catarina, Bahia, Minas Gerais, Espírito Santo, Paraná e demais estados, e quem comprou embarcação em outro estado e precisa transferir.</p>
            <a href="/despachante-nautico-online-brasil/" class="btn-secondary" style="margin-top:1rem;display:inline-flex;">Como funciona a distância ${ARROW}</a>
          </div>
        </div>
      </div>
    </section>
${faqBlock(HOME_FAQ, "Dúvidas comuns")}

    <section id="contato">
      <div class="container">
        <div class="reveal">
          <div class="section-label">Contato</div>
          <h2>Peça o seu orçamento</h2>
          <div class="section-divider"></div>
        </div>
        <div class="contact-grid reveal">
          <div class="contact-info">
            <div class="contact-item"><p class="contact-h">WhatsApp</p><a href="${wa("Olá, Luã! Vim pelo site e gostaria de uma assessoria náutica.")}" target="_blank" rel="noopener" data-cta="contato">${SITE.phoneLabel}</a></div>
            <div class="contact-item"><p class="contact-h">Telefone</p><a href="tel:${SITE.phone}" data-cta="contato">${SITE.phoneLabel}</a></div>
            <div class="contact-item"><p class="contact-h">E-mail</p><a href="mailto:${SITE.email}" data-cta="contato">${SITE.email}</a> <button class="copy-btn" type="button" id="copyEmail">Copiar</button></div>
            <div class="contact-item"><p class="contact-h">Base</p><p>Região dos Lagos, RJ<br>Atendimento em todo o Brasil</p></div>
            <div class="contact-item"><p class="contact-h">Horário</p><p>Segunda a sexta, 08h às 18h<br>Sábados mediante agendamento</p></div>
          </div>
          <div>
            <form id="contactForm" novalidate>
              <div class="form-row">
                <div class="form-group"><label for="name">Nome</label><input type="text" id="name" name="name" autocomplete="name" placeholder="Seu nome" required /></div>
                <div class="form-group"><label for="city">Cidade / estado</label><input type="text" id="city" name="city" autocomplete="address-level2" placeholder="Ex.: Florianópolis, SC" /></div>
              </div>
              <div class="form-group">
                <label for="subject">Assunto</label>
                <select id="subject" name="subject">
                  <option value="">Selecione o assunto</option>
                  <option>Transferência de embarcação</option>
                  <option>Inscrição de embarcação / TIE</option>
                  <option>Documentação de jet ski</option>
                  <option>Habilitação náutica (Arrais / Motonauta)</option>
                  <option>Renovação ou 2ª via (TIE / CHA)</option>
                  <option>Aquaviário</option>
                  <option>Outro</option>
                </select>
              </div>
              <div class="form-group"><label for="message">Mensagem</label><textarea id="message" name="message" placeholder="Ex.: comprei uma lancha de 24 pés em outro estado e preciso transferir."></textarea></div>
              <button type="submit" class="btn-primary" style="width:100%;justify-content:center;">${WA_SVG} Enviar pelo WhatsApp</button>
              <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.75rem;font-weight:300;">Ao enviar, o WhatsApp abre com a sua mensagem pronta. Nada fica guardado no site.</p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section id="cta-final">
      <div class="container" style="text-align:center;">
        <div class="reveal">
          <div class="section-label" style="justify-content:center;">Assessoria náutica</div>
          <h2>Regularize a sua embarcação com quem entende.</h2>
          <p>Envie a sua dúvida e receba orientação objetiva, de qualquer lugar do Brasil.</p>
          <a href="${wa("Olá, Luã! Vim pelo site e gostaria de uma assessoria náutica.")}" class="btn-primary" target="_blank" rel="noopener" data-cta="cta">${WA_SVG} Falar no WhatsApp</a>
        </div>
      </div>
    </section>
  </main>
` + footer();
}

// ───────────────────────────── páginas interiores ─────────────────────────────
const svc = (path, name) => [{ name: "Serviços", path: "/#servicos" }, { name, path }];
const serviceSchema = (path, name, desc) => ({
  "@type": "Service",
  name,
  description: desc,
  serviceType: name,
  url: `${SITE.url}${path}`,
  provider: { "@id": ORG_ID },
  areaServed: [{ "@type": "State", name: "Rio de Janeiro" }, { "@type": "Country", name: "Brasil" }],
});

const PAGES = [
  {
    path: "/transferencia-de-embarcacao/",
    title: "Transferência de Embarcação: documentos e prazo | Despachante Náutico",
    description: "Transferência de embarcação (lancha, barco, veleiro) para o nome do novo dono na Capitania, dentro do prazo e sem multa. Despachante náutico no RJ, atendimento em todo o Brasil.",
    crumbs: svc("/transferencia-de-embarcacao/", "Transferência de embarcação"),
    eyebrow: "Embarcações · RJ e todo o Brasil",
    h1: "Transferência de embarcação sem dor de cabeça",
    lead: "Comprou ou vendeu uma lancha, barco ou veleiro? A transferência do TIE para o novo proprietário tem prazo na Marinha. Cuidamos da documentação e do protocolo na Capitania, no RJ ou no seu estado.",
    waMsg: "Olá, Luã! Preciso fazer a transferência de uma embarcação.",
    body: `
          <h2>Quando a transferência é obrigatória</h2>
          <p>Sempre que uma embarcação inscrita muda de dono, o novo proprietário precisa pedir a transferência na Capitania, Delegacia ou Agência da Marinha. Pela <strong>NORMAM-211/DPC</strong>, para embarcações até 12 metros o prazo é de <strong>60 dias</strong> contados da autenticação das assinaturas do documento de compra e venda; fora do prazo, há multa.</p>
          <p>Enquanto a transferência não é feita, o barco continua no nome do vendedor: multas, abordagens e qualquer problema continuam ligados a ele, e o comprador fica sem o documento em seu nome.</p>

          <h2>Documentos normalmente pedidos</h2>
          <ul>
            <li>Documento de identidade e CPF do comprador (e do vendedor, conforme o caso);</li>
            <li>Comprovante de residência do novo proprietário;</li>
            <li><strong>TIE original</strong> (Título de Inscrição de Embarcação) ou o documento que o substitua;</li>
            <li>Documento de compra e venda com firma reconhecida das partes;</li>
            <li>Comprovante de pagamento das taxas (GRU) da Marinha;</li>
            <li>Para embarcações maiores que 12 m, documentos adicionais (como o termo de responsabilidade).</li>
          </ul>
          <div class="note"><p>A lista exata muda conforme o tamanho da embarcação, a Capitania e a situação do registro. No diagnóstico, você recebe a lista certa para o seu caso, antes de gastar com cartório.</p></div>

          <h2>Comprou um barco em outro estado?</h2>
          <p>É muito comum: a embarcação está inscrita numa Capitania e o novo dono mora em outro estado. Nesses casos pode ser preciso, além da transferência de propriedade, a <strong>transferência de jurisdição</strong> para a Capitania da sua região. Organizamos as duas etapas para você não ter de viajar.</p>

          <h2>Como trabalhamos</h2>
          <ol>
            <li><strong>Diagnóstico:</strong> você manda foto do TIE e do documento de compra. Conferimos dados, pendências e prazo.</li>
            <li><strong>Documentação:</strong> enviamos o modelo de compra e venda e a lista do que falta. Conferimos tudo antes de protocolar.</li>
            <li><strong>Protocolo e acompanhamento:</strong> agendamento e entrada na Marinha, com acompanhamento até o TIE novo ficar pronto.</li>
          </ol>

          <h2>Problemas que resolvemos com frequência</h2>
          <ul>
            <li>Barco comprado há anos e nunca transferido;</li>
            <li>Vendedor que não encontra o TIE ou que já não está acessível;</li>
            <li>Dados do casco ou do motor diferentes do documento;</li>
            <li>Transferência de jet ski (veja <a href="/documentacao-jet-ski/">documentação de jet ski</a>).</li>
          </ul>`,
    faq: [
      ["Qual o prazo para transferir uma embarcação?", "Para embarcações até 12 metros, a NORMAM-211 prevê 60 dias contados da autenticação das assinaturas do documento de compra e venda. Para embarcações maiores, as regras e os documentos mudam. Confirmamos o prazo do seu caso no diagnóstico."],
      ["Posso transferir uma embarcação que está em outro estado?", "Sim. Fazemos a transferência a distância e, se for o caso, também a transferência de jurisdição para a Capitania da sua região."],
      ["Perdi o TIE. Ainda dá para transferir?", "Dá, mas normalmente é preciso resolver primeiro a 2ª via ou apresentar a documentação que a Capitania aceita no lugar. Analisamos a situação e indicamos o caminho."],
      ["A transferência é feita na Capitania dos Portos?", "Sim, na Capitania, Delegacia ou Agência da Marinha que tem jurisdição sobre a embarcação. No RJ, por exemplo, na Capitania dos Portos do Rio de Janeiro ou na Delegacia de Cabo Frio, entre outras."],
    ],
    schema: [serviceSchema("/transferencia-de-embarcacao/", "Transferência de embarcação", "Transferência de propriedade e de jurisdição de embarcações de esporte e recreio junto à Marinha do Brasil.")],
  },
  {
    path: "/inscricao-de-embarcacao/",
    title: "Inscrição de Embarcação e TIE: renovação e 2ª via | Despachante Náutico",
    description: "Inscrição de embarcação na Capitania, emissão, renovação e 2ª via do TIE, alteração de dados e de motor. Despachante náutico no RJ com atendimento em todo o Brasil.",
    crumbs: svc("/inscricao-de-embarcacao/", "Inscrição de embarcação e TIE"),
    eyebrow: "Embarcações · TIE",
    h1: "Inscrição de embarcação e TIE",
    lead: "Barco novo, embarcação usada nunca inscrita, TIE vencido ou perdido: cuidamos da inscrição na Marinha e da emissão, renovação ou 2ª via do Título de Inscrição de Embarcação.",
    waMsg: "Olá, Luã! Preciso de ajuda com inscrição / TIE de embarcação.",
    body: `
          <h2>O que é o TIE</h2>
          <p>O <strong>TIE (Título de Inscrição de Embarcação)</strong> é o documento da embarcação emitido pela Marinha do Brasil, através da Capitania, Delegacia ou Agência. Ele identifica o barco e o proprietário e deve estar a bordo. Embarcações de esporte e recreio seguem as regras da <strong>NORMAM-211/DPC</strong>; jet skis têm documento próprio (veja <a href="/documentacao-jet-ski/">jet ski</a>).</p>

          <h2>Quando é preciso inscrever</h2>
          <ul>
            <li><strong>Embarcação nova</strong>, comprada em estaleiro ou revenda;</li>
            <li><strong>Embarcação usada nunca inscrita</strong> ou construída de forma artesanal;</li>
            <li>Embarcação importada;</li>
            <li>Embarcação que perdeu a inscrição e precisa ser regularizada.</li>
          </ul>
          <p>A Marinha prevê prazo para a inscrição depois da aquisição (60 dias para a maioria das embarcações de recreio menores que 24 m). Navegar sem inscrição gera multa e pode levar à apreensão.</p>

          <h2>Serviços do TIE</h2>
          <h3>Renovação do TIE</h3>
          <p>O TIE tem validade e a renovação deve ser pedida antes do vencimento (a NORMAM-211 fala em até 30 dias antes). Avisamos o que é preciso e fazemos o pedido.</p>
          <h3>2ª via</h3>
          <p>TIE perdido, roubado ou danificado: organizamos o pedido de 2ª via com a documentação certa.</p>
          <h3>Alteração de dados</h3>
          <p>Troca de motor, mudança de nome da embarcação, mudança de endereço do proprietário ou correção de dados: tudo precisa ser atualizado no TIE.</p>

          <h2>Documentos normalmente pedidos na inscrição</h2>
          <ul>
            <li>Documento de identidade, CPF e comprovante de residência do proprietário;</li>
            <li>Nota fiscal ou documento de aquisição da embarcação e do motor;</li>
            <li>Dados técnicos (comprimento, material do casco, propulsão) e fotos, conforme o caso;</li>
            <li>Comprovante de pagamento das taxas (GRU).</li>
          </ul>
          <div class="note"><p>Os documentos variam conforme o porte da embarcação e a Capitania. Você recebe a lista certa no diagnóstico.</p></div>`,
    faq: [
      ["Comprei um barco sem documento. Consigo inscrever?", "Na maioria dos casos, sim. Precisamos entender a origem da embarcação (nota fiscal, recibo, construção própria) para montar a documentação que a Capitania aceita."],
      ["De quanto em quanto tempo renova o TIE?", "Depende do tipo de embarcação e do documento emitido. Confira a data no seu TIE ou mande uma foto pelo WhatsApp: verificamos e avisamos o prazo."],
      ["Troquei o motor. Preciso atualizar o TIE?", "Sim. A alteração de motor e de outros dados técnicos deve ser comunicada à Marinha para o TIE ficar correto."],
    ],
    schema: [serviceSchema("/inscricao-de-embarcacao/", "Inscrição de embarcação e TIE", "Inscrição de embarcações, emissão, renovação, 2ª via e alteração de dados do Título de Inscrição de Embarcação (TIE).")],
  },
  {
    path: "/habilitacao-nautica-arrais-amador/",
    title: "Habilitação Náutica: Arrais-Amador e Motonauta (CHA) | Despachante",
    description: "Como tirar a habilitação náutica (CHA): Arrais-Amador, Motonauta, Mestre-Amador. Renovação, 2ª via e agregação de categoria. Despachante náutico no RJ e em todo o Brasil.",
    crumbs: svc("/habilitacao-nautica-arrais-amador/", "Habilitação náutica"),
    eyebrow: "Habilitação · CHA",
    h1: "Habilitação náutica: Arrais-Amador, Motonauta e mais",
    lead: "Quer pilotar lancha ou jet ski? Orientamos a categoria certa da Carteira de Habilitação de Amador (CHA), a escola, a prova e cuidamos de toda a parte documental: emissão, renovação, 2ª via e agregação.",
    waMsg: "Olá, Luã! Quero tirar / renovar a habilitação náutica.",
    body: `
          <h2>Categorias da habilitação de amador</h2>
          <ul>
            <li><strong>Motonauta:</strong> para conduzir moto aquática (jet ski) nos limites da navegação interior;</li>
            <li><strong>Arrais-Amador:</strong> para conduzir embarcações de esporte e recreio na navegação interior (exceto moto aquática);</li>
            <li><strong>Mestre-Amador:</strong> navegação costeira, dentro dos limites previstos na norma;</li>
            <li><strong>Capitão-Amador:</strong> navegação oceânica;</li>
            <li><strong>Veleiro:</strong> para embarcações a vela sem propulsão a motor.</li>
          </ul>
          <p>Quem vai pilotar lancha <strong>e</strong> jet ski precisa das duas categorias (Arrais-Amador e Motonauta). Dá para fazer as duas e tirar uma carteira só.</p>

          <h2>Como tirar a CHA (Arrais-Amador ou Motonauta)</h2>
          <ol>
            <li><strong>Treinamento</strong> numa escola náutica (Estabelecimento de Treinamento Náutico) credenciada, que emite o atestado com as horas práticas e teóricas;</li>
            <li><strong>Agendamento e prova</strong> escrita na Capitania, Delegacia ou Agência da Marinha;</li>
            <li><strong>Documentação:</strong> identidade, CPF, comprovante de residência, atestado médico, atestado do treinamento e taxa (GRU);</li>
            <li><strong>Emissão</strong> da carteira após a aprovação.</li>
          </ol>
          <div class="note"><p>As regras (NORMAM-211/DPC e normas da sua Capitania), as datas de prova e as taxas mudam de região para região. Confirmamos tudo para a sua cidade antes de você começar.</p></div>

          <h2>Renovação, 2ª via e agregação</h2>
          <p>A CHA tem validade. Fazemos a <strong>renovação</strong>, a <strong>2ª via</strong> em caso de perda ou roubo e a <strong>agregação de categoria</strong> (por exemplo, quem já é Arrais e quer acrescentar Motonauta).</p>

          <h2>Por que usar um despachante na habilitação</h2>
          <p>A parte difícil não é a prova: é acertar documentos, atestados, taxas e agendamentos. Com tudo conferido antes, o processo não volta e a carteira sai mais rápido.</p>`,
    faq: [
      ["Qual a diferença entre Arrais-Amador e Motonauta?", "O Arrais-Amador habilita a conduzir embarcações de esporte e recreio (lanchas, barcos) na navegação interior; o Motonauta habilita a conduzir moto aquática (jet ski). Para pilotar os dois, é preciso ter as duas categorias."],
      ["Preciso fazer curso para tirar Arrais-Amador?", "Sim. O candidato faz o treinamento numa escola náutica credenciada pela Marinha, que emite o atestado exigido para a inscrição na prova."],
      ["Minha habilitação venceu. O que faço?", "Mande uma foto da carteira pelo WhatsApp. Verificamos a situação e fazemos a renovação com a documentação certa."],
      ["Posso tirar a habilitação náutica em outro estado?", "Sim. A prova é feita na Capitania, Delegacia ou Agência da sua região; orientamos a escola e a documentação a distância."],
    ],
    schema: [serviceSchema("/habilitacao-nautica-arrais-amador/", "Habilitação náutica (CHA)", "Orientação e documentação para Carteira de Habilitação de Amador: Arrais-Amador, Motonauta, Mestre-Amador, renovação, 2ª via e agregação.")],
  },
  {
    path: "/documentacao-jet-ski/",
    title: "Documentação de Jet Ski: inscrição e transferência | Despachante Náutico",
    description: "Inscrição, transferência e regularização de jet ski (moto aquática) na Marinha, mais habilitação de Motonauta. Despachante náutico no RJ com atendimento em todo o Brasil.",
    crumbs: svc("/documentacao-jet-ski/", "Documentação de jet ski"),
    eyebrow: "Moto aquática · Jet ski",
    h1: "Documentação de jet ski: inscrição, transferência e Motonauta",
    lead: "Jet ski também precisa estar inscrito na Marinha e o piloto precisa de habilitação de Motonauta. Resolvemos a documentação de quem comprou, vendeu ou tem um jet ski irregular.",
    waMsg: "Olá, Luã! Preciso de ajuda com a documentação de um jet ski.",
    body: `
          <h2>Jet ski precisa de documento?</h2>
          <p>Sim. Jet ski é uma <strong>moto aquática</strong> e, como qualquer embarcação, tem de estar inscrito na Marinha do Brasil e com o documento em nome do proprietário. Quem pilota precisa da habilitação de <strong>Motonauta</strong>. Navegar sem documento ou sem habilitação gera multa e pode levar à apreensão do jet ski.</p>

          <h2>Serviços para jet ski</h2>
          <h3>Inscrição de jet ski</h3>
          <p>Jet ski novo ou usado que nunca foi inscrito: montamos a documentação (nota fiscal, dados do casco e do motor) e fazemos o pedido.</p>
          <h3>Transferência de jet ski</h3>
          <p>Comprou um jet ski usado? A transferência para o seu nome tem prazo. Conferimos o documento do vendedor e fazemos a transferência, mesmo que o jet ski esteja inscrito em outro estado. Veja também a <a href="/transferencia-de-embarcacao/">transferência de embarcação</a>.</p>
          <h3>Jet ski sem documento ou com pendência</h3>
          <p>Jet ski comprado só com recibo, documento vencido, dono anterior que não aparece: analisamos o caso e indicamos o caminho para regularizar.</p>
          <h3>Habilitação de Motonauta</h3>
          <p>Orientação da escola, da prova e da documentação para tirar ou agregar a categoria Motonauta. Detalhes na página de <a href="/habilitacao-nautica-arrais-amador/">habilitação náutica</a>.</p>

          <h2>Antes de comprar um jet ski usado</h2>
          <ul>
            <li>Peça foto do documento e confira se o nome do vendedor é o mesmo do documento;</li>
            <li>Confira o número do casco e do motor com o que está no documento;</li>
            <li>Pergunte se há multas ou pendências na Capitania;</li>
            <li>Mande tudo pelo WhatsApp antes de pagar: verificamos para você.</li>
          </ul>`,
    faq: [
      ["Precisa de habilitação para pilotar jet ski?", "Sim. Para conduzir moto aquática é preciso a habilitação de Motonauta (categoria da Carteira de Habilitação de Amador)."],
      ["Comprei um jet ski só com recibo. Consigo regularizar?", "Muitas vezes, sim. Depende da origem e dos dados do jet ski. Mande as fotos e o recibo pelo WhatsApp para analisarmos."],
      ["Arrais-Amador pode pilotar jet ski?", "Não. O Arrais-Amador não abrange moto aquática; é preciso também a categoria Motonauta."],
    ],
    schema: [serviceSchema("/documentacao-jet-ski/", "Documentação de jet ski", "Inscrição, transferência e regularização de motos aquáticas (jet ski) e habilitação de Motonauta.")],
  },
  {
    path: "/aquaviario/",
    title: "Despachante para Aquaviário: documentos na Marinha | Luã Paiva",
    description: "Apoio documental para aquaviários: caderneta (CIR), renovações, 2ª via e atualização de documentos junto à Marinha do Brasil. Despachante náutico no RJ e em todo o Brasil.",
    crumbs: svc("/aquaviario/", "Aquaviário"),
    eyebrow: "Profissional · Aquaviário",
    h1: "Documentação para aquaviários",
    lead: "Para quem trabalha embarcado: organizamos a documentação do aquaviário junto à Marinha do Brasil, com orientação clara sobre o que pedir, onde e em que ordem.",
    waMsg: "Olá, Luã! Sou aquaviário e preciso de ajuda com documentação.",
    body: `
          <h2>Para quem é</h2>
          <p>Profissionais que atuam a bordo ou estão começando na carreira marítima ou fluvial (pescadores profissionais, marinheiros, condutores e demais categorias de aquaviário) e precisam de documentos emitidos ou atualizados pela Marinha.</p>

          <h2>Em que podemos ajudar</h2>
          <ul>
            <li><strong>Caderneta de Inscrição e Registro (CIR):</strong> orientação para emissão, 2ª via e atualização;</li>
            <li>Renovação e atualização de certificados e documentos;</li>
            <li>Conferência de documentos antes do agendamento na Capitania;</li>
            <li>Orientação sobre cursos e requisitos para mudar de categoria.</li>
          </ul>
          <div class="note"><p>Os requisitos de cada categoria de aquaviário são definidos pelas normas da Marinha e mudam conforme a função. No primeiro contato, explicamos o caminho certo para o seu caso.</p></div>`,
    faq: [
      ["Atendem aquaviários de fora do RJ?", "Sim. A orientação e a conferência dos documentos são feitas a distância; o atendimento presencial, quando exigido, é na Capitania da sua região."],
    ],
    schema: [serviceSchema("/aquaviario/", "Documentação de aquaviário", "Apoio documental a profissionais aquaviários junto à Marinha do Brasil.")],
  },
  {
    path: "/despachante-nautico-rj/",
    title: "Despachante Náutico RJ: Rio, Niterói, Angra e Lagos | Luã Paiva",
    description: "Despachante náutico no Rio de Janeiro: transferência e inscrição de embarcação, TIE, jet ski e habilitação Arrais-Amador. Rio, Niterói, Angra dos Reis, Paraty, Macaé e Região dos Lagos.",
    crumbs: [{ name: "Despachante náutico no RJ", path: "/despachante-nautico-rj/" }],
    eyebrow: "Rio de Janeiro",
    h1: "Despachante náutico no Rio de Janeiro",
    lead: `Mais de ${SITE.years} anos resolvendo documentação náutica no estado do Rio de Janeiro. Transferência, inscrição, TIE, jet ski e habilitação, com atendimento presencial na Região dos Lagos e no Rio.`,
    waMsg: "Olá, Luã! Estou no RJ e preciso de um despachante náutico.",
    body: `
          <h2>Onde atendemos no estado do RJ</h2>
          <ul class="states">
            <li>Rio de Janeiro (capital)</li><li>Niterói</li><li>Angra dos Reis</li><li>Paraty</li><li>Mangaratiba</li><li>Itaguaí</li><li>Maricá</li><li>Saquarema</li><li>Araruama</li><li>Iguaba Grande</li><li>São Pedro da Aldeia</li><li>Cabo Frio</li><li>Arraial do Cabo</li><li>Armação dos Búzios</li><li>Rio das Ostras</li><li>Macaé</li>
          </ul>
          <p>No RJ, a documentação náutica passa pela <strong>Capitania dos Portos do Rio de Janeiro</strong> e pelas Delegacias e Agências subordinadas, como a <strong>Delegacia de Cabo Frio</strong>. Conhecemos a rotina de agendamento, as exigências e os documentos que cada uma pede.</p>

          <h2>Serviços no Rio de Janeiro</h2>
          <ul>
            <li><a href="/transferencia-de-embarcacao/">Transferência de embarcação</a>: lanchas e barcos comprados nas marinas da Baía de Guanabara, Angra, Paraty ou Região dos Lagos;</li>
            <li><a href="/inscricao-de-embarcacao/">Inscrição de embarcação e TIE</a>: barco novo, renovação, 2ª via e alteração de dados;</li>
            <li><a href="/documentacao-jet-ski/">Documentação de jet ski</a>: inscrição, transferência e regularização;</li>
            <li><a href="/habilitacao-nautica-arrais-amador/">Habilitação náutica</a>: Arrais-Amador, Motonauta, renovação e 2ª via;</li>
            <li><a href="/aquaviario/">Aquaviário</a>: apoio documental para profissionais.</li>
          </ul>

          <h2>Barco no RJ, dono em outro estado?</h2>
          <p>Muitos proprietários de São Paulo e Minas Gerais têm a embarcação em Angra, Paraty ou na Região dos Lagos. Cuidamos do processo aqui no RJ sem você precisar vir só para isso. Veja como funciona o <a href="/despachante-nautico-online-brasil/">atendimento a distância</a>.</p>`,
    faq: [
      ["Onde fica a Capitania dos Portos do Rio de Janeiro?", "A Capitania dos Portos do RJ fica no centro do Rio de Janeiro; há também Delegacias e Agências no estado, como a Delegacia de Cabo Frio. Indicamos onde o seu processo deve ser feito, conforme a jurisdição da embarcação."],
      ["Atendem em Angra dos Reis e Paraty?", "Sim. Atendemos proprietários de embarcações em Angra dos Reis, Paraty e em todo o litoral do RJ, com a maior parte do processo feita a distância."],
    ],
  },
  {
    path: "/despachante-nautico-regiao-dos-lagos/",
    title: "Despachante Náutico em Cabo Frio e Região dos Lagos | Luã Paiva",
    description: "Despachante náutico em Cabo Frio, Arraial do Cabo, Búzios, São Pedro da Aldeia, Araruama, Saquarema e Iguaba. Transferência, TIE, jet ski e habilitação náutica com atendimento presencial.",
    crumbs: [{ name: "Despachante náutico no RJ", path: "/despachante-nautico-rj/" }, { name: "Região dos Lagos", path: "/despachante-nautico-regiao-dos-lagos/" }],
    eyebrow: "Cabo Frio · Região dos Lagos",
    h1: "Despachante náutico em Cabo Frio e na Região dos Lagos",
    lead: "Nossa base. Atendimento presencial e prioritário em Cabo Frio, Arraial do Cabo, Búzios, São Pedro da Aldeia, Araruama, Saquarema, Iguaba Grande e região.",
    waMsg: "Olá, Luã! Estou na Região dos Lagos e preciso de um despachante náutico.",
    body: `
          <h2>Cidades atendidas</h2>
          <ul class="states">
            <li>Cabo Frio</li><li>Arraial do Cabo</li><li>Armação dos Búzios</li><li>São Pedro da Aldeia</li><li>Araruama</li><li>Iguaba Grande</li><li>Saquarema</li><li>Rio das Ostras</li><li>Casimiro de Abreu</li><li>Maricá</li>
          </ul>
          <p>A Região dos Lagos tem uma das maiores concentrações de lanchas, barcos de passeio e jet skis do estado: Lagoa de Araruama, Canal do Itajuru, marinas de Cabo Frio e Búzios, Praia dos Anjos em Arraial. A documentação local passa sobretudo pela <strong>Delegacia da Capitania dos Portos em Cabo Frio</strong>, cuja rotina conhecemos de perto.</p>

          <h2>O que mais fazemos na região</h2>
          <ul>
            <li><a href="/transferencia-de-embarcacao/">Transferência de lanchas e barcos</a> comprados na região ou trazidos de outros estados;</li>
            <li><a href="/documentacao-jet-ski/">Documentação de jet ski</a> para a temporada;</li>
            <li><a href="/habilitacao-nautica-arrais-amador/">Habilitação Arrais-Amador e Motonauta</a>, renovação e 2ª via;</li>
            <li><a href="/inscricao-de-embarcacao/">Inscrição e renovação do TIE</a>;</li>
            <li>Regularização de embarcações de pesca e de passeio.</li>
          </ul>

          <h2>Tem casa na Região dos Lagos e mora em outra cidade?</h2>
          <p>É o caso de muitos clientes do Rio, de São Paulo e de Minas. O barco fica aqui, o dono vem nos fins de semana. Resolvemos a documentação com você a distância e cuidamos do que precisa ser feito presencialmente na região.</p>`,
    faq: [
      ["Onde é feita a documentação náutica em Cabo Frio?", "Na Delegacia da Capitania dos Portos em Cabo Frio, que atende a Região dos Lagos. Agendamento, documentos e acompanhamento ficam por nossa conta."],
      ["Atendem em Búzios e Arraial do Cabo?", "Sim, com atendimento presencial em toda a Região dos Lagos."],
    ],
  },
  {
    path: "/despachante-nautico-online-brasil/",
    title: "Despachante Náutico Online: atendimento em todo o Brasil | Luã Paiva",
    description: "Despachante náutico online para todo o Brasil: transferência de embarcação, TIE, jet ski e habilitação náutica a distância, pelo WhatsApp. SP, SC, PR, BA, ES, MG, PE, CE e demais estados.",
    crumbs: [{ name: "Atendimento em todo o Brasil", path: "/despachante-nautico-online-brasil/" }],
    eyebrow: "Online · Todo o Brasil",
    h1: "Despachante náutico online para todo o Brasil",
    lead: "Não precisa estar no Rio de Janeiro. Transferência, inscrição, TIE, jet ski e habilitação com orientação a distância pelo WhatsApp, para proprietários em qualquer estado.",
    waMsg: "Olá, Luã! Estou fora do RJ e preciso de um despachante náutico.",
    body: `
          <h2>Como funciona a distância</h2>
          <ol>
            <li><strong>Você manda o caso pelo WhatsApp:</strong> o que precisa, fotos do TIE ou da CHA, cidade e Capitania mais próxima;</li>
            <li><strong>Recebe o diagnóstico e o orçamento:</strong> lista de documentos, prazos e custos, antes de começar;</li>
            <li><strong>Envia os documentos digitalizados:</strong> conferimos um por um e preparamos os requerimentos;</li>
            <li><strong>Protocolo:</strong> quando a Capitania exige presença ou documento original, você recebe o passo a passo exato do que entregar, onde e como; nos demais casos, cuidamos de tudo;</li>
            <li><strong>Acompanhamento até o fim:</strong> você é avisado em cada etapa até o documento ficar pronto.</li>
          </ol>

          <h2>Estados atendidos</h2>
          <ul class="states">
            <li>São Paulo</li><li>Santa Catarina</li><li>Paraná</li><li>Rio Grande do Sul</li><li>Minas Gerais</li><li>Espírito Santo</li><li>Bahia</li><li>Sergipe</li><li>Alagoas</li><li>Pernambuco</li><li>Paraíba</li><li>Rio Grande do Norte</li><li>Ceará</li><li>Piauí</li><li>Maranhão</li><li>Pará</li><li>Amapá</li><li>Amazonas</li><li>Roraima</li><li>Rondônia</li><li>Acre</li><li>Tocantins</li><li>Goiás</li><li>Distrito Federal</li><li>Mato Grosso</li><li>Mato Grosso do Sul</li><li>Rio de Janeiro</li>
          </ul>
          <p>Seja no litoral (Ilhabela, Ubatuba, Guarujá, Florianópolis, Balneário Camboriú, Salvador, Porto Seguro) ou em represas e rios do interior (Furnas, Represa de Jurumirim, Rio Paraná, Lago Paranoá), a documentação de embarcações de esporte e recreio segue as mesmas normas da Marinha do Brasil.</p>

          <h2>Casos que mais atendemos fora do RJ</h2>
          <ul>
            <li>Embarcação comprada em outro estado que precisa de <a href="/transferencia-de-embarcacao/">transferência de propriedade e de jurisdição</a>;</li>
            <li><a href="/documentacao-jet-ski/">Jet ski</a> comprado usado, sem transferência;</li>
            <li><a href="/inscricao-de-embarcacao/">Renovação e 2ª via do TIE</a>;</li>
            <li><a href="/habilitacao-nautica-arrais-amador/">Renovação, 2ª via e agregação da CHA</a>.</li>
          </ul>`,
    faq: [
      ["Um despachante do RJ consegue resolver o meu processo em outro estado?", "Sim. As regras de embarcações de esporte e recreio são nacionais (Marinha do Brasil). Conferimos e preparamos toda a documentação a distância e orientamos o que for preciso entregar na Capitania da sua região."],
      ["Preciso viajar até o Rio de Janeiro?", "Não. O processo é feito na Capitania que tem jurisdição sobre a embarcação ou sobre a sua residência, não no RJ."],
      ["Como envio os documentos?", "Pelo WhatsApp ou por e-mail, em foto ou PDF legível. Avisamos quando algum documento precisa ir em original ou com firma reconhecida."],
    ],
  },
  {
    path: "/privacidade/",
    title: "Política de Privacidade | Luã Paiva – Despachante Náutico",
    description: "Como o site luapaivadespachantenautico.com.br trata dados pessoais (LGPD).",
    crumbs: [{ name: "Privacidade", path: "/privacidade/" }],
    eyebrow: "LGPD",
    h1: "Política de privacidade",
    lead: "Este site não usa cookies de publicidade nem guarda dados pessoais.",
    waMsg: "Olá, Luã! Tenho uma dúvida sobre privacidade.",
    noindex: true,
    body: `
          <h2>Contatos</h2>
          <p>Quando você clica num botão de WhatsApp, telefone ou e-mail, ou usa o formulário, a conversa acontece diretamente no WhatsApp, no telefone ou no e-mail. O formulário não envia nada para servidores: só abre o WhatsApp com a mensagem pronta. Os dados que você envia por esses canais são usados apenas para responder ao seu pedido e prestar o serviço.</p>
          <h2>Estatísticas de uso</h2>
          <p>Contamos de forma anônima as páginas vistas e os cliques nos botões de contato (tipo de contato, página e origem geral da visita, como pesquisa no Google ou acesso direto), para saber quais páginas ajudam os clientes. Essa contagem não usa cookies, não guarda identificadores no seu aparelho e não inclui nome, telefone, e-mail ou o texto das mensagens. É feita pela High Level Marketing, que cuida do site.</p>
          <h2>Seus direitos</h2>
          <p>Para qualquer pedido sobre os seus dados (acesso, correção ou exclusão), escreva para <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>`,
  },
];

// ───────────────────────────── saída ─────────────────────────────
function out(path, html) {
  const file = join(ROOT, path === "/" ? "index.html" : `${path.replace(/^\/|\/$/g, "")}/index.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

out("/", home());
for (const p of PAGES) {
  let html = inner(p);
  if (p.noindex) html = html.replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
  out(p.path, html);
}

const urls = ["/", ...PAGES.filter((p) => !p.noindex).map((p) => p.path)];
writeFileSync(join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${LASTMOD}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(ROOT, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`);
console.log(`${urls.length + 1} páginas, ${urls.length} no sitemap`);
