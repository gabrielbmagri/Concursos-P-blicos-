#!/usr/bin/env node
/* Sensor do tema Labs.
   Abre painel/index.html em modo demonstração com o tema Labs, passa por todas as abas, clica nos botões (dois níveis,
   um de cada tipo) e lista o que ficou ilegível (contraste baixo) ou colorido (qualquer cor que não seja preto, branco ou cinza).
   Uso:  node dados/sensor-labs.js [escuro|claro|ambos] [--rapido] [--desktop]
   Precisa do pacote playwright. Saída: uma linha por problema; código de saída 1 se houver algum. */
const { chromium } = require("playwright");
const path = require("path");
const URL = "file://" + path.resolve(__dirname, "../painel/index.html");
const TABS = ["semana", "jornada", "revisoes", "simulados", "questoes", "desempenho", "plano", "info", "ankis", "biblioteca", "vade", "lembretes"];
const arg = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "ambos";
const RAPIDO = process.argv.includes("--rapido");
const DESKTOP = process.argv.includes("--desktop");
const VIEW = DESKTOP ? { width: 1100, height: 760 } : { width: 390, height: 844 };
const MAX_CLIQUES = RAPIDO ? 8 : 18;
const MAX_NIVEL2 = RAPIDO ? 3 : 6;

/* roda dentro da página */
function varrer() {
  const parse = (s) => { const m = (s || "").match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(",").map(parseFloat); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const colorido = (c) => { const mx = Math.max(...c), mn = Math.min(...c); return mx > 30 && (mx - mn) / mx > .18; };
  /* cor de fundo real: empilha os fundos translúcidos dos ancestrais sobre o primeiro fundo opaco */
  const fundo = (el) => {
    const camadas = []; let x = el, base = [0, 0, 0];
    while (x) { const b = parse(getComputedStyle(x).backgroundColor); if (b && b.a > 0) { if (b.a >= .98) { base = b.c; break; } camadas.push(b); } x = x.parentElement; }
    return camadas.reduceRight((acc, b) => acc.map((v, i) => v * (1 - b.a) + b.c[i] * b.a), base);
  };
  const nome = (el) => el.dataset && el.dataset.sel ? "CSS " + el.dataset.sel : (el.closest("svg") ? "svg " : "") + el.tagName.toLowerCase() + (el.getAttribute("class") ? "." + el.getAttribute("class").trim().replace(/\s+/g, ".") : "") + (el.dataset && el.dataset.act ? "[" + el.dataset.act + "]" : "");
  const SEM_TEXTO = /(fill|bar|bbprog|(^|[ >.])i$|(^|[ >.])i[ .]|(^|[ >.])u$|(^|[ >.])u[ .]|\.pt\b|\.chk$|sbars|spark|\.hm|steps|bi2|mis-i|xp-pct|gl-b|ws-exp|\.cell\.hot|\.gi small|\.switch|tick|\.ld\b|\.lkic$|\.star$)/;
  const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < .2) return;
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
    const fg = parse(cs.color);
    if (txt && fg) {
      const a = lum(fg.c), b = lum(fundo(el)), cr = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      if (cr < 3 && !(el.dataset && el.dataset.sel && SEM_TEXTO.test(el.dataset.sel))) out.push("CONTRASTE " + cr.toFixed(1) + " " + nome(el) + ' "' + txt.slice(0, 28) + '"');
      if (colorido(fg.c) && fg.a > .3) out.push("COR texto " + nome(el) + " rgb(" + fg.c.map(Math.round) + ')');
    }
    const bg = parse(cs.backgroundColor); if (bg && bg.a > .3 && colorido(bg.c)) out.push("COR fundo " + nome(el) + " rgb(" + bg.c.map(Math.round) + ")");
    ["Top", "Right", "Bottom", "Left"].forEach((l) => { if (parseFloat(cs["border" + l + "Width"]) > 0) { const p = parse(cs["border" + l + "Color"]); if (p && p.a > .3 && colorido(p.c)) out.push("COR borda " + nome(el) + " rgb(" + p.c.map(Math.round) + ")"); } });
    if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) { const p = parse(cs.outlineColor); if (p && colorido(p.c)) out.push("COR contorno " + nome(el) + " rgb(" + p.c.map(Math.round) + ")"); }
    if (el instanceof SVGElement && el.tagName.toLowerCase() === "svg") { const st = parse(cs.stroke); if (st && st.a > .3) { const a = lum(st.c), b = lum(fundo(el)); const cr = (Math.max(a, b) + .05) / (Math.min(a, b) + .05); if (cr < 1.8 && !/\.bi2 svg|\.mis-i svg/.test((el.dataset && el.dataset.sel) || "")) out.push("ICONE sem contraste " + cr.toFixed(1) + " " + nome(el)); } }
    if (el instanceof SVGElement) ["fill", "stroke"].forEach((k) => { const p = parse(cs[k]); if (p && p.a > .3 && colorido(p.c)) out.push("COR " + k + " " + nome(el) + " rgb(" + p.c.map(Math.round) + ")"); });
    if (/gradient/.test(cs.backgroundImage)) { const m = cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []; if (m.some((x) => { const p = parse(x); return p && colorido(p.c); })) out.push("COR degradê " + nome(el)); }
  });
  return [...new Set(out)];
}


