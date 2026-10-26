"use strict";
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { gerar, partes, emailHtml, FRASES } = require("./regras");

admin.initializeApp();
const db = admin.firestore();
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");
const REGION = "southamerica-east1";
const LINK = "https://painel-de-metas.web.app/";
const MAX_POR_EXECUCAO = 3;

async function enviarEmail(cfg, item) {
  const e = cfg.email || {};
  const mapa = { manha: "manha", semana: "semana", prazos: "prazos", teste: "ativo" };
  if (!e.ativo || !e.addr || !item.email) return false;
  if (item.tipo !== "teste" && e[mapa[item.tipo]] === false) return false;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY.value()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Painel de metas <onboarding@resend.dev>", to: [e.addr], subject: item.email.assunto, html: item.email.html })
  });
  if (!r.ok) console.error("email", r.status, await r.text());
  return r.ok;
}

async function enviarPush(uid, cfg, item) {
  if (cfg.push === false) return 0;
  const tokens = Object.entries(cfg.tokens || {}).map(([k, v]) => [k, v && v.t]).filter(([, t]) => t);
  if (!tokens.length) return 0;
  const res = await admin.messaging().sendEachForMulticast({
    tokens: tokens.map(([, t]) => t),
    notification: { title: item.titulo, body: item.corpo },
    data: { tag: item.tipo, link: LINK },
    webpush: { notification: { icon: "/icon-192.png", badge: "/icon-192.png", tag: item.tipo }, fcmOptions: { link: LINK } }
  });
  const apagar = {};
  res.responses.forEach((r, i) => {
    const c = r.error && r.error.code;
    if (c === "messaging/registration-token-not-registered" || c === "messaging/invalid-registration-token") apagar[`tokens.${tokens[i][0]}`] = admin.firestore.FieldValue.delete();
  });
  if (Object.keys(apagar).length) await db.doc(`usuarios/${uid}/notif/config`).update(apagar).catch(() => {});
  return res.successCount;
}

async function processar(uid, agora) {
  const base = db.collection(`usuarios/${uid}/notif`);
  const [c, e, l] = await Promise.all([base.doc("config").get(), base.doc("estado").get(), base.doc("log").get()]);
  await base.doc("servidor").set({ ultima: agora.ms }, { merge: true });
  if (!c.exists || !e.exists) return 0;
  const cfg = c.data(), log = l.exists ? l.data() : {};
  const itens = gerar({ estado: e.data(), cfg, agora, log }).slice(0, MAX_POR_EXECUCAO);
  const novo = {};
  for (const it of itens) {
    try {
      const n = await enviarPush(uid, cfg, it);
      const m = await enviarEmail(cfg, it);
      if (n || m) novo[it.key.replace(/[.\/]/g, "_")] = agora.ms;
    } catch (err) { console.error("envio", it.key, err); }
  }
  const corte = agora.ms - 3 * 864e5, mant = {};
  Object.entries(log).forEach(([k, v]) => { if (typeof v === "number" && v > corte) mant[k] = v; });
  if (Object.keys(novo).length || Object.keys(mant).length !== Object.keys(log).length) await base.doc("log").set({ ...mant, ...novo });
  return itens.length;
}

exports.lembretes = onSchedule({ schedule: "every 15 minutes", timeZone: "America/Sao_Paulo", region: REGION, secrets: [RESEND_API_KEY], timeoutSeconds: 120 }, async () => {
  const agora = partes(new Date());
  const users = await db.collection("usuarios").listDocuments();
  for (const u of users) { try { await processar(u.id, agora); } catch (err) { console.error("usuario", u.id, err); } }
});

exports.teste = onDocumentWritten({ document: "usuarios/{uid}/notif/pedido", region: REGION, secrets: [RESEND_API_KEY] }, async (ev) => {
  const d = ev.data && ev.data.after && ev.data.after.data();
  if (!d || (d.tipo !== "teste" && d.tipo !== "resumo")) return;
  const uid = ev.params.uid, c = await db.doc(`usuarios/${uid}/notif/config`).get();
  const cfg = c.exists ? c.data() : {};
  if (d.tipo === "resumo") {
    const e = await db.doc(`usuarios/${uid}/notif/estado`).get();
    if (!e.exists) return;
    const ag = { ...partes(new Date()), min: 8 * 60 };
    const it = gerar({ estado: e.data(), cfg: { ...cfg, regras: { ...(cfg.regras || {}), manha: true } }, agora: ag, log: {} }).find((x) => x.tipo === "manha");
    if (!it) return;
    const n2 = await enviarPush(uid, cfg, it), m2 = await enviarEmail(cfg, it).catch((err) => { console.error(err); return false; });
    await db.doc(`usuarios/${uid}/notif/servidor`).set({ ultimoResumo: Date.now(), resumoPush: n2, resumoEmail: m2 }, { merge: true });
    return;
  }
  const fr = FRASES[Math.floor(Math.random() * FRASES.length)];
  const item = { tipo: "teste", titulo: "Teste do Painel de metas", corpo: `Está funcionando. ${fr}`, email: { assunto: "Teste do Painel de metas", html: emailHtml("Teste do Painel de metas", ["Está funcionando.", `<b>${fr}</b>`]) } };
  const n = await enviarPush(uid, cfg, item), m = await enviarEmail(cfg, item).catch((err) => { console.error(err); return false; });
  await db.doc(`usuarios/${uid}/notif/servidor`).set({ ultimoTeste: Date.now(), testePush: n, testeEmail: m }, { merge: true });
});
