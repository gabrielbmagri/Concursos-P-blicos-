#!/usr/bin/env python3
"""Gera painel/index.html (autônomo) e o fragmento para Artifact a partir de dados/cronograma.json."""
import json, sys, pathlib
root = pathlib.Path(__file__).resolve().parent
src = json.load(open(root.parent / "dados" / "cronograma.json", encoding="utf-8"))
K = dict(ordem="o", bloco="b", materia="k", assunto="a", edital="e", tipo="t",
         itens_alvo="i", repeticoes="rp", o_que_fazer="w", fonte_teoria="ft", lei_seca="ls", guia="g", topicos="tp")
def meta(m):
    out = {"id": m["id"]}
    for a, b in K.items():
        v = m.get(a)
        if v not in (None, "", []) and not (a == "repeticoes" and v == 1):
            out[b] = v
    return out
data = {
    "curso": src["meta"]["concurso"].split(" (")[0],
    "prova": src["meta"]["prova"],
    "rev": {"iv": src["meta"]["revisoes"]["intervalos_dias"], "i": src["meta"]["revisoes"]["itens"]},
    "mat": {k: {"n": v["nome"], "p": v["prova"]} for k, v in src["meta"]["materias"].items()},
    "sem": [{"id": s["id"], "i": s["inicio"], "f": s["fim"], "fase": s["fase"], "fer": s["feriado"],
             "obs": s["observacao"], "m": [meta(m) for m in s["metas"]]} for s in src["semanas"]],
}
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
frag = (root / "template.html").read_text(encoding="utf-8").replace("__DATA__", blob)
out = sys.argv[1] if len(sys.argv) > 1 else None
if out:
    pathlib.Path(out).write_text(frag, encoding="utf-8")
head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>'
        '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>'
        '<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>'
        '<script src="firebase-config.js"></script>'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style></head><body>')
(root / "index.html").write_text(head + frag + "</body></html>", encoding="utf-8")
print("ok", len(frag) // 1024, "KB")
