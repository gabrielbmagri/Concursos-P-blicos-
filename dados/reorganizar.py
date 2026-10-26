#!/usr/bin/env python3
"""Reorganiza as metas pendentes por semana a partir da ordem original do plano.

A distribuição é sempre refeita do zero a partir de três coisas: a ordem original
(campo "seq" de cada meta), o que já foi concluído (dados/estado.json) e os
parâmetros de dados/plano.json. Por isso mudar o ritmo (10, 15, 20 metas por semana)
não embaralha nada: o resultado depende só desses três arquivos, não do histórico de
remanejamentos anteriores.

Uso:
  python3 dados/reorganizar.py              # só mostra o resultado (nada é gravado)
  python3 dados/reorganizar.py --aplicar    # grava dados/cronograma.json
  python3 dados/reorganizar.py --cortar-excedente   # se não couber, lista as últimas metas da fila em fora_do_plano
Opções: --plano ARQ  --estado ARQ  --crono ARQ (para testar com outros arquivos)
"""
import json, sys, datetime, pathlib, collections

AQUI = pathlib.Path(__file__).resolve().parent
CRONO = AQUI / "cronograma.json"
PLANO = AQUI / "plano.json"
ESTADO = AQUI / "estado.json"

def d(s): return datetime.date.fromisoformat(s)

def opcao(nome, padrao):
    return pathlib.Path(sys.argv[sys.argv.index(nome) + 1]) if nome in sys.argv else padrao

def carregar():
    crono = json.load(open(opcao("--crono", CRONO), encoding="utf-8"))
    plano = json.load(open(opcao("--plano", PLANO), encoding="utf-8"))
    estado = json.load(open(opcao("--estado", ESTADO), encoding="utf-8"))
    return crono, plano, estado

def dias_de_estudo(semana, plano, a_partir):
    """Dias de segunda a sábado que sobram na semana (a partir de uma data, sem os dias de folga)."""
    ini = d(semana["inicio"])
    folgas = {d(x) for x in plano.get("dias_sem_estudo", [])}
    n = 0
    for k in range(6):  # seg..sáb
        dia = ini + datetime.timedelta(days=k)
        if dia >= a_partir and dia not in folgas:
            n += 1
    return n

def reorganizar(crono, plano, estado):
    W = crono["semanas"]
    concluidas = set(estado["concluidas"])
    com_registro = set(estado["com_registro"])
    fixas = set(plano.get("semanas_fixas", ["S15"]))
    fora = set(plano.get("fora_do_plano", []))
    inicio = d(plano["inicio"])
    por_semana = plano["metas_por_semana"]
    ajustes = plano.get("ajustes_por_semana", {})
    w0 = next((i for i, s in enumerate(W) if d(s["inicio"]) <= inicio <= d(s["fim"])), None)
    if w0 is None: sys.exit("A data de início não cai em nenhuma semana do plano.")

    oculta = lambda m: m.get("legado") and m["id"] not in com_registro
    todas = [m for s in W for m in s["metas"]]
    faltam_seq = [m["id"] for m in todas if "seq" not in m]
    if faltam_seq: sys.exit(f"Metas sem seq: {faltam_seq[:5]}")

    # fila: tudo o que falta estudar, na ordem original
    fila = [m for s in W if s["id"] not in fixas for m in s["metas"]
            if m["tipo"] != "domingo" and not oculta(m) and m["id"] not in concluidas and m["id"] not in fora]
    fila.sort(key=lambda m: m["seq"])
    domingos = {s["id"]: [m for m in s["metas"] if m["tipo"] == "domingo"] for s in W}
    # cadernos de erros já feitos nunca somem; os dos demais dependem de a semana ter estudo
    novas = []
    for i, s in enumerate(W):
        mant = [m for m in s["metas"] if (m["id"] in concluidas) or oculta(m) or m["id"] in fora or s["id"] in fixas]
        if s["id"] in fixas:
            novas.append(list(s["metas"])); continue
        if i < w0:
            novas.append([m for m in mant]); continue
        novas.append([m for m in mant if m["tipo"] != "domingo"])  # preenchido abaixo
    resumo = []
    ultima = max(i for i, s in enumerate(W) if s["id"] not in fixas)
    for i in range(w0, ultima + 1):
        s = W[i]
        dias = dias_de_estudo(s, plano, inicio)
        base = ajustes.get(s["id"], {}).get("metas", por_semana)
        cap = 0 if dias == 0 else max(1, round(base * dias / 6))
        pega, fila = fila[:cap], fila[cap:]
        for m in pega:
            m.setdefault("semana_original", m["semana"])
            m["semana"] = s["id"]
        doms = domingos[s["id"]] if pega else []
        novas[i] = pega + [m for m in doms if m["id"] not in {x["id"] for x in pega}] + novas[i]
        resumo.append((s["id"], dias, cap, len(pega)))
    return W, novas, fila, resumo, w0

def main():
    aplicar = "--aplicar" in sys.argv
    crono, plano, estado = carregar()
    W, novas, sobra, resumo, w0 = reorganizar(crono, plano, estado)
    fora = set(plano.get("fora_do_plano", []))
    print(f"Metas por semana: {plano['metas_por_semana']} | início: {plano['inicio']} | dias sem estudo: {plano.get('dias_sem_estudo', [])}")
    print("semana  dias  teto  metas")
    for sid, dias, cap, n in resumo:
        print(f"{sid:>6}  {dias:>4}  {cap:>4}  {n:>5}")
    if sobra and "--cortar-excedente" in sys.argv:
        plano["fora_do_plano"] = sorted(set(plano.get("fora_do_plano", [])) | {m["id"] for m in sobra})
        json.dump(plano, open(opcao("--plano", PLANO), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"{len(sobra)} metas colocadas em fora_do_plano; rode de novo para simular/aplicar.")
        return
    if sobra:
        print(f"\nATENÇÃO: {len(sobra)} metas não cabem até a última semana de estudo:")
        tipos = collections.Counter(m["tipo"] for m in sobra)
        print("  por tipo:", dict(tipos))
        print("  primeiras:", [m["id"] for m in sobra[:6]], "...")
        print("  Aumente metas_por_semana, ajuste semanas em ajustes_por_semana ou liste ids em fora_do_plano.")
        sys.exit(2)
    if not aplicar:
        print("\n(simulação: nada foi gravado; use --aplicar)")
        return
    # "fora do plano" = escondida (mesma marca das metas antigas de Português); volta sozinha se ganhar registro
    for s_ in W:
        for m in s_["metas"]:
            if m["id"] in fora:
                m["legado"] = True; m["fora_do_plano"] = True
            elif m.get("fora_do_plano"):
                m.pop("legado", None); m.pop("fora_do_plano", None)
    for i, s in enumerate(W):
        if s["id"] in plano.get("semanas_fixas", ["S15"]): continue
        s["metas"] = novas[i]
        if i < w0: s["rg"] = False
        elif not any(m["tipo"] != "domingo" and not m.get("legado") for m in s["metas"]): s["rg"] = False
        elif s.get("rg") is False and i >= w0: s.pop("rg", None)
    crono["meta"]["replanejamento"] = {"data": plano["inicio"], "metas_por_semana": plano["metas_por_semana"],
                                       "dias_sem_estudo": plano.get("dias_sem_estudo", []), "fora_do_plano": plano.get("fora_do_plano", [])}
    open(opcao("--crono", CRONO), "w", encoding="utf-8").write(json.dumps(crono, ensure_ascii=False, indent=1))
    print("\ncronograma.json atualizado.")

if __name__ == "__main__":
    main()
