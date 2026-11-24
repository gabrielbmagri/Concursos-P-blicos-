"use strict";
/* Avisos das refeições. Lê o que a página /dieta/ grava em usuarios/<id>/dieta/log
   ({ since, days: { "AAAA-MM-DD": { m1: timestamp, ... } } }) e avisa antes de cada refeição ainda não marcada.
   O plano abaixo espelha o de painel/dieta/index.html: se mudar lá, mude aqui. */
const PLANO = [
  { id: "m1", h: "05:30", n: "Saída de casa", f: "100 g banana amassada, 15 g leite em pó, 10 g mel, 15 g granola" },
  { id: "m2", h: "07:30", n: "Café no trabalho", f: "Crepioca (2 ovos, 40 g goma, 30 g queijo), banana 100 g, café preto" },
  { id: "m3", h: "12:00", n: "Almoço no trabalho", f: "150 g arroz ou macarrão cozido, 120 g frango cozido" },
  { id: "m4", h: "14:30", n: "Almoço em casa", f: "150 g arroz ou macarrão cozido, 120 g frango, alface, tomate, 5 ml azeite" },
  { id: "m5", h: "17:45", n: "Pré-treino", f: "2 fatias de pão, 60 g frango, 30 g ricota light, banana 100 g, 10 g mel" },
  { id: "m6", h: "21:00", n: "Janta", f: "200 g arroz, 150 g carne moída cozida, 1 ovo, 5 ml azeite" }
];
const ANTECEDENCIA = 15; // minutos antes da refeição
const JANELA_DIETA = 60; // minutos em que o aviso ainda pode sair depois de ficar devido
const minDe = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

/* Domingo é livre. Aviso sai uma vez por refeição e só se ela ainda não foi marcada. */
function gerarDieta({ dieta, cfg, agora, log }) {
  const out = [];
  cfg = cfg || {};
  if ((cfg.regras || {}).dieta === false) return out;
  if (agora.dow === 0) return out;
  const feitas = (dieta && dieta.days && dieta.days[agora.data]) || {};
  for (const m of PLANO) {
    const quando = minDe(m.h) - ANTECEDENCIA;
    if (agora.min < quando || agora.min >= quando + JANELA_DIETA) continue;
    if (feitas[m.id]) continue;
    const key = `dieta|${agora.data}|${m.id}`;
    if (log && log[key.replace(/[.\/]/g, "_")]) continue;
    if (log && log[key]) continue;
    out.push({ tipo: `dieta-${m.id}`, key, titulo: `Daqui a ${ANTECEDENCIA} min: ${m.n} (${m.h})`, corpo: m.f, email: null, link: "https://painel-de-metas.web.app/dieta/" });
  }
  return out;
}

module.exports = { gerarDieta, PLANO };
