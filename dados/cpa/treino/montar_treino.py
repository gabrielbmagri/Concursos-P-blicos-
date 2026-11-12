#!/usr/bin/env python3
"""Monta o banco de treino por bloco (painel/cpa/treino/) a partir de dados/cpa/treino/b*.txt.

Formato de cada questão (separadas por linha em branco):
  ## <código do programa detalhado> <fácil|médio|difícil>
  Q: contexto
  P: enunciado
  + alternativa correta
  - distrator || por que está errado
  - distrator || por que está errado
  - distrator || por que está errado
  G: gabarito comentado
  D: frase curta para lembrar

As alternativas são embaralhadas de forma fixa (pela posição da questão), para a letra certa variar.
Questões novas devem ser acrescentadas no FIM do arquivo, para não mudar os números das anteriores.
"""
import glob, json, os, random, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "..", "..", "..", "painel", "cpa", "treino")
L = "ABCD"


def ler(path, bloco):
    txt = open(path, encoding="utf-8").read().strip()
    partes = [p.strip() for p in re.split(r"\n\s*\n", txt) if p.strip()]
    qs, erros = [], []
    for k, p in enumerate(partes, 1):
        q = {"alt_raw": []}
        for ln in p.splitlines():
            ln = ln.strip()
            if ln.startswith("## "):
                cod, dif = ln[3:].split()
                q["pd"], q["dif"] = cod, dif.capitalize()
            elif ln.startswith("Q: "): q["contexto"] = ln[3:]
            elif ln.startswith("P: "): q["enunciado"] = ln[3:]
            elif ln.startswith("+ "): q["alt_raw"].insert(0, (ln[2:], None))
            elif ln.startswith("- "):
                a, _, w = ln[2:].partition(" || ")
                q["alt_raw"].append((a, w))
            elif ln.startswith("G: "): q["gabarito"] = ln[3:]
            elif ln.startswith("D: "): q["dica"] = ln[3:]
            elif ln: erros.append(f"{os.path.basename(path)} q{k}: linha desconhecida: {ln[:60]}")
        falta = [c for c in ("pd", "dif", "contexto", "enunciado", "gabarito", "dica") if c not in q]
        if falta or len(q["alt_raw"]) != 4 or q["alt_raw"][0][1] is not None or any(not w for a, w in q["alt_raw"][1:]):
            erros.append(f"{os.path.basename(path)} q{k}: incompleta {falta} alts={len(q['alt_raw'])}")
            continue
        if not q["pd"].startswith(str(bloco)):
            erros.append(f"{os.path.basename(path)} q{k}: código {q['pd']} fora do bloco {bloco}")
        # letra certa equilibrada: em cada grupo de 4 questões, cada letra aparece uma vez
        grupo = list(range(4)); random.Random(f"grupo-{bloco}-{(k - 1) // 4}").shuffle(grupo)
        pos = grupo[(k - 1) % 4]
        dist = [1, 2, 3]; random.Random(f"treino-{bloco}-{k}").shuffle(dist)
        ordem = dist[:pos] + [0] + dist[pos:]
        alts = [q["alt_raw"][i] for i in ordem]
        certa = L[ordem.index(0)]
        porque = {L[j]: w for j, (a, w) in enumerate(alts) if w}
        # a certa não pode ser bem mais longa que a média dos distratores
        lc = len(q["alt_raw"][0][0]); ld = sum(len(a) for a, _ in q["alt_raw"][1:]) / 3
        if lc > ld * 1.35 + 12:
            erros.append(f"{os.path.basename(path)} q{k}: certa longa demais ({lc} x {ld:.0f})")
        qs.append({"pd": q["pd"], "dif": q["dif"], "nivel": "", "contexto": q["contexto"], "enunciado": q["enunciado"],
                   "alt": [a for a, _ in alts], "certa": certa, "gabarito": q["gabarito"], "porque": porque, "dica": q["dica"]})
    return qs, erros


def main():
    os.makedirs(SAIDA, exist_ok=True)
    idx, todos_erros, enun = [], [], set()
    for b in (1, 2, 3, 4):
        arqs = sorted(glob.glob(os.path.join(AQUI, f"b{b}*.txt")))
        qs = []
        for a in arqs:
            q, e = ler(a, b); qs += q; todos_erros += e
        for q in qs:
            chave = (q["contexto"][:80], q["enunciado"][:60])
            if chave in enun: todos_erros.append(f"bloco {b}: enunciado repetido: {q['enunciado'][:60]}")
            enun.add(chave)
        if not qs: continue
        sid = f"T{b}"
        json.dump({"id": sid, "titulo": f"Treino do bloco {b}", "q": qs}, open(os.path.join(SAIDA, f"b{b}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
        letras = {l: sum(1 for q in qs if q["certa"] == l) for l in L}
        idx.append({"id": sid, "b": b, "n": len(qs), "pd": [q["pd"] for q in qs], "arquivo": f"treino/b{b}.json"})
        print(f"bloco {b}: {len(qs)} questões, letras {letras}")
    json.dump(idx, open(os.path.join(SAIDA, "index.json"), "w", encoding="utf-8"), ensure_ascii=False)
    if todos_erros:
        print("\n".join(todos_erros)); sys.exit(1)


if __name__ == "__main__":
    main()
