#!/usr/bin/env python3
"""Aplica ajustes de texto às fontes de um simulado.
Uso: python3 dados/cpa/ajustar.py s02 ajustes.json
ajustes.json: {"7": {"c": "nova certa", "e": {"0": "nova errada 1"}}} (número da questão no simulado)."""
import json, sys, pathlib
R = pathlib.Path(__file__).resolve().parent / "fontes"
sid, aj = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8"))
arqs = sorted(R.glob(f"{sid}*.json"))
dados = [json.loads(a.read_text(encoding="utf-8")) for a in arqs]
Q = [q for d in dados for q in d]
for n, p in aj.items():
    q = Q[int(n) - 1]
    if "c" in p: q["certa"] = p["c"]
    for i, t in p.get("e", {}).items(): q["erradas"][int(i)][0] = t
for a, d in zip(arqs, dados):
    a.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", len(aj), "ajustes")
