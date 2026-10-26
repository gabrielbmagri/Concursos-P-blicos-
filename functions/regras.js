"use strict";
/* Regras dos lembretes. Funções puras: recebem o estado gravado pelo painel e devolvem os avisos a enviar. */
const TZ = "America/Sao_Paulo";

const FRASES = [
  "Quem passa estuda quando não está com vontade.",
  "Cada dia sem estudar é uma vaga a menos para você.",
  "O concorrente que vai te passar está estudando agora.",
  "Disciplina vence motivação. Abra o painel.",
  "Daqui a alguns meses você vai desejar ter estudado hoje.",
  "Cansaço passa. A vaga de servidor fica.",
  "Ninguém é aprovado só com intenção. Faça uma meta.",
  "Você não precisa de vontade, precisa de rotina.",
  "Sua versão aprovada está esperando você abrir o material.",
  "Sem desculpa: 25 minutos já contam.",
  "A prova não adia porque você está sem tempo.",
  "O que você fizer hoje é o que vai estar na prova.",
  "Reclamar não resolve questão. Resolva uma.",
  "Parar agora é jogar fora tudo o que você já investiu.",
  "Pare de negociar com o sofá.",
  "Uma questão por dia não aprova ninguém. Faça cinquenta."
];

const MEDITACOES = [
  ["Ao amanhecer, quando custar levantar, pense: levanto para fazer o trabalho de um ser humano.", "Marco Aurélio, Meditações"],
  ["O que está no caminho se torna o caminho.", "Marco Aurélio, Meditações"],
  ["Não perca tempo discutindo como deve ser um homem bom. Seja um.", "Marco Aurélio, Meditações"],
  ["Não é que tenhamos pouco tempo: é que perdemos muito.", "Sêneca, Sobre a brevidade da vida"],
  ["Enquanto adiamos, a vida passa.", "Sêneca, Cartas a Lucílio"],
  ["Primeiro diga a si mesmo o que você quer ser; depois faça o que tem de fazer.", "Epicteto, Discursos"],
  ["Diante da virtude, os deuses puseram o suor.", "Hesíodo, Os Trabalhos e os Dias"],
  ["Somos o que fazemos repetidamente. A excelência não é um ato, é um hábito.", "Will Durant, sobre Aristóteles"],
  ["Ora et labora: reza e trabalha.", "Regra de São Bento"],
  ["Tudo posso naquele que me fortalece.", "Filipenses 4,13"]
];
const meditacao = (data) => { let h = 0; for (const c of data) h = (h * 31 + c.charCodeAt(0)) >>> 0; return MEDITACOES[h % MEDITACOES.length]; };
const pad = (n) => String(n).padStart(2, "0");
function partes(d) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const o = {};
  f.formatToParts(d).forEach((p) => { o[p.type] = p.value; });
  const data = `${o.year}-${o.month}-${o.day}`;
  return { data, hora: `${o.hour}:${o.minute}`, min: (+o.hour) * 60 + (+o.minute), dow: new Date(data + "T12:00:00Z").getUTCDay(), ms: d.getTime() };
}
const minDe = (hhmm) => { const [h, m] = String(hhmm || "00:00").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const diasEntre = (a, b) => Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 864e5);
const somaDias = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const frase = (data, salt) => { let h = 0; for (const c of data + (salt || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0; return FRASES[h % FRASES.length]; };
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const HORAS = { manha: "07:00", duro: "14:00", revisoes: "17:00", questoes: "18:30", anki: "19:00", ofensiva: "20:00", meta_dia: "21:00", semana: "18:00", prazos: "08:00" };
const JANELA = 120; // minutos depois do horário em que o aviso ainda pode sair
const JANELA_LONGA = { manha: 360, prazos: 360, semana: 240 }; // resumos e e-mails: mais tolerância se o servidor atrasar ou for ligado depois do horário

const SITE = "https://painel-de-metas.web.app";
const SERIF = "Georgia,'Times New Roman',serif";
/* E-mail "Rumo ao Olimpo": tabelas e estilos em linha, para funcionar em Gmail, Outlook e celular. */
function emailHtml(o) {
  const { titulo, sub, stats, secoes, destaque, citacao, botao, rodape } = o;
  const td = (c, st) => `<td style="${st || ""}">${c}</td>`;
  const statsHtml = stats && stats.length ? `<tr><td style="padding:4px 20px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${stats.map((x, i) => `<td width="${Math.floor(100 / stats.length)}%" style="padding:0 ${i === stats.length - 1 ? 0 : 6}px 0 ${i === 0 ? 0 : 6}px"><div style="background:#f3ecdb;border:1px solid #e2d6b4;border-radius:14px;padding:14px 8px;text-align:center"><div style="font-family:${SERIF};font-size:26px;font-weight:bold;color:#14284f;line-height:1.1">${x.v}</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a6a3a;margin-top:5px">${x.l}</div></div></td>`).join("")}</tr></table></td></tr>` : "";
  const secHtml = (secoes || []).map((sc) => `<tr><td style="padding:16px 26px 0"><div style="font-family:${SERIF};font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#a87a0c;border-bottom:1px solid #e2d6b4;padding-bottom:6px;margin-bottom:10px">${sc.titulo}</div>${sc.itens.map((it) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 7px"><tr><td valign="top" style="padding:7px 10px 0 0"><div style="width:7px;height:7px;border-radius:50%;background:#c9a227"></div></td><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a2233">${it}</td></tr></table>`).join("")}</td></tr>`).join("");
  const dest = destaque ? `<tr><td style="padding:18px 26px 0"><div style="background:#14284f;border-radius:14px;padding:16px 18px"><div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8c65a">${destaque.rotulo}</div><div style="font-family:${SERIF};font-size:19px;line-height:1.35;color:#ffffff;margin-top:6px">${destaque.texto}</div></div></td></tr>` : "";
  const cit = citacao ? `<tr><td style="padding:22px 26px 0"><div style="border-left:4px solid #c9a227;padding:4px 0 4px 16px"><div style="font-family:${SERIF};font-style:italic;font-size:18px;line-height:1.5;color:#1a2233">“${citacao[0]}”</div><div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#a87a0c;margin-top:8px">${citacao[1]}</div></div></td></tr>` : "";
  const btn = `<tr><td align="center" style="padding:26px 26px 8px"><a href="${SITE}/" style="display:inline-block;background:#c9a227;color:#14284f;font-family:${SERIF};font-weight:bold;font-size:17px;letter-spacing:.04em;text-decoration:none;padding:14px 34px;border-radius:99px;border-bottom:3px solid #a87a0c">${botao || "Seguir a jornada"}</a></td></tr>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Rumo ao Olimpo</title></head><body style="margin:0;padding:0;background:#ece3cc"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${(sub || titulo).replace(/<[^>]+>/g, "")}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ece3cc"><tr><td align="center" style="padding:22px 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fbf8f1;border-radius:20px;overflow:hidden;border:1px solid #d9c88f">
<tr><td align="center" style="background:#14284f;padding:28px 20px 20px"><img src="${SITE}/email-avatar.png" width="92" height="92" alt="Atlas" style="display:block;border:0;border-radius:50%;margin:0 auto"><div style="font-family:${SERIF};font-size:12px;letter-spacing:.34em;text-transform:uppercase;color:#e8c65a;margin-top:14px">Rumo ao</div><div style="font-family:${SERIF};font-size:36px;letter-spacing:.14em;color:#ffffff;line-height:1.1">OLIMPO</div></td></tr>
<tr><td style="line-height:0;font-size:0;background:#f6efe0"><img src="${SITE}/email-meandro.png" width="600" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>
<tr><td style="padding:26px 26px 6px"><div style="font-family:${SERIF};font-size:26px;line-height:1.2;color:#14284f;font-weight:bold">${titulo}</div>${sub ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#475066;margin-top:8px">${sub}</div>` : ""}</td></tr>
${statsHtml}${secHtml}${dest}${cit}${btn}
<tr><td style="padding:18px 26px 24px;text-align:center"><div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#8a8470">${rodape || "Rumo ao Olimpo · Câmara dos Deputados 2026"}<br>Você recebe este e-mail porque ligou os lembretes no painel.</div></td></tr>
</table></td></tr></table></body></html>`;
}

/* Devolve a lista de avisos que devem sair agora. */
function gerar({ estado: e, cfg, agora, log }) {
  const out = [];
  if (!e || !e.hoje) return out;
  cfg = cfg || {};
  const regras = cfg.regras || {}, horas = cfg.horas || {};
  const hoje = agora.data;
  const on = (k) => regras[k] !== false;
  const janela = (k, extra) => { const h = minDe(extra || horas[k] || HORAS[k]); return agora.min >= h && agora.min < h + (JANELA_LONGA[k] || JANELA); };
  const feito = (key) => !!(log && log[key]);
  const add = (tipo, key, titulo, corpo, email) => { if (!feito(key)) out.push({ tipo, key, titulo, corpo, email: email || null }); };

  const st = e.streak || {}, dia = e.dia || {}, sem = e.sem || {};
  const fresco = e.hoje === hoje;
  const estudouHoje = st.last === hoje;
  const dp = diasEntre(hoje, e.prova);
  const folgas = e.folgas || [];
  let gap = st.last ? diasEntre(st.last, hoje) : 99;
  for (let d = st.last ? somaDias(st.last, 1) : hoje; d < hoje; d = somaDias(d, 1)) if (folgas.includes(d)) gap--;
  const cur = st.cur || 0;
  const risco = cur > 0 && !estudouHoje && gap <= 1;
  const revs = (e.revs || []).filter((r) => r.due <= hoje);
  const atras = revs.filter((r) => r.due < hoje).length;
  const ak = dia.ak || { d: 0, t: 0 };
  const akPend = fresco ? Math.max(0, ak.t - ak.d) : ak.t;
  const alvo = dia.alvo || 0, feitas = fresco ? (dia.feitas || 0) : 0;
  const semOk = sem.ini && sem.ini <= hoje && hoje <= sem.fim;
  const prox = (e.proximas || [])[0];

  if (on("manha") && janela("manha")) {
    const f = frase(hoje, "m"), med = meditacao(hoje), l = [];
    l.push(alvo ? `<b>${alvo} ${alvo === 1 ? "meta" : "metas"}</b> para hoje${prox ? `, começando por <b>${esc(prox)}</b>` : ""}.` : "Sem meta marcada para hoje: aproveite para revisar.");
    if (revs.length) l.push(`<b>${plural(revs.length, "revisão", "revisões")}</b>${atras ? ` (${atras} ${atras === 1 ? "atrasada" : "atrasadas"})` : ""}.`);
    if (akPend) l.push(`<b>${plural(akPend, "cartão", "cartões")}</b> no Anki.`);
    const txt = [alvo ? `Metas de hoje: ${alvo}${prox ? `, começando por "${prox}"` : ""}.` : "Sem meta marcada para hoje.", revs.length ? `Revisões: ${revs.length}${atras ? ` (${atras} atrasadas)` : ""}.` : "", akPend ? `Anki: ${akPend} cartões.` : ""].filter(Boolean).join(" ");
    add("manha", `manha|${hoje}`, `Bom dia! Faltam ${dp} dias para a prova`, `${txt} ${f}`.slice(0, 230),
      { assunto: `Rumo ao Olimpo · faltam ${dp} dias para a prova`, html: emailHtml({ titulo: "Bom dia, concurseiro", sub: `Seu plano de hoje, com ${dp} dias para a prova.`, stats: [{ v: dp, l: "dias para a prova" }, { v: st.cur || 0, l: st.cur === 1 ? "dia de ofensiva" : "dias de ofensiva" }, { v: esc((e.xp || {}).nome || "Acólito"), l: "seu nível" }].map((x, i) => (i === 2 ? { ...x, v: `<span style="font-size:15px;line-height:1.3;display:block">${x.v}</span>` } : x)), secoes: [{ titulo: "Missões de hoje", itens: l }], destaque: { rotulo: "Sem desculpa", texto: esc(f) }, citacao: med, botao: "Começar a estudar" }) });
  }
  if (on("duro") && janela("duro") && !estudouHoje) {
    add("duro", `duro|${hoje}`, "Você ainda não estudou hoje", frase(hoje, "d") + " Abra o painel e faça pelo menos uma meta.");
  }
  if (on("revisoes") && janela("revisoes") && revs.length) {
    add("revisoes", `revisoes|${hoje}`, atras ? `${plural(atras, "revisão atrasada", "revisões atrasadas")}` : `${plural(revs.length, "revisão para hoje", "revisões para hoje")}`,
      `${revs.slice(0, 2).map((r) => r.n).join("; ")}${revs.length > 2 ? ` e mais ${revs.length - 2}` : ""}. Revisão esquecida é conteúdo perdido.`);
  }
  if (on("questoes") && janela("questoes") && (e.metaQ || []).length) {
    const m = e.metaQ[0];
    add("questoes", `questoes|${hoje}`, "Meta sem a base de questões", `"${m.n}": ${m.f} de ${m.g} questões. Faltam ${Math.max(0, m.g - m.f)} para formar a base.`);
  }
  if (on("anki") && janela("anki") && akPend > 0) {
    add("anki", `anki|${hoje}`, `${plural(akPend, "cartão", "cartões")} no Anki`, `Você tem ${akPend} cartões para revisar hoje. Quem adia o Anki esquece e paga em dobro depois.`);
  }
  if (on("ofensiva") && risco && (janela("ofensiva") || janela("ofensiva", "22:30"))) {
    const ult = agora.min >= minDe("22:30");
    add("ofensiva", `ofensiva|${hoje}|${ult ? "2" : "1"}`, ult ? "Última chance: sua ofensiva acaba à meia-noite" : `Sua ofensiva de ${plural(cur, "dia", "dias")} está em risco`,
      `${ult ? "Faltam poucas horas. " : ""}Faça qualquer coisa agora: 1 meta, 1 questão ou 1 cartão salva ${plural(cur, "dia", "dias")} de ofensiva. ${frase(hoje, "o")}`);
  }
  if (on("meta_dia") && janela("meta_dia") && fresco && alvo > 0 && feitas < alvo) {
    add("meta_dia", `meta_dia|${hoje}`, "Você não bateu a meta de hoje", `${feitas} de ${alvo} metas feitas. Faltam ${alvo - feitas}. ${frase(hoje, "e")}`);
  }
  if (on("semana") && semOk && janela("semana")) {
    const falta = Math.max(0, (sem.total || 0) - (sem.feitas || 0));
    if (agora.dow === 6 && falta > 0) {
      add("semana", `semana|sab|${hoje}`, `Faltam ${plural(falta, "meta", "metas")} para fechar a semana ${sem.n}`, `Você fez ${sem.feitas} de ${sem.total}. Hoje é o último dia útil da semana.`);
    } else if (agora.dow === 0) {
      const l = [`Semana ${sem.n}: ${sem.feitas} de ${sem.total} metas concluídas.`, `Questões: ${sem.qf || 0}${sem.qp ? ` de cerca de ${sem.qp} previstas` : ""}.`, `Ofensiva: ${plural(cur, "dia", "dias")}. Nível: ${(e.xp || {}).nome || "-"}.`, `Faltam ${dp} dias para a prova.`];
      const med = meditacao(hoje), pct = sem.total ? Math.round((sem.feitas / sem.total) * 100) : 0;
      add("semana", `semana|dom|${hoje}`, `Resumo da semana ${sem.n}`, l.join(" "), { assunto: `Rumo ao Olimpo · resumo da semana ${sem.n}`, html: emailHtml({ titulo: `Resumo da semana ${sem.n}`, sub: pct >= 90 ? "Semana digna do Olimpo. Continue." : pct >= 60 ? "Boa semana. Dá para fechar melhor a próxima." : "A semana ficou aquém. Zere a conta e recomece amanhã.", stats: [{ v: `${sem.feitas}/${sem.total}`, l: "metas" }, { v: sem.qf || 0, l: "questões" }, { v: st.cur || 0, l: "ofensiva" }], secoes: [{ titulo: "Balanço", itens: [`<b>${pct}%</b> das metas da semana concluídas.`, `${sem.qf || 0} questões feitas${sem.qp ? ` de cerca de ${sem.qp} previstas` : ""}.`, `Faltam <b>${dp} dias</b> para a prova.`] }], citacao: med, botao: "Planejar a próxima semana" }) });
    }
  }
  if (on("prazos") && janela("prazos") && [100, 60, 30, 14, 7, 3, 2, 1, 0].includes(dp)) {
    const t = dp === 0 ? "A prova é hoje. Boa sorte!" : dp === 1 ? "A prova é amanhã" : `Faltam ${dp} dias para a prova`;
    const c = dp === 0 ? "Respire, confie na preparação e faça a sua prova." : `${frase(hoje, "p")} Faltam ${dp} dias.`;
    add("prazos", `prazos|${hoje}`, t, c, { assunto: `Rumo ao Olimpo · ${t.toLowerCase()}`, html: emailHtml({ titulo: t, sub: dp === 0 ? "O dia chegou." : "Contagem regressiva para a prova.", stats: [{ v: dp, l: dp === 1 ? "dia" : "dias" }, { v: st.cur || 0, l: "ofensiva" }, { v: `<span style="font-size:15px;line-height:1.3;display:block">${esc((e.xp || {}).nome || "Acólito")}</span>`, l: "seu nível" }], secoes: [{ titulo: "Para hoje", itens: [esc(c)] }], citacao: meditacao(hoje), botao: "Abrir o painel" }) });
  }
  if (on("demora") && e.estudando && e.estudando.desde) {
    const lim = (cfg.horasMeta || 3) * 3600000, passou = agora.ms - e.estudando.desde;
    if (passou > lim && agora.min >= 7 * 60 && agora.min <= 22 * 60 + 30) {
      const h = Math.floor(passou / 3600000);
      add("demora", `demora|${e.estudando.desde}`, "Essa meta está demorando", `Você está há ${h}h em "${e.estudando.n}". Conclua, registre o que falta e siga para a próxima.`);
    }
  }
  return out;
}

module.exports = { gerar, partes, FRASES, emailHtml, diasEntre, somaDias };
