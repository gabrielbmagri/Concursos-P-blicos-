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

function emailHtml(titulo, linhas, rodape) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#14301f"><div style="background:#087a40;color:#fff;padding:18px 22px;border-radius:14px 14px 0 0"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Painel de metas</div><div style="font-size:22px;font-weight:800;margin-top:4px">${esc(titulo)}</div></div><div style="border:1px solid #dfe8e2;border-top:0;padding:18px 22px;border-radius:0 0 14px 14px;font-size:15px;line-height:1.55">${linhas.map((l) => `<p style="margin:0 0 12px">${l}</p>`).join("")}<p style="margin:16px 0 0"><a href="https://painel-de-metas.web.app/" style="background:#ffd21a;color:#14301f;font-weight:800;text-decoration:none;padding:11px 20px;border-radius:99px;display:inline-block">Abrir o painel</a></p>${rodape ? `<p style="margin:18px 0 0;font-size:12px;color:#6b7a72">${esc(rodape)}</p>` : ""}</div></div>`;
}

/* Devolve a lista de avisos que devem sair agora. */
function gerar({ estado: e, cfg, agora, log }) {
  const out = [];
  if (!e || !e.hoje) return out;
  cfg = cfg || {};
  const regras = cfg.regras || {}, horas = cfg.horas || {};
  const hoje = agora.data;
  const on = (k) => regras[k] !== false;
  const janela = (k, extra) => { const h = minDe(extra || horas[k] || HORAS[k]); return agora.min >= h && agora.min < h + JANELA; };
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
    const l = [];
    l.push(alvo ? `Metas de hoje: ${alvo}${prox ? `, começando por "${prox}"` : ""}.` : "Sem meta marcada para hoje. Aproveite para revisar.");
    if (revs.length) l.push(`Revisões: ${revs.length}${atras ? ` (${atras} atrasadas)` : ""}.`);
    if (akPend) l.push(`Anki: ${akPend} cartões.`);
    const f = frase(hoje, "m");
    add("manha", `manha|${hoje}`, `Bom dia! Faltam ${dp} dias para a prova`, `${l.join(" ")} ${f}`.slice(0, 230),
      { assunto: `Seu dia de estudo: faltam ${dp} dias para a prova`, html: emailHtml(`Faltam ${dp} dias para a prova`, [...l.map(esc), `<b>${esc(f)}</b>`, `<i>“${esc(meditacao(hoje)[0])}”</i><br><small>${esc(meditacao(hoje)[1])}</small>`, st.cur ? `Ofensiva atual: ${plural(st.cur, "dia", "dias")}.` : "Comece hoje uma nova ofensiva."]) });
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
      add("semana", `semana|dom|${hoje}`, `Resumo da semana ${sem.n}`, l.join(" "), { assunto: `Resumo da semana ${sem.n}`, html: emailHtml(`Resumo da semana ${sem.n}`, l.map(esc)) });
    }
  }
  if (on("prazos") && janela("prazos") && [100, 60, 30, 14, 7, 3, 2, 1, 0].includes(dp)) {
    const t = dp === 0 ? "A prova é hoje. Boa sorte!" : dp === 1 ? "A prova é amanhã" : `Faltam ${dp} dias para a prova`;
    const c = dp === 0 ? "Respire, confie na preparação e faça a sua prova." : `${frase(hoje, "p")} Faltam ${dp} dias.`;
    add("prazos", `prazos|${hoje}`, t, c, { assunto: t, html: emailHtml(t, [esc(c)]) });
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