/* monta um exemplo de cada seletor do CSS (tag, classes e atributos, com os ancestrais) e varre só esses exemplos */
function sintetico(src) {
  const varrer = (0, eval)("(" + src + ")");
  const seletores = new Set();
  const coletar = (regras) => { for (const r of regras) { if (r.selectorText) r.selectorText.split(",").forEach((x) => seletores.add(x.trim())); else if (r.cssRules) coletar(r.cssRules); } };
  [...document.styleSheets].forEach((sh) => { try { coletar(sh.cssRules); } catch (e) {} });
  const caixa = document.createElement("div"); caixa.id = "sensor-caixa"; caixa.style.cssText = "display:block;padding:8px;width:340px";
  const NS = "http://www.w3.org/2000/svg";
  const comp = (txt) => { const m = txt.match(/^([a-z][a-z0-9]*)?((?:\.[\w-]+|#[\w-]+|\[[^\]]+\])*)$/i); if (!m) return null; const tag = m[1] && !["html", "body"].includes(m[1]) ? m[1] : "div"; const el = ["svg", "path", "circle", "rect", "g"].includes(tag) ? document.createElementNS(NS, tag) : document.createElement(tag); if (tag === "svg") { el.setAttribute("width", "16"); el.setAttribute("height", "16"); } (m[2].match(/\.[\w-]+|#[\w-]+|\[[^\]]+\]/g) || []).forEach((t) => { if (t[0] === ".") el.classList.add(t.slice(1)); else if (t[0] === "#") el.id = t.slice(1); else { const a = t.slice(1, -1).match(/^([\w-]+)(?:=["']?([^"']*)["']?)?$/); if (a) el.setAttribute(a[1], a[2] == null ? "" : a[2]); } }); return el; };
  let feitos = 0;
  seletores.forEach((sel0) => {
    if (/olimpo|classico|::|:hover|:focus|:active|:disabled|:checked|:visited|@/.test(sel0)) return;
    let sel = sel0.replace(/html\[[^\]]+\](\[[^\]]+\])*/g, "").replace(/:(not|nth-[a-z-]+|first-child|last-child|first-of-type|last-of-type|is|where|has|empty)(\([^)]*\))?/g, "").trim();
    if (!sel || /^(body|\*)/.test(sel) || /[+~]/.test(sel)) return;
    const partes = sel.split(/\s*>\s*|\s+/).filter(Boolean); if (partes.length > 4) return;
    let pai = caixa, ultimo = null;
    for (const t of partes) { const el = comp(t); if (!el) return; if (!ultimo) { pai.appendChild(el); } else { pai.appendChild(el); } pai = el; ultimo = el; }
    ultimo.dataset.sel = sel0;
    if (!(ultimo instanceof SVGElement)) ultimo.appendChild(document.createTextNode("Aa"));
    feitos++;
  });
  document.body.appendChild(caixa);
  const todos = varrer();
  caixa.remove();
  return todos.filter((x) => /CSS /.test(x));
}

/* lista os clicáveis visíveis, um por tipo */
function clicaveis() {
  const sel = 'button,[data-act],.chip,[role="tab"],summary,label[for]';
  const vistos = new Set(), lista = [];
  document.querySelectorAll(sel).forEach((el) => {
    if (el.closest(".drawer,.dov,.mbtn") || el.disabled) return;
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return;
    const sig = el.tagName + "|" + (el.getAttribute("class") || "") + "|" + (el.dataset.act || "") + "|" + (el.dataset.v || "") + "|" + (el.getAttribute("data-k") || "");
    if (vistos.has(sig)) return; vistos.add(sig);
    lista.push({ sig, txt: (el.textContent || "").trim().slice(0, 24) });
  });
  return lista;
}
function clicar(sig) {
  const sel = 'button,[data-act],.chip,[role="tab"],summary,label[for]';
  for (const el of document.querySelectorAll(sel)) {
    if (el.closest(".drawer,.dov,.mbtn")) continue;
    const s = el.tagName + "|" + (el.getAttribute("class") || "") + "|" + (el.dataset.act || "") + "|" + (el.dataset.v || "") + "|" + (el.getAttribute("data-k") || "");
    if (s === sig) { el.scrollIntoView({ block: "center" }); el.click(); return true; }
  }
  return false;
}

async function abrir(browser, modo, tab) {
  const ctx = await browser.newContext({ viewport: VIEW });
  const p = await ctx.newPage();
  await p.route("**/firebase-config.js", (r) => r.fulfill({ contentType: "text/javascript", body: 'window.FIREBASE_CONFIG={apiKey:"COLE_AQUI"};' }));
  await p.route(/gstatic\.com\/firebasejs/, (r) => r.abort());
  await p.addInitScript((m) => { localStorage.setItem("painel-tema", "labs"); localStorage.setItem("painel-modo", m); }, modo);
  await p.goto(URL); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector(".mbtn") && document.querySelector(".mbtn").click()); await p.waitForTimeout(100);
  await p.evaluate((t) => { const b = document.querySelector('.drawer [data-v="' + t + '"]'); if (b) b.click(); }, tab); await p.waitForTimeout(350);
  return { ctx, p };
}
async function replay(p, caminho) { for (const sig of caminho) { await p.evaluate(clicar, sig); await p.waitForTimeout(250); } }

