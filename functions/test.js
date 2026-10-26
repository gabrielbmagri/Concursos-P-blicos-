"use strict";
const assert = require("assert");
const { gerar, partes } = require("./regras");
const ag = (iso) => partes(new Date(iso));
// 10/11/2026 (terça) 07:10 em Brasília = 10:10 UTC
const base = { hoje: "2026-11-10", prova: "2027-01-17", folgas: ["2026-11-02"], streak: { cur: 5, best: 5, last: "2026-11-09" }, dia: { alvo: 2, feitas: 0, rv: { d: 0, t: 3 }, ak: { d: 0, t: 12 }, q: { d: 0, t: 50 } },
  sem: { n: 3, ini: "2026-11-09", fim: "2026-11-15", total: 10, feitas: 4, qf: 100, qp: 500 }, proximas: ["Poder Legislativo"], revs: [{ n: "Crase", due: "2026-11-08" }, { n: "CF art. 5", due: "2026-11-10" }], estudando: null, metaQ: [{ n: "Crase", f: 20, g: 50 }] };
let r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T10:10:00Z"), log: {} });
assert.deepStrictEqual(r.map((x) => x.tipo), ["manha"]);
assert.ok(r[0].email && r[0].titulo.includes("68 dias"));
assert.strictEqual(gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T10:10:00Z"), log: { "manha|2026-11-10": 1 } }).length, 0, "dedupe");
r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T23:10:00Z"), log: {} }); // 20:10
assert.ok(r.some((x) => x.tipo === "ofensiva"), "ofensiva em risco");
r = gerar({ estado: { ...base, streak: { cur: 5, best: 5, last: "2026-11-10" } }, cfg: {}, agora: ag("2026-11-10T23:10:00Z"), log: {} });
assert.ok(!r.some((x) => x.tipo === "ofensiva"), "já estudou hoje");
r = gerar({ estado: { ...base, streak: { cur: 5, best: 5, last: "2026-11-07" } }, cfg: {}, agora: ag("2026-11-10T23:10:00Z"), log: {} });
assert.ok(!r.some((x) => x.tipo === "ofensiva"), "ofensiva já perdida (gap 3)");
r = gerar({ estado: base, cfg: { regras: { manha: false } }, agora: ag("2026-11-10T10:10:00Z"), log: {} });
assert.strictEqual(r.length, 0, "regra desligada");
r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T17:20:00Z"), log: {} }); // 14:20
assert.ok(r.some((x) => x.tipo === "duro"), "cutucada dura");
r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T20:30:00Z"), log: {} }); // 17:30
assert.ok(r.some((x) => x.tipo === "revisoes"));
r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-10T00:30:00Z"), log: {} }); // 21:30 do dia 9
assert.ok(!r.some((x) => x.tipo === "meta_dia"), "snapshot de outro dia não dispara meta_dia");
r = gerar({ estado: base, cfg: {}, agora: ag("2026-11-11T00:30:00Z"), log: {} }); // 21:30 dia 10
assert.ok(r.some((x) => x.tipo === "meta_dia"));
r = gerar({ estado: { ...base, hoje: "2026-11-14", streak: { cur: 5, best: 5, last: "2026-11-14" } }, cfg: {}, agora: ag("2026-11-14T21:10:00Z"), log: {} }); // sábado 18:10
assert.ok(r.some((x) => x.tipo === "semana" && x.key.startsWith("semana|sab")));
r = gerar({ estado: { ...base, hoje: "2026-11-15" }, cfg: {}, agora: ag("2026-11-15T21:10:00Z"), log: {} }); // domingo
assert.ok(r.some((x) => x.tipo === "semana" && x.email));
r = gerar({ estado: { ...base, hoje: "2026-12-18" }, cfg: {}, agora: ag("2026-12-18T11:10:00Z"), log: {} }); // 08:10, 30 dias
assert.ok(r.some((x) => x.tipo === "prazos" && x.titulo.includes("30")));
r = gerar({ estado: { ...base, estudando: { n: "Crase", desde: Date.parse("2026-11-10T10:00:00Z") } }, cfg: {}, agora: ag("2026-11-10T16:00:00Z"), log: {} }); // 6h depois
assert.ok(r.some((x) => x.tipo === "demora"));
console.log("ok: regras dos lembretes");
