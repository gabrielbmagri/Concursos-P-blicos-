#!/usr/bin/env python3
"""Monta os simulados da CPA para o painel.

Fontes em dados/cpa/fontes/sNN*.json (a alternativa certa vem em "certa" e as erradas em
"erradas", cada uma com o motivo). O script embaralha a posição da resposta certa de forma
equilibrada (A, B, C e D aparecem quase o mesmo número de vezes), valida tudo e grava
painel/cpa/simulados/sNN.json e painel/cpa/simulados/index.json.

Uso: python3 dados/cpa/montar.py
"""
import json, pathlib, random, re, sys, datetime
R = pathlib.Path(__file__).resolve().parent
OUT = R.parent.parent / "painel" / "cpa" / "simulados"
OUT.mkdir(parents=True, exist_ok=True)
L = "ABCD"
grupos = {}
for f in sorted((R / "fontes").glob("s*.json")):
    m = re.match(r"s(\d+)", f.stem)
    grupos.setdefault(int(m.group(1)), []).append(f)
meta = json.loads((R / "simulados.json").read_text(encoding="utf-8"))
index = []
erros = []
todas = []
for num, arqs in sorted(grupos.items()):
    qs = []
    for a in arqs:
        qs += json.loads(a.read_text(encoding="utf-8"))
    sid = f"S{num:02d}"
    rnd = random.Random(1000 + num)
    pos = [i % 4 for i in range(len(qs))]
    rnd.shuffle(pos)
    out = []
    for i, q in enumerate(qs, 1):
        tag = f"{sid}-{i:02d}"
        for k in ("pd", "contexto", "enunciado", "certa", "erradas", "gabarito"):
            if not q.get(k):
                erros.append(f"{tag}: falta {k}")
        if len(q.get("erradas", [])) != 3:
            erros.append(f"{tag}: precisa de 3 erradas")
            continue
        p = pos[i - 1]
        alts = [e[0] for e in q["erradas"]]
        motivos = [e[1] for e in q["erradas"]]
        alts.insert(p, q["certa"])
        motivos.insert(p, "")
        b = int(q["pd"].split(".")[0])
        if b not in (1, 2, 3, 4):
            erros.append(f"{tag}: pd inválido {q['pd']}")
        item = {"pd": q["pd"], "dif": q.get("dif", "Médio"), "nivel": q.get("nivel", ""),
                "contexto": q["contexto"], "enunciado": q["enunciado"], "alt": alts, "certa": L[p],
                "gabarito": q["gabarito"], "porque": {L[j]: motivos[j] for j in range(4) if motivos[j]},
                "dica": q.get("dica", "")}
        if q.get("caso"):
            item["caso"] = q["caso"]
            item["etapa"] = q.get("etapa", "")
        out.append(item)
    m = meta.get(sid, {})
    sim = {"id": sid, "titulo": m.get("titulo", f"Simulado {num}"), "descricao": m.get("descricao", ""),
           "criado": m.get("criado", datetime.date.today().isoformat()), "q": out}
    (OUT / f"{sid.lower()}.json").write_text(json.dumps(sim, ensure_ascii=False, indent=0), encoding="utf-8")
    blocos = [sum(1 for x in out if x["pd"].startswith(f"{b}.")) for b in (1, 2, 3, 4)]
    letras = {c: sum(1 for x in out if x["certa"] == c) for c in L}
    index.append({"id": sid, "titulo": sim["titulo"], "descricao": sim["descricao"], "criado": sim["criado"],
                  "n": len(out), "arquivo": f"simulados/{sid.lower()}.json",
                  "k": "".join(x["certa"] for x in out), "pd": [x["pd"] for x in out]})
    longa = sum(1 for x in out if len(x["alt"][L.index(x["certa"])]) > 1.12 * max(len(a) for j, a in enumerate(x["alt"]) if L[j] != x["certa"]))
    print(sid, len(out), "questões | blocos", blocos, "| gabarito", letras, "| certa bem mais longa:", longa)
    if longa > 10:
        erros.append(f"{sid}: a certa é bem mais longa que as outras em {longa} questões (máx. 10)")
    for i, x in enumerate(out, 1):
        todas.append((f"{sid}-{i:02d}", x))
# enunciados repetidos entre simulados (contexto + enunciado + certa parecidos)
def sh(t):
    w = re.findall(r"\w+", t.lower())
    return {" ".join(w[i:i + 4]) for i in range(max(1, len(w) - 3))}
S = [(tag, sh(x["contexto"] + " " + x["certa"])) for tag, x in todas]
for i in range(len(S)):
    for j in range(i + 1, len(S)):
        a, b = S[i][1], S[j][1]
        sim = len(a & b) / max(1, min(len(a), len(b)))
        if sim > 0.35:
            erros.append(f"parecidas demais: {S[i][0]} e {S[j][0]} ({sim:.0%})")
if "--cobertura" in sys.argv:
    cont = {}
    for tag, x in todas:
        k = ".".join(x["pd"].split(".")[:3])
        cont.setdefault(k, []).append(tag)
    for k in sorted(cont, key=lambda z: [int(p) for p in z.split(".")]):
        print(f"{k:10} {len(cont[k]):3}  {' '.join(cont[k])}")
(OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
if erros:
    print("\n".join(erros)); sys.exit(1)
print("ok")