async function modoRodar(browser, modo) {
  const achados = new Map();
  { const { ctx, p } = await abrir(browser, modo, "semana"); (await p.evaluate(sintetico, varrer.toString())).forEach((l) => achados.set(l, "exemplo de cada seletor do CSS")); await ctx.close(); }
  const anota = (lista, onde) => lista.forEach((l) => { if (!achados.has(l)) achados.set(l, onde); });
  const fila = TABS.slice();
  const trabalhador = async () => { while (fila.length) { const tab = fila.shift(); await porAba(tab); } };
  const porAba = async (tab) => {
    let { ctx, p } = await abrir(browser, modo, tab);
    anota(await p.evaluate(varrer), tab);
    const n1 = (await p.evaluate(clicaveis)).slice(0, MAX_CLIQUES);
    await ctx.close();
    for (const c1 of n1) {
      ({ ctx, p } = await abrir(browser, modo, tab));
      await replay(p, [c1.sig]);
      anota(await p.evaluate(varrer), tab + " > " + c1.txt);
      const n2 = (await p.evaluate(clicaveis)).filter((x) => x.sig !== c1.sig).slice(0, MAX_NIVEL2);
      await ctx.close();
      for (const c2 of n2) {
        ({ ctx, p } = await abrir(browser, modo, tab));
        await replay(p, [c1.sig, c2.sig]);
        anota(await p.evaluate(varrer), tab + " > " + c1.txt + " > " + c2.txt);
        await ctx.close();
      }
    }
  };
  await Promise.all([trabalhador(), trabalhador(), trabalhador(), trabalhador()]);
  return achados;
}

(async () => {
  const browser = await chromium.launch();
  const modos = arg === "ambos" ? ["escuro", "claro"] : [arg];
  const todos = await Promise.all(modos.map(async (m) => [m, await modoRodar(browser, m)]));
  let total = 0;
  for (const [m, a] of todos) { for (const [l, onde] of a) { console.log(m + " | " + l + "   (" + onde + ")"); total++; } }
  console.log(total ? total + " problema(s)." : "Sensor limpo: nenhum contraste baixo nem cor.");
  await browser.close();
  process.exit(total ? 1 : 0);
})();
