#!/usr/bin/env python3
"""Gera o PDF do resumo da CPA a partir de resumo.txt.

Formato de resumo.txt:
  # Bloco N | Nome do bloco
  ## Assunto
  - Termo: texto
  | célula | célula |   (a primeira linha da tabela é o cabeçalho)
  ^{x} vira expoente.

Uso: python3 dados/cpa/resumo/gerar.py  (gera painel/cpa/resumo-cpa.pdf)
"""
import html, os, re, subprocess, sys, tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", "..", ".."))
SAIDA = os.path.join(RAIZ, "painel", "cpa", "resumo-cpa.pdf")


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\^\{([^}]*)\}", r"<sup>\1</sup>", t)
    return t


def montar(txt):
    out, tabela, blocos = [], [], 0

    def fecha_tabela():
        if not tabela:
            return
        cab, *linhas = tabela
        h = "<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in cab) + "</tr></thead><tbody>"
        for ln in linhas:
            h += "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in ln) + "</tr>"
        out.append(h + "</tbody></table>")
        tabela.clear()

    for raw in txt.splitlines():
        ln = raw.rstrip()
        if ln.startswith("|"):
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            # nova tabela quando o número de colunas muda ou quando a linha parece cabeçalho de outra
            if tabela and len(cells) != len(tabela[0]):
                fecha_tabela()
            tabela.append(cells)
            continue
        fecha_tabela()
        if not ln.strip():
            continue
        if ln.startswith("# "):
            blocos += 1
            num, nome = [x.strip() for x in ln[2:].split("|", 1)]
            out.append(f'<section class="bloco{" primeiro" if blocos == 1 else ""}"><div class="bh"><span>{inline(num)}</span><h1>{inline(nome)}</h1></div>')
        elif ln.startswith("## "):
            out.append(f'<h2>{inline(ln[3:])}</h2>')
        elif ln.startswith("- "):
            corpo = ln[2:]
            m = re.match(r"^([^:]{1,70}):\s(.+)$", corpo)
            if m:
                out.append(f'<p class="it"><b>{inline(m.group(1))}:</b> {inline(m.group(2))}</p>')
            else:
                out.append(f'<p class="it">{inline(corpo)}</p>')
        else:
            out.append(f"<p>{inline(ln)}</p>")
    fecha_tabela()
    return "\n".join(out)


CSS = """
@page{size:A4;margin:15mm 15mm 17mm}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:Inter,'Liberation Sans',sans-serif;font-size:9.6pt;line-height:1.5;color:#17261e}
.capa{display:flex;align-items:flex-end;justify-content:space-between;border-bottom:2.5pt solid #0f6b46;padding:0 0 8pt;margin-bottom:14pt}
.capa h1{margin:0;font-size:25pt;line-height:1.05;letter-spacing:-.4pt;color:#0b3b29;font-weight:800}
.capa h1 small{display:block;font-size:11pt;letter-spacing:0;font-weight:500;color:#46604f;margin-top:4pt}
.capa .tag{font-size:8.5pt;color:#0f5a3c;background:#e6f4ec;border-radius:10pt;padding:3pt 9pt;font-weight:600}
.bloco{break-before:page}
.bloco.primeiro{break-before:auto}
.bh{background:#0f6b46;background:linear-gradient(120deg,#0b4f35,#17885a);color:#fff;border-radius:7pt;padding:10pt 14pt;margin:0 0 4pt}
.bh span{display:block;font-size:8pt;letter-spacing:1.6pt;text-transform:uppercase;opacity:.8;font-weight:600}
.bh h1{margin:1pt 0 0;font-size:16.5pt;font-weight:750;letter-spacing:-.2pt}
h2{font-size:11.6pt;color:#0b3b29;margin:14pt 0 5pt;padding:0 0 3pt;border-bottom:1pt solid #cfe6d8;font-weight:750;break-after:avoid}
h2::before{content:"";display:inline-block;width:4pt;height:10pt;background:#2ea36f;border-radius:1.5pt;margin-right:6pt;vertical-align:-1pt}
p{margin:0}
.it{position:relative;padding:1.6pt 0 1.6pt 10pt;break-inside:avoid}
.it::before{content:"";position:absolute;left:1pt;top:7.2pt;width:3.6pt;height:3.6pt;border-radius:50%;background:#2ea36f}
.it b{color:#0b4f35;font-weight:700}
sup{font-size:70%;line-height:0}
table{width:100%;border-collapse:separate;border-spacing:0;margin:4pt 0 6pt;font-size:9pt;break-inside:avoid;border:0.8pt solid #cfe6d8;border-radius:5pt;overflow:hidden}
th{background:#e6f4ec;color:#0b3b29;text-align:left;font-weight:700;padding:4pt 7pt;border-bottom:0.8pt solid #cfe6d8}
td{padding:3.5pt 7pt;border-bottom:0.6pt solid #e4efe8;vertical-align:top}
tr:last-child td{border-bottom:0}
td:first-child{font-weight:600;color:#0b4f35}
tbody tr:nth-child(even) td{background:#f7fbf9}
"""

FOOTER = """<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#7b9284;padding:0 15mm;display:flex;justify-content:space-between">
<span>Resumo CPA · Certificação Anbima</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>"""


def main():
    txt = open(os.path.join(AQUI, "resumo.txt"), encoding="utf-8").read()
    corpo = montar(txt)
    doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resumo CPA</title><style>{CSS}</style></head><body>
<div class="capa"><h1>Resumo CPA<small>Certificação Profissional Anbima</small></h1><span class="tag">Blocos 1 a 4</span></div>
{corpo}
</body></html>"""
    with tempfile.TemporaryDirectory() as d:
        hp = os.path.join(d, "resumo.html")
        open(hp, "w", encoding="utf-8").write(doc)
        if len(sys.argv) > 1 and sys.argv[1] == "--html":
            import shutil; shutil.copy(hp, sys.argv[2]); return
        js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://{hp}');await p.evaluate(()=>document.fonts.ready);await p.pdf({{path:{SAIDA!r},format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',
footerTemplate:{FOOTER!r},margin:{{top:'15mm',bottom:'17mm',left:'15mm',right:'15mm'}}}});await b.close()}})();"""
        jp = os.path.join(d, "pdf.js")
        open(jp, "w").write(js)
        subprocess.run(["node", jp], check=True, cwd="/tmp")
    print("gerado:", SAIDA)


if __name__ == "__main__":
    main()
